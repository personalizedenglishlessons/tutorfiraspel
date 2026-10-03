-- 202610030008: Explicit grants for account_deletion_requests
--
-- Defense in depth: Supabase default privileges normally cover
-- authenticated on public tables, but make the grants explicit and
-- minimal. No DELETE grant — RLS blocks student deletes and admin
-- deletes happen through the admin_student_delete RPC (rows cascade).

grant select, insert, update on public.account_deletion_requests to authenticated;
