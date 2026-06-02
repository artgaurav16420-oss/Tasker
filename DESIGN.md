---
description: "Tactical task management system with military operations metaphor. Light/dark canvas with emerald primary accent, slate neutrals, and status colors (sky/orange/indigo). Dense technical typography using JetBrains Mono. Hairline-bordered cards with subtle colored shadows. Framer Motion spring animations throughout."
---

# Tasker — Design System

## 1. Visual Theme & Atmosphere

**Mood**: Tactical operations center — precise, authoritative, mission-focused.
**Density**: Data-rich but breathable. Information hierarchy through typography weight and color, not layout complexity.
**Philosophy**: Every element serves operational clarity. No decorative flourishes that don't reinforce the tactical metaphor.

**Design Language**:
- Tasks = "Operations", "Assignments", "Objectives"
- Creating = "Deploy", "Initialize"
- Reports = "Field Reports", "Transmissions", "Telemetry"
- Deletion = "Terminate", "Purge"
- Sections = "Command Center", "Tactical Display", "Threat Matrix"

## 2. Color Palette & Roles

### Canvas & Surfaces
| Token | Value | Role |
|-------|-------|------|
| `--color-canvas` | `#f8fafc` (slate-50) | Page background |
| `--color-surface-1` | `#ffffff` (white) | Primary card/modal surface |
| `--color-surface-2` | `#f8fafc` (slate-50) | Secondary/alternate surface |
| `--color-surface-3` | `#f1f5f9` (slate-100) | Tertiary/inset surface |
| `--color-hairline` | `#e2e8f0` (slate-200) | Default border |
| `--color-hairline-soft` | `#f1f5f9` (slate-100) | Subtle divider |

### Ink (Text)
| Token | Value | Role |
|-------|-------|------|
| `--color-ink-primary` | `#0f172a` (slate-900) | Headings, primary text |
| `--color-ink-secondary` | `#64748b` (slate-500) | Subtitles, secondary text |
| `--color-ink-muted` | `#94a3b8` (slate-400) | Labels, metadata, placeholders |
| `--color-ink-inverse` | `#ffffff` (white) | Text on dark/colored backgrounds |

### Accent (Primary Action)
| Token | Value | Role |
|-------|-------|------|
| `--color-accent` | `#10b981` (emerald-500) | Primary buttons, active states, status dots |
| `--color-accent-hover` | `#34d399` (emerald-400) | Button hover |
| `--color-accent-soft` | `#d1fae5` (emerald-50) | Hover backgrounds, soft tints |
| `--color-accent-border` | `#059669` (emerald-600) | Badge borders, focus rings |

### Semantic Colors
| Token | Value | Role |
|-------|-------|------|
| `--color-success` | `#10b981` (emerald-500) | Completed, active, resolved |
| `--color-warning` | `#f59e0b` (amber-500) | Pending, caution |
| `--color-danger` | `#f97316` (orange-500) | Overdue, critical, delete |
| `--color-danger-deep` | `#ea580c` (orange-600) | Critical priority, urgent |
| `--color-info` | `#0ea5e9` (sky-500) | In-progress, info |
| `--color-review` | `#6366f1` (indigo-500) | In-review, pending review |

### Avatar Colors (deterministic from name hash)
`#10b981`, `#059669`, `#0891b2`, `#0284c7`, `#4f46e5`, `#7c3aed`, `#a855f7`, `#d946ef`, `#db2777`, `#e11d48`, `#ea580c`, `#ca8a04`

## 3. Typography Rules

### Font Families
| Variable | Font | Use |
|----------|------|-----|
| `--font-mono` | JetBrains Mono, monospace | All text — labels, headings, body, buttons, metadata |

**Typography is mono-only.** No sans-serif or serif fonts are loaded. Visual hierarchy comes from weight (`font-black`, `font-bold`, `font-normal`), size (`text-xs` through `text-2xl`), and letter-spacing (`tracking-widest`, `tracking-tight`).

### Type Scale
| Name | Size | Weight | Line-height | Letter-spacing | Use |
|------|------|--------|-------------|----------------|-----|
| Display | 2rem (32px) | 700 | 1.2 | -0.025em | Page headings (h1) |
| Heading | 1.5rem (24px) | 700 | 1.3 | -0.025em | Section headings (h2) |
| Subheading | 1.25rem (20px) | 700 | 1.4 | -0.015em | Sub-sections (h3) |
| Body | 1rem (16px) | 400 | 1.6 | 0 | Prose, descriptions |
| Small | 0.875rem (14px) | 400 | 1.5 | 0 | Secondary text |
| Label | 0.75rem (12px) | 900 | 1 | 0.2em–0.4em | Mono labels, uppercase |
| Button | 0.75rem (12px) | 700 | 1 | 0.2em–0.3em | Mono button text, uppercase |
| Badge | 0.75rem (12px) | 900 | 1 | 0.15em | Mono badge text, uppercase |

