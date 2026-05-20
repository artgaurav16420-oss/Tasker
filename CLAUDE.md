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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Tasker-main** (455 symbols, 606 relationships, 2 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Tasker-main/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Tasker-main/clusters` | All functional areas |
| `gitnexus://repo/Tasker-main/processes` | All execution flows |
| `gitnexus://repo/Tasker-main/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
