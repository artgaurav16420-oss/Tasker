---
name: new-component
description: Scaffold a new feature or modal component following Tasker project conventions.
license: MIT
---

# new-component

Scaffold a new React component matching Tasker's conventions.

## Conventions

**For features** (`src/components/features/`):
- Import `motion` + `AnimatePresence` from `motion/react`
- Import icons from `lucide-react` only
- Import types from `@/src/lib/types`
- Import hooks from `@/src/lib/hooks/`
- Use Tailwind utility classes with project color tokens (`slate`, `emerald`, `orange`, `sky`, `indigo`)
- Wrap exported component in `<ErrorBoundary>` at call site (not inside the file)
- Accept props as a single interface, export it

**For modals** (`src/components/modals/`):
- Same imports as features
- Modal container **must** use `AnimatePresence` + `motion.div` for enter/exit
- Use `motion/react` spring transitions (not CSS transitions)
- Accept `isOpen`, `onClose` props in the interface
- Render inside `<ErrorBoundary>` at call site

## Example Pattern

```tsx
import { motion, AnimatePresence } from 'motion/react';
import { SomeIcon } from 'lucide-react';
import type { SomeType } from '@/src/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // ...
}

export default function SomeComponent({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {/* content */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```