### Typography Rules
- **Display headings**: `font-mono text-2xl font-bold tracking-tight` (add `-tracking-[0.025em]` for polish)
- **Section labels**: `font-mono text-xs font-black uppercase tracking-[0.35em] text-slate-400` — always paired with `w-3 h-3 bg-emerald-500` diamond indicator
- **Button text**: `font-mono text-xs font-bold uppercase tracking-[0.2em]`
- **Badge text**: `font-mono text-xs font-black uppercase tracking-widest`
- **Input labels**: `font-mono text-xs font-black uppercase tracking-widest text-slate-400`
- **Task titles**: `font-mono text-xl text-slate-900` (active), `font-mono text-base text-slate-700` (completed)

## 4. Component Stylings

### Buttons
| Type | Background | Text | Border | Radius | Shadow |
|------|-----------|------|--------|--------|--------|
| Primary | `bg-emerald-500` | `text-slate-950` | none | `rounded-xl` | `shadow-lg shadow-emerald-500/10` |
| Primary hover | `bg-emerald-400` | `text-slate-950` | none | `rounded-xl` | `shadow-xl shadow-emerald-500/20` |
| Secondary | `bg-white` | `text-slate-600` | `border-slate-200` | `rounded-xl` | `shadow-sm` |
| Secondary hover | `bg-slate-50` | `text-slate-900` | `border-slate-200` | `rounded-xl` | `shadow-sm` |
| Danger | `bg-orange-50` | `text-orange-600` | `border-orange-100` | `rounded-xl` | none |
| Danger hover | `bg-orange-100` | `text-orange-700` | `border-orange-200` | `rounded-xl` | none |
| Nav active | `bg-emerald-500` | `text-slate-950` | none | `rounded-xl` | `shadow-lg shadow-emerald-500/20` |
| Nav inactive | transparent | `text-slate-600` | `border-transparent` | `rounded-xl` | `shadow-sm` |

All buttons: `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white`

### Cards
| Type | Background | Border | Radius | Shadow |
|------|-----------|--------|--------|--------|
| Active task | `bg-white` | `border-slate-200` + `border-l-4 border-l-emerald-500` | `rounded-2xl` | `shadow-sm` → `shadow-xl` on hover |
| Completed task | `bg-slate-50/50` | `border-slate-200/60` | `rounded-2xl` | none |
| KPI card | `bg-white` | `border-slate-100` | `rounded-2xl` | `shadow-sm` → `shadow-xl` on hover |
| Personnel card | `bg-white` | `border-slate-200` | `rounded-3xl` | `shadow-sm` → `shadow-2xl` on hover |
| Dark panel | `bg-slate-900` | none | `rounded-3xl` | `shadow-xl shadow-slate-900/20` |

### Inputs
- Background: `bg-slate-50` → `bg-white` on focus
- Border: `border-slate-200` → `border-emerald-500` on focus
- Ring: `focus:ring-4 focus:ring-emerald-500/5`
- Radius: `rounded-xl`
- Padding: `py-4 px-4` (or `pl-12` with icon)
- Text: `text-sm` (or `font-mono text-base` for form modals)

### Modals
- Backdrop: `bg-slate-900/60 backdrop-blur-xl`
- Container: `bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden`
- Width: `max-w-2xl` (forms) or `max-w-4xl` (details)
- Top accent: `absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent`
- Header: `p-8 md:p-10 border-b border-slate-50`
- Body: `flex-1 overflow-y-auto p-8 md:p-12 space-y-12`

### Badges & Tags
- Priority: colored backgrounds with white or slate-950 text
- Deadline: emerald (good/completed), orange (urgent/overdue)
- Status dots: `w-2.5 h-2.5 rounded-full` (emerald=active, indigo=review, orange=pending)
- Status pills: `px-6 py-3 rounded-full font-mono text-xs font-black uppercase tracking-[0.2em]`

### Empty States
- Container: `border-2 border-dashed border-slate-200 p-16 text-center rounded-3xl bg-white shadow-inner`
- Icon wrapper: `w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center`
- Primary text: `font-mono text-xs uppercase tracking-[0.25em] text-slate-400 font-bold`
- Secondary text: `font-mono text-sm text-slate-500 mt-3 max-w-md mx-auto`

## 5. Layout Principles

### Spacing Scale (4px base unit)
| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Tight inline spacing |
| sm | 8px | Icon gaps, badge padding |
| md | 16px | Card internal padding, form gaps |
| lg | 24px | Section gaps |
| xl | 32px | Major section gaps |
| 2xl | 48px | Feature section gaps |
| 3xl | 96px | Page-level spacing |

