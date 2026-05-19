# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See **AGENTS.md** for full project context — architecture, commands, security rules, design system, and development protocols.

## Commonly Used Commands

### Development
- `npm run dev` - Start Vite dev server on http://localhost:3000 (network accessible)
- `npm run build` - Create production build in /dist
- `npm run preview` - Preview production build locally
- `npm run lint` - Run TypeScript type checking (tsc --noEmit)
- `npm run clean` - Remove /dist directory

### Supabase Setup
1. Copy `.env.example` to `.env.local` and fill in:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
2. In Supabase SQL Editor, run `setup.sql` to create tables, enable RLS, and set up triggers.
3. The dev server will hot-reload on changes to .env.local.

## High-Level Architecture

### Tech Stack
- React 19, Vite, TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`)
- Zustand for auth-only state (`src/lib/store.ts`)
- Supabase (Auth, Postgres, Realtime)
- Framer Motion for animations, Lucide React for icons, Recharts for charts

### Data Flow & State Management
- Authentication state is stored in a Zustand store (`src/lib/store.ts`).
- All other data state is kept in React hooks (useState) and synchronized with Supabase Realtime subscriptions.
- Data fetching and subscription logic lives in custom hooks in `src/lib/hooks/`:
    - `useDashboardData.ts`: Main dashboard data (employees, tasks, reports, etc.)
    - `useTaskOperations.ts`: Task mutations (create, update, delete, status change)
    - `useTeamManagement.ts`: Team membership RPC calls
- Modals call hooks to perform mutations; UI re-renders from hook state or Realtime updates.

### Directory Structure (key areas)
- `src/components/features/` - Main tab views (AssignedToMeBoard, TeamOperationsBoard, etc.)
- `src/components/modals/` - Modal dialogs (TaskAssignmentModal, ReportSubmissionModal, etc.)
- `src/lib/hooks/` - Custom hooks for data and operations
- `src/lib/supabase/` - Supabase client initialization
- `src/lib/types.ts` - TypeScript interfaces for backend data

### Security (Zero Trust)
- All cross-row mutations must go through Supabase RPC functions (SECURITY DEFINER).
- Row Level Security (RLS) policies restrict data access based on user relationships.
- Client-side deletions are limited to single documents; cascading deletes handled by server triggers.

For detailed architecture, commands, security rules, design system, and development protocols, refer to **AGENTS.md**.