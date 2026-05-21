---
name: database-sync
description: Sync Supabase schema from setup.sql to production. Run when setup.sql changes or after editing RLS/RPCs.
license: MIT
---

# database-sync

Sync the local `setup.sql` to the Supabase project and verify everything applied correctly.

## Workflow

1. **Read `setup.sql`** — confirm current state
2. **Open Supabase SQL Editor** or run `supabase db push` if Supabase CLI is configured locally
3. **Verify** all expected objects exist:
   - Tables: `users`, `tasks`, `reports`, `personal_tasks`, `logs`
   - RPCs: `add_team_member`, `remove_team_member`, `member_join_team`, `member_leave_team`
   - Triggers: `update_tasks_updated_at`, `on_auth_user_created`, `enforce_employee_task_update`
   - RLS: enabled on all 5 tables with policies for CRUD per role
4. **Report** any missing objects

## Verification Commands

```sql
-- Check tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RPCs
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- Check triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers;

-- Check RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

## Key Constraints

- Never drop/recreate tables — setup.sql uses `CREATE TABLE IF NOT EXISTS`
- RPCs use `CREATE OR REPLACE FUNCTION` — safe to re-run
- Triggers use `DROP IF EXISTS` before `CREATE TRIGGER` — safe to re-run
- RLS policies use `CREATE POLICY` (no `OR REPLACE` for policies) — must drop first if changing
