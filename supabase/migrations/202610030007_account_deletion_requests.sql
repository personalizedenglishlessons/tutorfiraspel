-- 202610030007: In-app account deletion requests (PDPL data-subject right)
--
-- Students can request deletion of their account and data from the
-- platform settings (legal.html §6 promises this). The request creates
-- a row the admin sees and actions via the existing admin_student_delete
-- RPC (hard delete; certificates remain verifiable). Request rows
-- cascade away when the auth.users row is deleted.
--
-- student_request_deletion(): SECURITY INVOKER — RLS guarantees the
--   caller can only insert a row for themselves, and only when
--   authenticated. Idempotent while a request is pending.

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','completed','dismissed')),
  handled_by uuid references auth.users(id),
  handled_at timestamptz
);

create index if not exists idx_acct_del_pending
  on public.account_deletion_requests (status, requested_at) where (status = 'pending');

alter table public.account_deletion_requests enable row level security;

-- Students: see + create their own requests
create policy acct_del_own_select
  on public.account_deletion_requests for select
  to authenticated
  using (user_id = auth.uid());

create policy acct_del_own_insert
  on public.account_deletion_requests for insert
  to authenticated
  with check (user_id = auth.uid());

-- Students may NOT update/delete (no taking back silently — message us
-- on WhatsApp instead; admin can dismiss).

-- Admins: full access via students.manage
create policy acct_del_admin_all
  on public.account_deletion_requests for all
  to authenticated
  using (has_permission('students.manage'::text))
  with check (has_permission('students.manage'::text));

-- Student-facing RPC: insert a pending request for the caller.
create or replace function public.student_request_deletion()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_existing uuid;
begin
  if auth.uid() is null then
    return jsonb_build_object('error', 'not_authenticated');
  end if;

  select id into v_existing
    from account_deletion_requests
   where user_id = auth.uid() and status = 'pending'
   limit 1;

  if v_existing is not null then
    return jsonb_build_object('ok', true, 'already_pending', true);
  end if;

  insert into account_deletion_requests (user_id) values (auth.uid());
  return jsonb_build_object('ok', true, 'already_pending', false);
end;
$$;

grant execute on function public.student_request_deletion() to authenticated;

-- Admin RPC: list pending requests with student identity.
create or replace function public.admin_deletion_requests()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not has_permission('students.manage'::text) then
    return jsonb_build_object('error', 'permission_denied');
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', r.id,
      'user_id', r.user_id,
      'requested_at', r.requested_at,
      'name', p.full_name,
      'email', u.email
    ) order by r.requested_at)
    from account_deletion_requests r
    left join public.student_profiles p on p.user_id = r.user_id
    left join auth.users u on u.id = r.user_id
    where r.status = 'pending'
  ), '[]'::jsonb);
end;
$$;

-- Admin RPC: dismiss a request (keep the student, mark handled).
create or replace function public.admin_deletion_dismiss(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not has_permission('students.manage'::text) then
    return jsonb_build_object('error', 'permission_denied');
  end if;

  update account_deletion_requests
     set status = 'dismissed', handled_by = auth.uid(), handled_at = now()
   where id = p_request_id and status = 'pending';

  if not found then
    return jsonb_build_object('error', 'not_found');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.admin_deletion_requests() to authenticated;
grant execute on function public.admin_deletion_dismiss(uuid) to authenticated;
