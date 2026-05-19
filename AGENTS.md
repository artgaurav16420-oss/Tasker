# Tasker — Universal LLM Context

All AI agents working in this codebase must follow these rules. No exceptions.

---

## Tech Stack
- React 19, Vite, TypeScript, Tailwind CSS v4 (no PostCSS config — `@tailwindcss/vite` plugin)
- Zustand (`src/lib/store.ts`) — **auth-only**. All data state lives in hook-local `useState` + Realtime subscriptions
- Supabase (Auth, Postgres, Realtime)
- Framer Motion (`motion/react`), Lucide React (icons), Recharts (charts)
- `@tailwindcss/vite`, `@vitejs/plugin-react`
- `@/` path alias maps to project root (not `src/`)

## Entrypoint & Module Layout
```
index.html → src/main.tsx → App.tsx → AuthScreen | Dashboard
```
- `Dashboard.tsx`: state-routing shell. Renders feature components from `src/components/features/` and modals from `src/components/modals/`
- Data hooks in `src/lib/hooks/`: `useDashboardData`, `useTaskOperations`, `useTeamManagement`
- Supabase client: `src/lib/supabase/client.ts`

## Commands
```bash
npm run dev      # Vite dev server on port 3000, host 0.0.0.0
npm run build    # production build
npm run preview  # preview production build locally
npm run lint     # TypeScript type-check only (tsc --noEmit), NOT a linter
npm run clean    # Uses rimraf — works cross-platform
```
No test framework. No CI pipeline.

## Environment
- Active env file: `.env.local` (not `.env`). `.gitignore` covers `.env*`.
- Required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `DISABLE_HMR=true` disables Hot Module Replacement (useful when agent edits trigger unwanted reloads)

## Setup
1. Run `setup.sql` in Supabase SQL Editor — creates 5 tables: `users`, `tasks`, `reports`, `personal_tasks`, `logs` with RLS, triggers, and RPC functions
2. Create `.env.local` from `.env.example` with Supabase credentials
3. `npm install && npm run dev`

---

## The Unified User Model (NO Static Roles)

**Adding `role: 'manager'` or `role: 'employee'` is strictly forbidden.**

Permissions are relational, not static:
- **Manager**: `uid` appears in task `managerId` OR in user's `managerIds` array
- **Employee**: `uid` appears in task `employeeId`
- A user can be BOTH simultaneously

UI dynamically shows:
- "Team Operations" tab if user is linked as a manager to anyone
- "Assigned to Me" tab if tasks are assigned to them

---

## RPC Functions (Team Management)

Call via `supabase.rpc()`. **Never** update foreign rows directly — RLS blocks it.

| Function | Purpose |
|----------|---------|
| `add_team_member(admin_uid, member_uid)` | Manager adds operative |
| `remove_team_member(admin_uid, member_uid)` | Manager removes operative |
| `member_join_team(superior_uid)` | Operative joins a manager |
| `member_leave_team(superior_uid)` | Operative leaves a manager |

All accept **email or UUID string** for `resolveUserId()` in `useTeamManagement`.

---

## Security (Zero-Trust)

- Cross-row mutations **must** use `supabase.rpc()` with SECURITY DEFINER. Direct client updates on foreign rows fail under RLS.
- Client-side deletions: single-document only. No cascading deletes from UI.
- Task status `'completed'` can only be set by the task's manager (`auth.uid() === managerId`). Employees may only set `'in-progress'` or `'in-review'`.
- Reports can only be created by the task's assigned employee or manager.
- Database triggers handle all cascading cleanups server-side.

---

## Design System

- **Colors**: `slate` (text/backgrounds), `emerald` (primary action), `sky`/`orange`/`indigo` for status accents
- **Typography**: `font-mono` (JetBrains Mono) + `tracking-widest` for technical labels; `font-serif` (Playfair Display) **italic** for headers
- **Zero-Hallucination Policy**: Do not invent new UI designs, color schemes, or layouts. Stick strictly to this design system.
- **Animations**: All modals and list transitions **must** use `AnimatePresence` + `motion.div` from `motion/react`

---

## Development Protocols

- **State mutation**: Never mutate React state arrays in place (`.sort()`, `.push()`). Always spread first: `[...arr].sort()`
- **Realtime subscriptions**: Do not put high-frequency dependencies (`myTasks`) in `useEffect` deps arrays that cause channel teardowns. Memoize IDs, manage channel lifecycles with refs.
- **Error boundaries**: Each Dashboard tab is wrapped in its own `<ErrorBoundary>` for isolated error handling.

---

## Features & Modals

**Features** (`src/components/features/`): `AssignedToMeBoard`, `TeamOperationsBoard`, `PersonalTasksList`, `CommandOverview`, `PersonnelRoster`, `SettingsPanel`

**Modals** (`src/components/modals/`): `TaskAssignmentModal`, `ReportSubmissionModal`, `EditTaskModal`, `EmployeeTasksModal`, `NewPersonalTaskModal`, `TaskDetailsModal`

**Data Flow**: Dashboard fetches via hooks → Realtime updates store → Modals call hooks for mutations → UI renders from store

