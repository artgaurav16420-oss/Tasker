# Graph Report - .  (2026-05-19)

## Corpus Check
- Corpus is ~19,761 words - fits in a single context window. You may not need a graph.

## Summary
- 242 nodes · 367 edges · 22 communities (16 shown, 6 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard Data Hooks|Dashboard Data Hooks]]
- [[_COMMUNITY_Auth Dashboard Flow|Auth Dashboard Flow]]
- [[_COMMUNITY_Security Domain Guidance|Security Domain Guidance]]
- [[_COMMUNITY_Build Dev Dependencies|Build Dev Dependencies]]
- [[_COMMUNITY_Task Feature Boards|Task Feature Boards]]
- [[_COMMUNITY_Supabase Data Layer|Supabase Data Layer]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_Roster Avatar Modals|Roster Avatar Modals]]
- [[_COMMUNITY_Auth Store Bootstrap|Auth Store Bootstrap]]
- [[_COMMUNITY_Runtime UI Dependencies|Runtime UI Dependencies]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_Edit Task Validation|Edit Task Validation]]
- [[_COMMUNITY_Product Metadata|Product Metadata]]
- [[_COMMUNITY_Personal Task Modal|Personal Task Modal]]
- [[_COMMUNITY_Claude Permissions|Claude Permissions]]
- [[_COMMUNITY_OpenCode Graphify Config|OpenCode Graphify Config]]
- [[_COMMUNITY_OpenCode Plugin Settings|OpenCode Plugin Settings]]
- [[_COMMUNITY_OpenCode Package|OpenCode Package]]
- [[_COMMUNITY_Vite Environment Types|Vite Environment Types]]
- [[_COMMUNITY_OpenCode Plugin Dependency|OpenCode Plugin Dependency]]

## God Nodes (most connected - your core abstractions)
1. `UserProfile` - 16 edges
2. `compilerOptions` - 15 edges
3. `Task` - 13 edges
4. `Dashboard State Routing Shell` - 10 edges
5. `supabase` - 9 edges
6. `Tasks Table` - 8 edges
7. `Task` - 7 edges
8. `Supabase Client` - 7 edges
9. `scripts` - 6 edges
10. `Avatar()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Client Status Transition Policy` --rationale_for--> `Zero-Trust Security`  [INFERRED]
  src/lib/hooks/useTaskOperations.ts → AGENTS.md
- `Graphify OpenCode Plugin` --semantically_similar_to--> `Claude Local Tool Permissions`  [INFERRED] [semantically similar]
  .opencode/plugins/graphify.js → .claude/settings.local.json
- `Tasker Design System` --rationale_for--> `TeamOperationsBoard`  [INFERRED]
  AGENTS.md → src/components/features/TeamOperationsBoard.tsx
- `Tasker Design System` --rationale_for--> `TaskAssignmentModal`  [INFERRED]
  AGENTS.md → src/components/modals/TaskAssignmentModal.tsx
- `Unified User Model` --rationale_for--> `UserProfile`  [EXTRACTED]
  AGENTS.md → src/lib/types.ts

## Hyperedges (group relationships)
- **Relational Team Access Model** — setup_users_table, setup_team_management_rpcs, setup_rls_related_access, dashboard_relational_role_tabs, settingspanel_identity_connections [INFERRED 0.95]
- **Task Data Security Flow** — setup_tasks_table, setup_reports_table, setup_logs_table, setup_task_status_security, assigned_board_employee_assignment_view, commandoverview_manager_metrics [INFERRED 0.85]
- **Dashboard Feature Routing Flow** — dashboard_state_routing_shell, assigned_board_employee_assignment_view, commandoverview_manager_metrics, personaltasks_self_assigned_flow, personnelroster_team_member_workload, settingspanel_identity_connections [EXTRACTED 1.00]
- **Realtime Data Model** — useDashboardData_useDashboardData, store_subscribeProfile, client_supabase, types_UserProfile, types_Task, types_Report, types_PersonalTask [INFERRED 0.85]
- **Task Lifecycle Flow** — TaskAssignmentModal_TaskAssignmentModal, EditTaskModal_EditTaskModal, TeamOperationsBoard_TeamOperationsBoard, TaskDetailsModal_TaskDetailsModal, useTaskOperations_useTaskOperations, types_Task [INFERRED 0.85]
- **Zero Trust Team Management** — useTeamManagement_useTeamManagement, useTeamManagement_team_rpc_flow, AGENTS_zero_trust_security, AGENTS_unified_user_model, security_spec_security_model [INFERRED 0.95]

