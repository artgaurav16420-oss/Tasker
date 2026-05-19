# Tasker

Tasker is a highly modular, real-time task management application designed for streamlined team operations. It leverages a relational hierarchy model (Unified User Model) rather than static roles, allowing users to fluidly act as both managers and operatives based on task assignments.

## 🚀 Built With

*   **Frontend**: React 19, Vite
*   **Styling**: Tailwind CSS v4
*   **Animations**: Framer Motion (`motion/react`)
*   **Icons**: Lucide React
*   **State Management**: Zustand
*   **Backend & BaaS**: Supabase (Authentication, PostgreSQL Database, Realtime, Edge Functions)

## ✨ Key Features

*   **Unified User Model**: No hardcoded `role` strings. Permissions are determined dynamically. You are a "Manager" if you are assigned as a manager for a task or an operative, and an "Employee" (Operative) if tasks are assigned to you. Users can fulfill both roles simultaneously.
*   **Real-time Operations**: Powered by Supabase Realtime subscriptions, UI strictly re-renders on remote state changes securely and efficiently.
*   **Strict Security (Zero-Trust)**:
    *   **Client-Side Limiting**: Client application performs single-document deletions only.
    *   **Postgres Triggers**: Cascading deletions and clean-ups are resolved server-side.
    *   **Row Level Security (RLS)**: Rigid shadow-update prevention and terminal state locking.
*   **Polished UI System**: Slate and Emerald color themes. Sharp, responsive interface utilizing `font-mono` (JetBrains Mono) and `font-serif` (Playfair Display) for an elegant yet technical aesthetic.

## 📂 Project Structure

The codebase emphasizes modularity. `Dashboard.tsx` serves as a routing and state shell, while complex UI components are separated out:

```text
src/
├── components/
│   ├── features/      # Distinct application features (e.g., PersonalTasksList)
│   ├── modals/        # Pop-up overlays and dialogs
│   ├── Dashboard.tsx  # Main state-routing shell
│   └── ...
├── lib/
│   ├── supabase/      # Supabase client initialization
│   ├── store.ts       # Zustand state management
│   └── ...
└── ...
```

## 🛠️ Development Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Ensure your Supabase configuration is correctly set up. The application expects valid Supabase credentials configured via `.env` variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

4.  **Linting**:
    ```bash
    npm run lint
    ```

## 🔐 Security & Database Rules

When modifying RLS (Row Level Security) policies or security models, ensure changes conform to the strict zero-trust design. Task and user creations are secured using exact payload definitions. Employees can only transition tasks to `'in-review'`, whereas Managers have exclusive permission to finalize tasks to `'completed'`.

## 🤖 AI Development Context

For AI assistants and developers contributing to this project, please consult the `AGENTS.md` file in the root repository before proposing architectural, database, or UI changes. It acts as the absolute source of truth regarding application protocols.
