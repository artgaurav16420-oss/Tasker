-- Tasker: Supabase SQL Setup Script
-- Execute this in your Supabase SQL Editor to initialize the database schema and security functions.

-- 1. Tables Initialization
CREATE TABLE IF NOT EXISTS public.users (
    uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    "managerIds" UUID[] DEFAULT '{}',
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    "managerId" UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    "employeeId" UUID REFERENCES public.users(uid) ON DELETE SET NULL,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'in-review', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    "timelineEnd" TIMESTAMPTZ,
    "updatedAt" BIGINT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "taskId" UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    "userId" UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    event TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "taskId" UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    "employeeId" UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    "managerId" UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.personal_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'todo',
    "timelineEnd" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Security Functions (RPC)
-- Hardened RPC for adding a team member (Cross-row mutation)
CREATE OR REPLACE FUNCTION add_team_member(admin_uid UUID, member_uid UUID)
RETURNS void AS $$
BEGIN
  IF auth.uid() != admin_uid THEN
    RAISE EXCEPTION 'Unauthorized: Identity spoofing detected.';
  END IF;

  IF admin_uid = member_uid THEN
    RAISE EXCEPTION 'Cannot add yourself to the team.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.users WHERE uid = member_uid) THEN
    RAISE EXCEPTION 'Member not found.';
  END IF;

  UPDATE public.users SET "managerIds" = array_append("managerIds", admin_uid)
  WHERE uid = member_uid
    AND NOT (admin_uid = ANY("managerIds"));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- New member-side RPC for joining a superior's team
CREATE OR REPLACE FUNCTION member_join_team(superior_uid UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE uid = superior_uid) THEN
    RAISE EXCEPTION 'Superior not found.';
  END IF;
  UPDATE public.users
  SET "managerIds" = array_append("managerIds", superior_uid)
  WHERE uid = auth.uid()
    AND NOT (superior_uid = ANY("managerIds"));
END;
$$;

CREATE OR REPLACE FUNCTION member_leave_team(superior_uid UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE public.users
  SET "managerIds" = array_remove("managerIds", superior_uid)
  WHERE uid = auth.uid();
END;
$$;

-- Hardened RPC for removing a team member
CREATE OR REPLACE FUNCTION remove_team_member(admin_uid UUID, member_uid UUID)
RETURNS void AS $$
BEGIN
  IF auth.uid() != admin_uid THEN
    RAISE EXCEPTION 'Unauthorized.';
  END IF;

  UPDATE public.users SET "managerIds" = array_remove("managerIds", admin_uid)
  WHERE uid = member_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Triggers for automatic `updatedAt` timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Auto-create user profile on auth signup (eliminates race condition)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (uid, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (uid) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 3. Row Level Security (RLS) - Basic Example Pattern
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Personal Tasks: Viewable if owner
CREATE POLICY "Users can view own personal tasks" ON public.personal_tasks
  FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Users can create personal tasks" ON public.personal_tasks
  FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Users can update own personal tasks" ON public.personal_tasks
  FOR UPDATE USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Users can delete own personal tasks" ON public.personal_tasks
  FOR DELETE USING (auth.uid() = "userId");

-- Users: Anyone can read profiles (for lookups), only own user can update
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = uid);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = uid) WITH CHECK (
  auth.uid() = uid AND
  "managerIds" IS NOT DISTINCT FROM (
    SELECT u."managerIds" FROM public.users u WHERE u.uid = users.uid
  )
);

-- Tasks: Viewable if you are manager or employee
CREATE POLICY "Tasks viewable by related users" ON public.tasks FOR SELECT USING (
  auth.uid() = "managerId" OR auth.uid() = "employeeId"
);
CREATE POLICY "Managers can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  auth.uid() = "managerId" AND
  ("employeeId" IS NULL OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.uid = "employeeId" AND auth.uid() = ANY(u."managerIds")
  ))
);

-- Managers can update anything on their tasks; employees can only update status to non-completed
CREATE POLICY "Managers can delete tasks" ON public.tasks FOR DELETE USING (auth.uid() = "managerId");

CREATE POLICY "Managers can update tasks" ON public.tasks FOR UPDATE USING (
  auth.uid() = "managerId"
) WITH CHECK (
  auth.uid() = "managerId" AND
  ("employeeId" IS NULL OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.uid = "employeeId" AND auth.uid() = ANY(u."managerIds")
  ))
);

-- Employees can only update status. Field integrity enforced by trigger below.
CREATE POLICY "Employees can update task status" ON public.tasks FOR UPDATE USING (
  auth.uid() = "employeeId" AND
  status != 'completed'
) WITH CHECK (
  auth.uid() = "employeeId" AND
  status IN ('in-progress', 'in-review')
);

-- Prevent employees from modifying fields other than status
-- Uses OLD row comparison (not available in RLS WITH CHECK)
CREATE OR REPLACE FUNCTION check_employee_task_update()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = OLD."employeeId" THEN
    IF NEW.title IS DISTINCT FROM OLD.title OR
       NEW.description IS DISTINCT FROM OLD.description OR
       NEW."managerId" IS DISTINCT FROM OLD."managerId" OR
       NEW."employeeId" IS DISTINCT FROM OLD."employeeId" OR
       NEW.priority IS DISTINCT FROM OLD.priority OR
       NEW."timelineEnd" IS DISTINCT FROM OLD."timelineEnd" OR
       NEW."createdAt" IS DISTINCT FROM OLD."createdAt" THEN
      RAISE EXCEPTION 'Employees can only modify task status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_employee_task_update ON public.tasks;
CREATE TRIGGER enforce_employee_task_update
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_employee_task_update();

-- Reports: Viewable if related
CREATE POLICY "Reports viewable by related users" ON public.reports FOR SELECT USING (
  auth.uid() = "managerId" OR auth.uid() = "employeeId"
);
CREATE POLICY "Assignments can be reported" ON public.reports FOR INSERT WITH CHECK (
  (auth.uid() = "employeeId" OR auth.uid() = "managerId") AND
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = reports."taskId"
      AND t."employeeId" = reports."employeeId"
      AND t."managerId"  = reports."managerId"
  )
);

-- Logs: Viewable if related to task
CREATE POLICY "Logs viewable by related users" ON public.logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE public.tasks.id = public.logs."taskId"
    AND (public.tasks."managerId" = auth.uid() OR public.tasks."employeeId" = auth.uid())
  )
);

-- Logs: Insertable by task manager or employee
CREATE POLICY "Users can insert logs" ON public.logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE public.tasks.id = logs."taskId"
    AND (public.tasks."managerId" = auth.uid() OR public.tasks."employeeId" = auth.uid())
  )
  OR auth.uid() = logs."userId"
);
