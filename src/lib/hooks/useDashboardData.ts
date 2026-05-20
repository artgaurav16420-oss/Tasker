import { useState, useEffect, useRef, useCallback } from "react";
import type { RealtimePostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";
import { Task, UserProfile, PersonalTask, Report } from "../types";

const MAX_SUPERIORS_REALTIME = 10;

export function useDashboardData(profile: UserProfile | null, superiorIds: string) {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [managedReports, setManagedReports] = useState<Report[]>([]);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  const [superiors, setSuperiors] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [recoveryKey, setRecoveryKey] = useState(0);

  const employeesRef = useRef(employees);
  const myTasksRef = useRef(myTasks);
  const teamTasksRef = useRef(teamTasks);
  const managedReportsRef = useRef(managedReports);
  const personalTasksRef = useRef(personalTasks);
  const superiorsRef = useRef(superiors);
  const profileRef = useRef(profile);
  const activeChannelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileUidRef = useRef(profile?.uid ?? null);
  const requestSeqRef = useRef(0);
  const initialFetchDoneRef = useRef(false);
  const superiorSeqRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const refetch = useCallback(async () => {
    const uid = profileUidRef.current;
    if (!uid) return;

    // Cancel any pending debounced fetchAll from realtime handlers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const seq = ++requestSeqRef.current;

    setError(null);

    const [employeesRes, myTasksRes, teamTasksRes, managedReportsRes, personalTasksRes] = await Promise.all([
      supabase.from("users").select("*").contains("managerIds", [uid]),
      supabase.from("tasks").select("*").eq("employeeId", uid),
      supabase.from("tasks").select("*").eq("managerId", uid),
      supabase.from("reports").select("*").or(`managerId.eq.${uid},employeeId.eq.${uid}`),
      supabase.from("personal_tasks").select("*").eq("userId", uid),
    ]);

    if (seq !== requestSeqRef.current) return;
    if (!mountedRef.current) return;

    const hasError = employeesRes.error || myTasksRes.error || teamTasksRes.error || managedReportsRes.error || personalTasksRes.error;
    if (hasError) {
      setError('Failed to load data. Please refresh the page.');
      console.error('Data fetch error:', hasError);
    }

    if (employeesRes.data) setEmployees(employeesRes.data as UserProfile[]);
    if (myTasksRes.data) setMyTasks(myTasksRes.data as Task[]);
    if (teamTasksRes.data) setTeamTasks(teamTasksRes.data as Task[]);
    if (managedReportsRes.data) setManagedReports(managedReportsRes.data as Report[]);
    if (personalTasksRes.data) setPersonalTasks(personalTasksRes.data as PersonalTask[]);

    setIsLoading(false);
    initialFetchDoneRef.current = true;
  }, []);

  const refetchRef = useRef(refetch);

  useEffect(() => {
    employeesRef.current = employees;
    myTasksRef.current = myTasks;
    teamTasksRef.current = teamTasks;
    managedReportsRef.current = managedReports;
    personalTasksRef.current = personalTasks;
    superiorsRef.current = superiors;
    profileRef.current = profile;
    profileUidRef.current = profile?.uid ?? null;
    refetchRef.current = refetch;
  }, [employees, myTasks, teamTasks, managedReports, personalTasks, superiors, profile, refetch]);

  // Fetch logic for superiors based on superiorIds
  useEffect(() => {
    let parsedIds: string[] = [];
    try {
      parsedIds = JSON.parse(superiorIds) as string[];
    } catch (e) {
      console.error("Failed to parse superiorIds:", e);
      setSuperiors([]);
      return;
    }

    if (parsedIds.length === 0) {
      setSuperiors([]);
      activeChannelsRef.current.forEach((channel) => supabase.removeChannel(channel));
      activeChannelsRef.current.clear();
      return;
    }

    let cancelled = false;

    const limitedIds = parsedIds.slice(0, MAX_SUPERIORS_REALTIME);

    supabase
      .from("users")
      .select("*")
      .in("uid", limitedIds)
      .then(({ data }) => {
        if (!cancelled && data) setSuperiors(data as UserProfile[]);
      });

    const currentIds = new Set(limitedIds);

    activeChannelsRef.current.forEach((channel, id) => {
      if (!currentIds.has(id)) {
        supabase.removeChannel(channel);
        activeChannelsRef.current.delete(id);
      }
    });

    limitedIds.forEach((id) => {
      if (!activeChannelsRef.current.has(id)) {
        const channel = supabase
          .channel(`users:superior:${id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "users", filter: `uid=eq.${id}` },
            async (payload) => {
              const seq = ++superiorSeqRef.current;
              const { data } = await supabase.from("users").select("*").eq("uid", id).maybeSingle();
              if (cancelled || seq !== superiorSeqRef.current) return;
              if (data) {
                setSuperiors((prev) => {
                  const current = prev.filter((p) => p.uid !== id);
                  return [...current, data as UserProfile];
                });
              } else {
                setSuperiors((prev) => prev.filter((p) => p.uid !== id));
              }
            }
          )
          .subscribe();
        activeChannelsRef.current.set(id, channel);
      }
    });

    return () => {
      cancelled = true;
      activeChannelsRef.current.forEach((channel, id) => {
        if (!currentIds.has(id)) {
          supabase.removeChannel(channel);
          activeChannelsRef.current.delete(id);
        }
      });
    };
  }, [superiorIds]);

  // Cleanup all channels on unmount
  useEffect(() => {
    return () => {
      activeChannelsRef.current.forEach((channel) => supabase.removeChannel(channel));
      activeChannelsRef.current.clear();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Main data fetch & subscription with granular handlers
  useEffect(() => {
    if (!profile?.uid) return;

    let cancelled = false;
    let requestSeq = 0;

    const fetchAll = async () => {
      const seq = ++requestSeq;
      const isFirst = !initialFetchDoneRef.current;
      if (isFirst) {
        setIsLoading(true);
      }
      setError(null);

      const [employeesRes, myTasksRes, teamTasksRes, managedReportsRes, personalTasksRes] = await Promise.all([
        supabase.from("users").select("*").contains("managerIds", [profile.uid]),
        supabase.from("tasks").select("*").eq("employeeId", profile.uid),
        supabase.from("tasks").select("*").eq("managerId", profile.uid),
        supabase.from("reports").select("*").or(`managerId.eq.${profile.uid},employeeId.eq.${profile.uid}`),
        supabase.from("personal_tasks").select("*").eq("userId", profile.uid),
      ]);

      if (cancelled || seq !== requestSeq) return;

      const hasError = employeesRes.error || myTasksRes.error || teamTasksRes.error || managedReportsRes.error || personalTasksRes.error;
      if (hasError) {
        setError('Failed to load data. Please refresh the page.');
        console.error('Data fetch error:', hasError);
      }

      if (employeesRes.data) setEmployees(employeesRes.data as UserProfile[]);
      if (myTasksRes.data) setMyTasks(myTasksRes.data as Task[]);
      if (teamTasksRes.data) setTeamTasks(teamTasksRes.data as Task[]);
      if (managedReportsRes.data) setManagedReports(managedReportsRes.data as Report[]);
      if (personalTasksRes.data) setPersonalTasks(personalTasksRes.data as PersonalTask[]);

      setIsLoading(false);
      initialFetchDoneRef.current = true;
    };

    fetchAll();

    const handleUserChange = (payload: RealtimePostgresChangesPayload<{ uid: string; managerIds: string[]; name: string; email: string; createdAt: string }>) => {
      const newManagerIds = (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')
        ? ((payload.new as Record<string, unknown>)?.managerIds as string[] | undefined) || []
        : [];
      const oldManagerIds = (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE')
        ? ((payload.old as Record<string, unknown>)?.managerIds as string[] | undefined) || []
        : [];
      const safeNewManagerIds = Array.isArray(newManagerIds) ? newManagerIds : [];
      const safeOldManagerIds = Array.isArray(oldManagerIds) ? oldManagerIds : [];

      const relationshipTouchesViewer =
        safeNewManagerIds.includes(profile.uid) ||
        safeOldManagerIds.includes(profile.uid);

      const changedUid = (payload.new as Record<string, unknown>)?.uid as string | undefined || (payload.old as Record<string, unknown>)?.uid as string | undefined;
      const relevantIds = new Set([
        ...employeesRef.current.map(e => e.uid),
        ...superiorsRef.current.map(s => s.uid),
        profile.uid
      ]);

      if (relationshipTouchesViewer || (changedUid !== undefined && relevantIds.has(changedUid))) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          fetchAll();
        }, 300);
      }
    };

    const handleTaskInsert = (payload: RealtimePostgresChangesPayload<Task>) => {
      if (cancelled) return;
      const task = payload.new as Task;
      if (task.employeeId === profile.uid) {
        setMyTasks((prev) => prev.some((t) => t.id === task.id) ? prev : [...prev, task]);
      }
      if (task.managerId === profile.uid) {
        setTeamTasks((prev) => prev.some((t) => t.id === task.id) ? prev : [...prev, task]);
      }
    };

    const handleTaskUpdate = (payload: RealtimePostgresChangesPayload<Task>) => {
      if (cancelled) return;
      const updated = payload.new as Task;
      const old = payload.old as Task;
      if (!updated?.id) return;

      const belongsToMe = updated.employeeId === profile.uid;
      const managedByMe = updated.managerId === profile.uid;

      if (belongsToMe) {
        setMyTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      }
      if (managedByMe) {
        setTeamTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      }

      if (old?.employeeId !== updated.employeeId || old?.managerId !== updated.managerId) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => fetchAll(), 300);
      }
    };

    const handleTaskDelete = (payload: RealtimePostgresChangesPayload<Task>) => {
      if (cancelled) return;
      const old = payload.old as Task;
      if (!old?.id) return;

      if (old.employeeId === profile.uid) {
        setMyTasks((prev) => prev.filter((t) => t.id !== old.id));
      }
      if (old.managerId === profile.uid) {
        setTeamTasks((prev) => prev.filter((t) => t.id !== old.id));
      }
    };

    const handleReportChange = async (payload: RealtimePostgresChangesPayload<Report>) => {
      if (cancelled) return;
      if (payload.eventType === 'INSERT') {
        const report = payload.new as Report;
        setManagedReports((prev) => prev.some((r) => r.id === report.id) ? prev : [...prev, report]);
        return;
      }
      const { data } = await supabase
        .from("reports")
        .select("*")
        .or(`managerId.eq.${profile.uid},employeeId.eq.${profile.uid}`);
      if (data && !cancelled) {
        setManagedReports(data as Report[]);
      }
    };

    const handlePersonalTaskInsert = (payload: RealtimePostgresChangesPayload<PersonalTask>) => {
      if (cancelled) return;
      const task = payload.new as PersonalTask;
      setPersonalTasks((prev) => {
        if (prev.some((t) => t.id === task.id)) return prev;
        return [...prev, task];
      });
    };

    const handlePersonalTaskUpdate = (payload: RealtimePostgresChangesPayload<PersonalTask>) => {
      if (cancelled) return;
      const updated = payload.new as PersonalTask;
      if (!updated?.id) return;
      setPersonalTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    };

    const handlePersonalTaskDelete = (payload: RealtimePostgresChangesPayload<PersonalTask>) => {
      if (cancelled) return;
      const old = payload.old as PersonalTask;
      if (!old?.id) return;
      setPersonalTasks((prev) => prev.filter((t) => t.id !== old.id));
    };

    const channel = supabase
      .channel(`dashboard:${profile.uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "users", filter: `uid=eq.${profile.uid}` }, handleUserChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "users", filter: `managerIds=cs.{${profile.uid}}` }, handleUserChange)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks", filter: `employeeId=eq.${profile.uid}` }, handleTaskInsert)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks", filter: `managerId=eq.${profile.uid}` }, handleTaskInsert)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks", filter: `employeeId=eq.${profile.uid}` }, handleTaskUpdate)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks", filter: `managerId=eq.${profile.uid}` }, handleTaskUpdate)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks", filter: `employeeId=eq.${profile.uid}` }, handleTaskDelete)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks", filter: `managerId=eq.${profile.uid}` }, handleTaskDelete)
      .on("postgres_changes", { event: "*", schema: "public", table: "reports", filter: `managerId=eq.${profile.uid}` }, handleReportChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "reports", filter: `employeeId=eq.${profile.uid}` }, handleReportChange)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "personal_tasks", filter: `userId=eq.${profile.uid}` }, handlePersonalTaskInsert)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "personal_tasks", filter: `userId=eq.${profile.uid}` }, handlePersonalTaskUpdate)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "personal_tasks", filter: `userId=eq.${profile.uid}` }, handlePersonalTaskDelete)
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (!cancelled && initialFetchDoneRef.current) {
            setTimeout(() => {
              if (!cancelled) setRecoveryKey(k => k + 1);
            }, 1000);
          }
        }
      });

    return () => {
      cancelled = true;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [profile?.uid, recoveryKey]);

  return {
    employees,
    myTasks,
    teamTasks,
    managedReports,
    personalTasks,
    setPersonalTasks,
    setEmployees,
    setMyTasks,
    setTeamTasks,
    setManagedReports,
    setSuperiors,
    superiors,
    error,
    isLoading,
    refetch,
  };
}
