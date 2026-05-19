# Auth Dashboard Flow

> 29 nodes · cohesion 0.12

## Key Concepts

- **Dashboard State Routing Shell** (10 connections) — `src/components/Dashboard.tsx`
- **Tasks Table** (8 connections) — `setup.sql`
- **Authentication Screen Flow** (5 connections) — `src/components/AuthScreen.tsx`
- **Personnel Roster Workload View** (5 connections) — `src/components/features/PersonnelRoster.tsx`
- **Supabase Database Schema** (5 connections) — `setup.sql`
- **Related-User RLS Access Model** (5 connections) — `setup.sql`
- **Assigned-to-Me Employee Board** (4 connections) — `src/components/features/AssignedToMeBoard.tsx`
- **Relational Role-Based Tabs** (4 connections) — `src/components/Dashboard.tsx`
- **Self-Assigned Personal Task Flow** (4 connections) — `src/components/features/PersonalTasksList.tsx`
- **Users Table** (4 connections) — `setup.sql`
- **App Auth Gate** (3 connections) — `src/App.tsx`
- **Command Overview Manager Metrics** (3 connections) — `src/components/features/CommandOverview.tsx`
- **Dashboard Task Operation Adapters** (3 connections) — `src/components/Dashboard.tsx`
- **Settings Identity and Connections Panel** (3 connections) — `src/components/features/SettingsPanel.tsx`
- **Logs Table** (3 connections) — `setup.sql`
- **Reports Table** (3 connections) — `setup.sql`
- **Team Management RPCs** (3 connections) — `setup.sql`
- **Deterministic Identity Avatar** (2 connections) — `src/components/Avatar.tsx`
- **Tactical Brand Logo** (2 connections) — `src/components/Logo.tsx`
- **React Vite Supabase Stack** (2 connections) — `package.json`
- **New User Profile Trigger** (2 connections) — `setup.sql`
- **Personal Tasks Table** (2 connections) — `setup.sql`
- **Task Status Security Policy** (2 connections) — `setup.sql`
- **Vite Build Runtime Config** (2 connections) — `vite.config.ts`
- **Tab Error Isolation Boundary** (1 connections) — `src/components/ErrorBoundary.tsx`
- *... and 4 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `metadata.json`
- `package.json`
- `setup.sql`
- `src/App.tsx`
- `src/components/AuthScreen.tsx`
- `src/components/Avatar.tsx`
- `src/components/Dashboard.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/Logo.tsx`
- `src/components/features/AssignedToMeBoard.tsx`
- `src/components/features/CommandOverview.tsx`
- `src/components/features/PersonalTasksList.tsx`
- `src/components/features/PersonnelRoster.tsx`
- `src/components/features/SettingsPanel.tsx`
- `src/main.tsx`
- `tsconfig.json`
- `vite-env.d.ts`
- `vite.config.ts`

## Audit Trail

- EXTRACTED: 68 (72%)
- INFERRED: 26 (28%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*