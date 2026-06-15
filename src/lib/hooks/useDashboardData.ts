import { useState, useEffect, useRef, useCallback } from "react";
import type { RealtimePostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";
import { Task, UserProfile, PersonalTask, Report } from "../types";
import { log } from "../logger";

const MAX_SUPERIORS_REALTIME = 10;
const INITIAL_POLL_INTERVAL = 3000;
const MAX_POLL_INTERVAL = 30000;
const BACKOFF_MULTIPLIER = 2;
const POLL_RESET_EVENTS = 3;

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

  const activeChannelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchAllRef = useRef<() => Promise<void>>(async () => {});
  const requestSeqRef = useRef(0);
  const initialFetchDoneRef = useRef(false);
  const superiorSeqRef = useRef(0);
  const mountedRef = useRef(true);
  const stateRef = useRef({ employees, superiors });
  const channelActivityRef = useRef(0);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // Keep stateRef current
  useEffect(() => {
    stateRef.current = { employees, superiors };
  }, [employees, superiors]);

  // Fetch logic for superiors based on superiorIds
  useEffect(() => {
    let parsedIds: string[] = [];
    try {
      parsedIds = JSON.parse(superiorIds) as string[];
    } catch (e) {
      log.error("Failed to parse superiorIds:", e);
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

    void Promise.resolve(
        supabase
          .from("users")
          .select("uid, name, email, managerIds, createdAt")
          .in("uid", limitedIds)
          .then(({ data, error }) => {
          if (cancelled) return;
          if (error) {
            log.error('Superior fetch error:', error);
            return;
          }
          if (data) setSuperiors(data as UserProfile[]);
        })
    ).catch((err: unknown) => {
      if (!cancelled) log.error('Superior fetch exception:', err);
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
              const { data } = await supabase.from("users").select("uid, name, email, managerIds, createdAt").eq("uid", id).maybeSingle();
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

      const [employeesRes, myTasksRes, teamTasksRes, managedReportsRes, personalTasksRes, profileRes] = await Promise.all([
        supabase.from("users").select("uid, name, email, managerIds, createdAt").filter("managerIds", "cs", `{${profile.uid}}`),
        supabase.from("tasks").select("*").eq("employeeId", profile.uid),
        supabase.from("tasks").select("*").eq("managerId", profile.uid),
        supabase.from("reports").select("id, taskId, employeeId, managerId, content, createdAt").or(`managerId.eq.${profile.uid},employeeId.eq.${profile.uid}`),
        supabase.from("personal_tasks").select("*").eq("userId", profile.uid),
        supabase.from("users").select("uid, managerIds").eq("uid", profile.uid).maybeSingle(),
      ]);

      if (cancelled || seq !== requestSeq) return;

      const hasError = employeesRes.error || myTasksRes.error || teamTasksRes.error || managedReportsRes.error || personalTasksRes.error;
      if (hasError) {
        setError('Failed to load data. Please refresh the page.');
        log.error('Data fetch error:', hasError);
      }

      if (employeesRes.data) setEmployees(employeesRes.data as UserProfile[]);
      if (myTasksRes.data) setMyTasks(myTasksRes.data as Task[]);
      if (teamTasksRes.data) setTeamTasks(teamTasksRes.data as Task[]);
      if (managedReportsRes.data) setManagedReports(managedReportsRes.data as Report[]);
      if (personalTasksRes.data) setPersonalTasks(personalTasksRes.data as PersonalTask[]);

      const latestManagerIds = (profileRes.data as { managerIds?: string[] } | null)?.managerIds ?? [];
      if (latestManagerIds.length > 0) {
        const limited = latestManagerIds.slice(0, MAX_SUPERIORS_REALTIME);
        const { data: superiorsData } = await supabase.from("users").select("uid, name, email, managerIds, createdAt").in("uid", limited);
        if (superiorsData) setSuperiors(superiorsData as UserProfile[]);
      } else {
        setSuperiors([]);
      }

      setIsLoading(false);
      initialFetchDoneRef.current = true;
    };

    fetchAllRef.current = fetchAll;
    fetchAll();

    const parsePgArray = (val: unknown): string[] => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        const trimmed = val.replace(/^\{|\}$/g, '');
        if (!trimmed) return [];
        return trimmed.split(',');
      }
      return [];
    };

    const handleUserChange = (payload: RealtimePostgresChangesPayload<{ uid: string; managerIds: string[]; name: string; email: string; createdAt: string }>) => {
      if (cancelled) return;
      channelActivityRef.current++;
      const newManagerIdsRaw = (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')
        ? ((payload.new as Record<string, unknown>)?.managerIds as unknown)
        : undefined;
      const oldManagerIdsRaw = (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE')
        ? ((payload.old as Record<string, unknown>)?.managerIds as unknown)
        : undefined;
      const safeNewManagerIds = parsePgArray(newManagerIdsRaw);
      const safeOldManagerIds = parsePgArray(oldManagerIdsRaw);

      const changedUid = (payload.new as Record<string, unknown>)?.uid as string | undefined || (payload.old as Record<string, unknown>)?.uid as string | undefined;

      const relationshipTouchesViewer =
        safeNewManagerIds.includes(profile.uid) ||
        safeOldManagerIds.includes(profile.uid);

      const relevantIds = new Set([
        ...stateRef.current.employees.map(e => e.uid),
        ...stateRef.current.superiors.map(s => s.uid),
        profile.uid
      ]);

      if (changedUid === profile.uid && payload.eventType === 'UPDATE') {
        const added = safeNewManagerIds.filter((id) => !safeOldManagerIds.includes(id));
        const removed = safeOldManagerIds.filter((id) => !safeNewManagerIds.includes(id));
        if (added.length > 0 || removed.length > 0) {
          const limited = safeNewManagerIds.slice(0, MAX_SUPERIORS_REALTIME);
          void supabase.from("users").select("uid, name, email, managerIds, createdAt").in("uid", limited).then(({ data }) => {
            if (data) setSuperiors(data as UserProfile[]);
          });
        }
        const oldKeys = Object.keys(payload.old as Record<string, unknown>);
        const nonManagerChanged = oldKeys.some(
          (key) => key !== 'managerIds' && JSON.stringify((payload.old as Record<string, unknown>)[key]) !== JSON.stringify((payload.new as Record<string, unknown>)[key])
        );
        if (!nonManagerChanged && !relationshipTouchesViewer) return;
      }

      if (relationshipTouchesViewer || (changedUid !== undefined && relevantIds.has(changedUid))) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          if (!cancelled) fetchAll();
        }, 300);
      }
    };

    const handleTaskInsert = (payload: RealtimePostgresChangesPayload<Task>) => {
      if (cancelled) return;
      channelActivityRef.current++;
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
      channelActivityRef.current++;
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

      const affectsViewer =
        old?.employeeId === profile.uid ||
        old?.managerId === profile.uid ||
        updated.employeeId === profile.uid ||
        updated.managerId === profile.uid;

      if (affectsViewer) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          if (!cancelled) fetchAll();
        }, 300);
      }
    };

    const handleTaskDelete = (payload: RealtimePostgresChangesPayload<Task>) => {
      if (cancelled) return;
      channelActivityRef.current++;
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
      channelActivityRef.current++;
      if (payload.eventType === 'INSERT') {
        const report = payload.new as Report;
        setManagedReports((prev) => prev.some((r) => r.id === report.id) ? prev : [...prev, report]);
        return;
      }
      const { data } = await supabase
        .from("reports")
        .select("id, taskId, employeeId, managerId, content, createdAt")
        .or(`managerId.eq.${profile.uid},employeeId.eq.${profile.uid}`);
      if (data && !cancelled) {
        setManagedReports(data as Report[]);
      }
    };

    const handlePersonalTaskInsert = (payload: RealtimePostgresChangesPayload<PersonalTask>) => {
      if (cancelled) return;
      channelActivityRef.current++;
      const task = payload.new as PersonalTask;
      setPersonalTasks((prev) => {
        if (prev.some((t) => t.id === task.id)) return prev;
        return [...prev, task];
      });
    };

    const handlePersonalTaskUpdate = (payload: RealtimePostgresChangesPayload<PersonalTask>) => {
      if (cancelled) return;
      channelActivityRef.current++;
      const updated = payload.new as PersonalTask;
      if (!updated?.id) return;
      setPersonalTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    };

    const handlePersonalTaskDelete = (payload: RealtimePostgresChangesPayload<PersonalTask>) => {
      if (cancelled) return;
      channelActivityRef.current++;
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

  // Adaptive polling: exponential backoff 3s-30s, reset on realtime activity
  useEffect(() => {
    let mounted = true;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let emptyPollCount = 0;
    let currentInterval = INITIAL_POLL_INTERVAL;
    let lastActivityCount = 0;

    const scheduleNext = () => {
      if (!mounted) return;
      pollTimer = setTimeout(poll, currentInterval);
    };

    const poll = () => {
      if (!mounted) return;
      if (document.visibilityState !== 'visible') {
        scheduleNext();
        return;
      }
      fetchAllRef.current().finally(() => {
        if (!mounted) return;
        const activitySinceLastPoll = channelActivityRef.current - lastActivityCount;
        lastActivityCount = channelActivityRef.current;
        if (activitySinceLastPoll >= POLL_RESET_EVENTS) {
          currentInterval = INITIAL_POLL_INTERVAL;
          emptyPollCount = 0;
        } else {
          emptyPollCount++;
          if (emptyPollCount >= 5) {
            currentInterval = Math.min(currentInterval * BACKOFF_MULTIPLIER, MAX_POLL_INTERVAL);
            emptyPollCount = 0;
          }
        }
        scheduleNext();
      });
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        currentInterval = INITIAL_POLL_INTERVAL;
        emptyPollCount = 0;
        lastActivityCount = channelActivityRef.current;
        fetchAllRef.current();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    const healthCheck = setInterval(() => {
      if (!mounted) return;
      const channels = activeChannelsRef.current;
      let unhealthyCount = 0;
      channels.forEach((ch) => {
        const state = ch.state;
        if (state !== 'joined' && state !== 'joining') unhealthyCount++;
      });
      if (unhealthyCount > channels.size / 2 && channels.size > 0) {
        currentInterval = INITIAL_POLL_INTERVAL;
        emptyPollCount = 0;
        lastActivityCount = channelActivityRef.current;
      }
    }, 60000);

    scheduleNext();

    return () => {
      mounted = false;
      if (pollTimer) clearTimeout(pollTimer);
      clearInterval(healthCheck);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const refetch = useCallback(() => { void fetchAllRef.current(); }, []);

  return {
    employees,
    setEmployees,
    myTasks,
    setMyTasks,
    teamTasks,
    setTeamTasks,
    managedReports,
    setManagedReports,
    personalTasks,
    setPersonalTasks,
    superiors,
    setSuperiors,
    error,
    isLoading,
    refetch,
  };
}
