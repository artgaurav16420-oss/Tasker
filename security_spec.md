# Security Spec

The actual security model is documented in `setup.sql` (RLS policies, RPC functions, triggers).
Refer to `AGENTS.md` for the zero-trust architecture summary.

Key facts (verified from code):
- **No static role columns.** Permissions are relational: `managerIds[]` on `users`, `managerId`/`employeeId` on `tasks`.
- **Cross-row mutations** require `supabase.rpc()` with SECURITY DEFINER (see `setup.sql` for function signatures).
- **RLS** enforces shadow-update prevention, status transition locks, and row-scoped visibility.
- **Client-side deletions** are single-document only; cascading cleanup is handled by DB triggers.
