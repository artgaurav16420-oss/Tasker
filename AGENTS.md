Karpathy Guidelines v3.7 MANDATORY: For all AI operations in this project, you MUST follow karpathy-guidelines.md as the primary behavioral ruleset.

# Tasker — Universal LLM Context

All AI agents working in this codebase must follow these rules. No exceptions.

## Quick Reference — Karpathy Rules (condensed)
- **R1 Security**: User input → dangerous primitive = HALT
- **R2 Simplify**: No unrequested abstractions; prefer stdlib
- **R3 Touch Minimum**: Don't improve adjacent code; match existing style
- **R4 Verify**: Define success criterion before coding; loop until passes
- **R5 Observable**: Document perf/failure/API/UI changes before implementing
- **R6 Design**: ROI check before refactors; smallest fix first for bugs; prefer extending existing infra
- **R7 Non-Dev Overrides**: USER_VERIFY default; approval gates for external state; destructive ops need "yes"
- **Triviality Check**: Skip full verification only for <20 lines, no logic changes, no new imports/branches

---

## OpenCode Config
- `.opencode/opencode.json`: Plugins incl. supabase-mcp, playwright-mcp; permissions (.env* ask, npm commands ask)
- Base skills auto-loaded: `karpathy-guidelines`, `caveman`, `auto-skill-select`
- Task skills auto-matched from `.skills-index.json` — re-runs on every task change
- Graphify knowledge graph at `graphify-out/`. Use `graphify query "<question>"` (scoped subgraph) instead of grepping raw files. Read `GRAPH_REPORT.md` only for broad architecture.

---

## Tech Stack
- React 19, Vite 6, TypeScript 5.8, Tailwind CSS v4 (`@tailwindcss/vite` plugin, **no** PostCSS config)
- Zustand (`src/lib/store.ts` + `useThemeStore.ts`) — auth + theme only. All data state lives in hook-local `useState` + Realtime subscriptions
- Supabase (Auth, Postgres, Realtime). Auth uses `sessionStorage` — sessions don't survive tab close.
- Framer Motion (`motion/react`), Lucide React (icons), Recharts (charts)
- `@/` path alias maps to project root (not `src/`)
- Logger (`src/lib/logger.ts`): dev-only console output. Use `log.error()`, `log.warn()`, `log.info()` — no raw `console.*` in app code.

## Entrypoint & Module Layout
```
index.html → src/main.tsx → App.tsx → AuthScreen | Dashboard
```
- `Dashboard.tsx`: state-routing shell. Renders feature components from `src/components/features/` and modals from `src/components/modals/`
- Data hooks in `src/lib/hooks/`: `useDashboardData`, `useTaskOperations`, `useTeamManagement`, `useThemeStore`, `useDashboardModals`
- Shared UI components in `src/components/`: `Logo`, `Avatar`, `Skeleton`, `SkipLink`, `ErrorBoundary`
- Supabase client: `src/lib/supabase/client.ts`
- Types: `src/lib/types.ts`
- Error mapping: `src/lib/errors.ts` — maps Postgres error codes to user-facing messages

## Commands
```bash
npm run dev      # Vite dev server on port 3000, host 0.0.0.0 (cross-env)
npm run build    # production build
npm run preview  # preview production build locally
npm run lint     # TypeScript type-check only (tsc --noEmit). No ESLint/Prettier.
npm run test     # Vitest watch mode
npm run test:run # Vitest single run
npm run test:coverage # Vitest with coverage (v8 provider, lcov+text)
npm run clean    # rimraf dist
```
- `DISABLE_HMR=true` disables HMR — set when agent edits trigger unwanted reloads.
- Dev server proxies `/rest/v1`, `/auth/v1`, `/realtime/v1`, `/storage/v1` to local Supabase at `http://10.34.2.206:54421`.

## Environment
- Active env file: `.env.local` (not `.env`). `.gitignore` covers `.env*`.
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Optional: `VITE_ORG_EMAIL_DOMAIN` (default `rrcat.gov.in`) — appended to partial email inputs in team management

## Setup
1. Run `setup.sql` in Supabase SQL Editor — creates 5 tables: `users`, `tasks`, `reports`, `personal_tasks`, `logs` with RLS, triggers, and RPC functions
2. Create `.env.local` from `.env.example` with Supabase credentials
3. `npm install && npm run dev`

## Testing (Vitest)
- Framework: Vitest 3 + jsdom + `@testing-library/react` 16
- Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom/vitest`)
- Custom render: `src/test/utils.tsx` wraps render with Providers
- Patterns: `src/**/*.test.{ts,tsx}`
- CSS disabled in tests (`css: false`). Mocks reset between tests (`mockReset: true`).

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
- Task status `'completed'` can only be set by the task's manager (`auth.uid() === managerId`). Employees may set `'todo'`, `'in-progress'`, or `'in-review'`.
- Reports can only be created by the task's assigned employee or manager.
- Database triggers handle cascading cleanups server-side. Trigger `check_employee_task_update` prevents employees from modifying non-status fields.

---

## Design System

- **Colors**: `slate` (text/backgrounds), `emerald` (primary action), `sky`/`orange`/`indigo` for status accents
- **Typography**: `font-mono` (JetBrains Mono) for all text across the entire app. Font weight (`font-black`, `font-bold`, `font-normal`), size (`text-xs` through `text-2xl`), and letter-spacing (`tracking-widest`, `tracking-tight`) provide visual hierarchy.
- **Zero-Hallucination Policy**: Do not invent new UI designs, color schemes, or layouts. Stick strictly to this design system.
- **Animations**: All modals and list transitions **must** use `AnimatePresence` + `motion.div` from `motion/react`
- **Dark Mode**: Tailwind `dark:` variants throughout. Toggle via `useThemeStore.getState().toggleTheme()`.

---

## Development Protocols

- **State mutation**: Never mutate React state arrays in place (`.sort()`, `.push()`). Always spread first: `[...arr].sort()`
- **Realtime subscriptions**: Do not put high-frequency dependencies (`myTasks`) in `useEffect` deps arrays that cause channel teardowns. Memoize IDs, manage channel lifecycles with refs.
- **Error boundaries**: Each Dashboard tab is wrapped in its own `<ErrorBoundary>` for isolated error handling.

---

## Features & Modals

**Features** (`src/components/features/`): `AssignedToMeBoard`, `TeamOperationsBoard`, `PersonalTasksList`, `CommandOverview`, `PersonnelRoster`, `SettingsPanel`

**Modals** (`src/components/modals/`): `TaskAssignmentModal`, `ReportSubmissionModal`, `EditTaskModal`, `EmployeeTasksModal`, `NewPersonalTaskModal`, `TaskDetailsModal`

**Data Flow**: Dashboard fetches via hooks → Realtime subscriptions → Modals call hooks for mutations → UI renders from hook-local state
