import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase/client';
import { AuditLog } from '../types';
import { log } from '../logger';

const logCache = new Map<string, AuditLog[]>();

export function useAuditLogs(taskId: string | null) {
  const [logs, setLogs] = useState<AuditLog[]>(() => taskId ? logCache.get(taskId) ?? [] : []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!taskId) {
      setLogs([]);
      return;
    }

    let cancelled = false;

    if (logCache.has(taskId)) {
      setLogs(logCache.get(taskId)!);
      return;
    }

    setIsLoading(true);
    setError(null);

    supabase
      .from('logs')
      .select('id, taskId, userId, event, oldValue, newValue, createdAt')
      .eq('taskId', taskId)
      .order('createdAt', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError('Failed to load audit logs.');
          log.error(error);
        } else if (data) {
          const records = data as AuditLog[];
          logCache.set(taskId, records);
          setLogs(records);
        }
        setIsLoading(false);
      });

    const channel = supabase
      .channel(`logs:${taskId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs', filter: `taskId=eq.${taskId}` }, (payload) => {
        const newLog = payload.new as AuditLog;
        setLogs((prev) => {
          if (prev.some((l) => l.id === newLog.id)) return prev;
          const updated = [newLog, ...prev];
          logCache.set(taskId, updated);
          return updated;
        });
      })
      .subscribe();
    channelRef.current = channel;

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [taskId]);

  return { logs, isLoading, error };
}
