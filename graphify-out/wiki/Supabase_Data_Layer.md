# Supabase Data Layer

> 17 nodes · cohesion 0.14

## Key Concepts

- **Supabase Client** (7 connections) — `src/lib/supabase/client.ts`
- **useDashboardData** (5 connections) — `src/lib/hooks/useDashboardData.ts`
- **TaskDetailsModal** (3 connections) — `src/components/modals/TaskDetailsModal.tsx`
- **fetchProfile** (3 connections) — `src/lib/store.ts`
- **handleSession** (3 connections) — `src/lib/store.ts`
- **subscribeProfile** (3 connections) — `src/lib/store.ts`
- **Report** (3 connections) — `src/lib/types.ts`
- **Task Audit Trail** (2 connections) — `src/components/modals/TaskDetailsModal.tsx`
- **PersonalTask** (2 connections) — `src/lib/types.ts`
- **Realtime State Synchronization** (2 connections) — `src/lib/hooks/useDashboardData.ts`
- **useTeamManagement** (2 connections) — `src/lib/hooks/useTeamManagement.ts`
- **NewPersonalTaskModal** (1 connections) — `src/components/modals/NewPersonalTaskModal.tsx`
- **ReportSubmissionModal** (1 connections) — `src/components/modals/ReportSubmissionModal.tsx`
- **Local Network Deployment Guide** (1 connections) — `SETUP.md`
- **initAuth** (1 connections) — `src/lib/store.ts`
- **AuditLog** (1 connections) — `src/lib/types.ts`
- **useSessionActions** (1 connections) — `src/lib/hooks/useSessionActions.ts`

## Relationships

- No strong cross-community connections detected

## Source Files

- `SETUP.md`
- `src/components/modals/NewPersonalTaskModal.tsx`
- `src/components/modals/ReportSubmissionModal.tsx`
- `src/components/modals/TaskDetailsModal.tsx`
- `src/lib/hooks/useDashboardData.ts`
- `src/lib/hooks/useSessionActions.ts`
- `src/lib/hooks/useTeamManagement.ts`
- `src/lib/store.ts`
- `src/lib/supabase/client.ts`
- `src/lib/types.ts`

## Audit Trail

- EXTRACTED: 35 (85%)
- INFERRED: 6 (15%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*