## Communities (22 total, 6 thin omitted)

### Community 0 - "Dashboard Data Hooks"
Cohesion: 0.12
Nodes (23): Dashboard(), Logo(), LogoProps, Props, SettingsPanel(), SettingsPanelProps, useDashboardData(), useSessionActions() (+15 more)

### Community 1 - "Auth Dashboard Flow"
Cohesion: 0.12
Nodes (29): App Auth Gate, Assigned-to-Me Employee Board, Authentication Screen Flow, Deterministic Identity Avatar, Command Overview Manager Metrics, Relational Role-Based Tabs, Dashboard State Routing Shell, Dashboard Task Operation Adapters (+21 more)

### Community 2 - "Security Domain Guidance"
Cohesion: 0.12
Nodes (22): Auth-Only Zustand Store, Tasker Design System, Unified User Model, Zero-Trust Security, Claude Architecture Guidance, EditTaskModal, Task Priority And Status Validation, EmployeeTasksModal (+14 more)

### Community 3 - "Build Dev Dependencies"
Cohesion: 0.09
Nodes (21): devDependencies, global-agent, https-proxy-agent, rimraf, supabase, tailwindcss, @types/node, @types/react (+13 more)

### Community 4 - "Task Feature Boards"
Cohesion: 0.13
Nodes (8): Props, KPICardProps, PriorityRowProps, Props, Props, Task, getPriorityStyle(), Props

### Community 5 - "Supabase Data Layer"
Cohesion: 0.14
Nodes (17): NewPersonalTaskModal, ReportSubmissionModal, Local Network Deployment Guide, TaskDetailsModal, Task Audit Trail, Supabase Client, fetchProfile, handleSession (+9 more)

### Community 6 - "TypeScript Compiler Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, allowJs, isolatedModules, jsx, lib, module, moduleDetection (+8 more)

### Community 7 - "Roster Avatar Modals"
Cohesion: 0.24
Nodes (7): Avatar(), AvatarProps, getColor(), getInitials(), Props, NewTaskForm, Props

### Community 8 - "Auth Store Bootstrap"
Cohesion: 0.27
Nodes (8): AuthState, fetchProfile(), handleSession(), initAuth(), subscribeProfile(), useAuthStore, App(), root

### Community 9 - "Runtime UI Dependencies"
Cohesion: 0.20
Nodes (10): dependencies, lucide-react, motion, react, react-dom, recharts, @supabase/supabase-js, @tailwindcss/vite (+2 more)

### Community 10 - "Error Boundary"
Cohesion: 0.29
Nodes (3): ErrorBoundary, Props, State

### Community 11 - "Edit Task Validation"
Cohesion: 0.29
Nodes (3): Props, VALID_PRIORITIES, VALID_STATUSES

### Community 12 - "Product Metadata"
Cohesion: 0.40
Nodes (4): description, majorCapabilities, name, requestFramePermissions

### Community 15 - "OpenCode Graphify Config"
Cohesion: 0.67
Nodes (3): Claude Local Tool Permissions, Graphify OpenCode Plugin, OpenCode Plugin Configuration

## Knowledge Gaps
- **96 isolated node(s):** `name`, `description`, `requestFramePermissions`, `majorCapabilities`, `name` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Task` connect `Security Domain Guidance` to `Supabase Data Layer`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `UserProfile` connect `Dashboard Data Hooks` to `Auth Store Bootstrap`, `Edit Task Validation`, `Task Feature Boards`, `Roster Avatar Modals`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `description`, `requestFramePermissions` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard Data Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.12051282051282051 - nodes in this community are weakly interconnected._
- **Should `Auth Dashboard Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.11576354679802955 - nodes in this community are weakly interconnected._
- **Should `Security Domain Guidance` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Should `Build Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._