### Page Layout
- Max width: `max-w-[1600px] mx-auto`
- Content padding: `p-6`
- Desktop grid: `grid grid-cols-12 gap-8` — sidebar `col-span-3` (or `lg:col-span-2`), content `col-span-9` (or `lg:col-span-10`)
- Mobile: horizontal scrollable tab bar

### Section Spacing
- Between major sections: `space-y-12`
- Within sections: `space-y-8`
- Item lists: `space-y-6`
- Tight groupings: `space-y-4`
- Label + input pairs: `space-y-2`

## 6. Depth & Elevation

### Shadow System
| Level | Value | Use |
|-------|-------|-----|
| Subtle | `shadow-sm` | Card borders, secondary buttons, nav inactive |
| Card | `shadow-lg` | Task cards, badges, nav active |
| Elevated | `shadow-xl` | Primary buttons, KPI cards, modals |
| Modal | `shadow-2xl` | Auth card, modals, toast notifications |
| Inset | `shadow-inner` | Empty state containers |

### Colored Shadows (use sparingly)
- Primary CTA only: `shadow-emerald-500/20`
- Alert states: `shadow-orange-500/10`
- Card depth: `shadow-slate-200/20` → `shadow-slate-200/50` on hover

### Hairline Borders
- Default card border: `border border-slate-200`
- Subtle divider: `border-slate-100`
- Modal container: `border border-slate-100`
- Section dividers: `h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent`

## 7. Do's and Don'ts

### Do
- Use the tactical metaphor consistently in labels and copy
- Pair mono labels with emerald diamond indicators for section headers
- Use hairline borders for subtle depth before reaching for shadows
- Reserve colored shadows for primary CTAs and critical alerts
- Use `font-mono font-black uppercase` for all technical labels
- Use `font-mono` with weight/size variation for heading hierarchy
- Stagger animation delays for list items (`idx * 0.05`)
- Respect `useReducedMotion()` in all animations

### Don't
- Introduce new color schemes outside the defined palette
- Use pill-shaped buttons (`rounded-full`) — use `rounded-xl` for buttons
- Mix `font-black` and `font-bold` within the same hierarchy level
- Use `shadow-2xl` on cards — reserve for modals
- Add decorative elements that don't serve the tactical metaphor
- Create new animation patterns — use existing spring presets
- Use inline styles for colors — use Tailwind classes

## 8. Responsive Behavior

### Breakpoints
| Token | Value | Behavior |
|-------|-------|----------|
| sm | 640px | Form inputs stack, modals adjust padding |
| md | 768px | Sidebar appears, mobile tab bar hides |
| lg | 1024px | Full 12-column grid, wider content area |
| xl | 1280px | Task cards switch to horizontal layout |

### Touch Targets
- Minimum: `min-w-[44px] min-h-[44px]`
- All interactive elements must meet this threshold

### Collapsible Elements
- Mobile: horizontal scrollable tab bar with `overflow-x-auto`
- Desktop: vertical sidebar nav with `space-y-3`
- Task groups: collapsible with chevron toggle

## 9. Dark Mode

Dark mode is implemented via `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`.

### Surface Mappings (light → dark)
| Light | Dark |
|-------|------|
| `bg-slate-50` | `dark:bg-slate-950` |
| `bg-white` | `dark:bg-slate-800` |
| `bg-slate-50` (inputs) | `dark:bg-slate-900` |
| `border-slate-200` | `dark:border-slate-700` |
| `text-slate-900` | `dark:text-slate-100` |
| `text-slate-500` | `dark:text-slate-400` |
| `text-slate-400` | `dark:text-slate-500` |
| `shadow-sm` | `dark:shadow-slate-900/20` |
| `shadow-xl` | `dark:shadow-slate-900/40` |

**Toggle**: `useThemeStore.getState().toggleTheme()` — persists to `localStorage` under `tasker-theme`.

**Rule**: Every component that uses light-mode colors MUST have a `dark:` counterpart. No exceptions.

## 10. Agent Prompt Guide

### Quick Color Reference
- **Primary action**: `emerald-500`
- **Danger/alert**: `orange-500` / `orange-600`
- **In-progress**: `sky-500`
- **In-review**: `indigo-500`
- **Text**: `slate-900` (primary), `slate-500` (secondary), `slate-400` (labels)
- **Backgrounds**: `slate-50` (canvas), `white` (cards)

### Iteration Guide
1. Check this DESIGN.md before adding any new UI element
2. Use existing color tokens — do not invent new shades
3. Match typography patterns exactly (font family + weight + tracking)
4. Use existing component patterns (buttons, cards, modals, inputs)
5. All animations must respect `useReducedMotion()`

### Known Gaps
- No icon size standardization beyond component-level usage
- Chart styling (Recharts) uses inline styles — consider extracting to CSS
- No ESLint/Prettier enforcement of design tokens
