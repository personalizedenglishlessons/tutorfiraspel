-- Ensure the permission system functions and tables exist.
-- These were created directly in the database but never committed as migrations.
-- If the database is ever reset, these would be lost. This migration makes them durable.

-- 1. user_roles table (maps users to roles)
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student','teacher','admin','super_admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
drop policy if exists ur_self_read on public.user_roles;
create policy ur_self_read on public.user_roles for select using (auth.uid() = user_id or public.has_permission('students.read'::text));

-- 2. role_permissions table (maps roles to permissions)
create table if not exists public.role_permissions (
  role text not null check (role in ('student','teacher','admin','super_admin')),
  permission text not null,
  primary key (role, permission)
);

alter table public.role_permissions enable row level security;
drop policy if exists rp_admin_read on public.role_permissions;
create policy rp_admin_read on public.role_permissions for select using (public.has_permission('roles.manage'::text));

-- 3. current_user_role() - returns the current user's role
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select coalesce((select ur.role from public.user_roles ur where ur.user_id = auth.uid()), 'student');
$$;

-- 4. has_permission(p_permission text) - checks if current user has a permission
create or replace function public.has_permission(p_permission text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.role_permissions rp
      join public.user_roles ur on ur.role = rp.role
     where ur.user_id = auth.uid() and rp.permission = p_permission
  );
$$;

-- 5. my_permissions() - returns all permissions for the current user
create or replace function public.my_permissions()
returns text[]
language sql
security definer
set search_path = public
as $$
  select coalesce(array(
    select rp.permission
      from public.role_permissions rp
      join public.user_roles ur on ur.role = rp.role
     where ur.user_id = auth.uid()
  ), '{}');
$$;

-- 6. Seed default permissions if table is empty
insert into public.role_permissions (role, permission)
values
  ('admin','announcements.manage'),
  ('admin','attendance.manage'),
  ('admin','audit.read'),
  ('admin','certificates.issue'),
  ('admin','certificates.read'),
  ('admin','certificates.revoke'),
  ('admin','classes.manage'),
  ('admin','courses.read'),
  ('admin','courses.write'),
  ('admin','curriculum.manage'),
  ('admin','groups.manage'),
  ('admin','health.read'),
  ('admin','interventions.manage'),
  ('admin','progress.write'),
  ('admin','reports.read'),
  ('admin','settings.manage'),
  ('admin','students.manage'),
  ('admin','students.read'),
  ('admin','students.write'),
  ('admin','subscriptions.manage'),
  ('admin','teachers.read'),
  ('admin','teachers.write'),
  ('super_admin','announcements.manage'),
  ('super_admin','attendance.manage'),
  ('super_admin','audit.read'),
  ('super_admin','certificates.issue'),
  ('super_admin','certificates.read'),
  ('super_admin','certificates.revoke'),
  ('super_admin','classes.manage'),
  ('super_admin','courses.read'),
  ('super_admin','courses.write'),
  ('super_admin','curriculum.manage'),
  ('super_admin','groups.manage'),
  ('super_admin','health.read'),
  ('super_admin','interventions.manage'),
  ('super_admin','progress.write'),
  ('super_admin','reports.read'),
  ('super_admin','roles.manage'),
  ('super_admin','settings.manage'),
  ('super_admin','students.manage'),
  ('super_admin','students.read'),
  ('super_admin','students.write'),
  ('super_admin','subscriptions.manage'),
  ('super_admin','teachers.read'),
  ('super_admin','teachers.write'),
  ('teacher','attendance.manage'),
  ('teacher','certificates.read'),
  ('teacher','classes.manage'),
  ('teacher','interventions.manage'),
  ('teacher','progress.write'),
  ('teacher','reports.read'),
  ('teacher','students.read'),
  ('teacher','teachers.read')
on conflict (role, permission) do nothing;

-- 7. Grant execute on the permission functions to authenticated users
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.my_permissions() to authenticated;

-- 8. Ensure _visible_student_ids() exists (used by admin RPCs for scope checking)
create or replace function public._visible_student_ids()
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := public.current_user_role();
begin
  if v_role in ('admin', 'super_admin') then
    return null; -- unrestricted
  end if;
  if v_role = 'teacher' then
    return array(
      select gm.user_id
        from public.group_members gm
        join public.groups g on g.id = gm.group_id
       where g.teacher_id = auth.uid()
    );
  end if;
  return array[auth.uid()]; -- students only ever see themselves
end;
$$;

grant execute on function public._visible_student_ids() to authenticated;
