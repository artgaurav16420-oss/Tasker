import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { AuditLog } from '../types';
import { log } from '../logger';

export function useAuditLogs(taskId: string | null) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setLogs([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    supabase
      .from('logs')
      .select('*')
      .eq('taskId', taskId)
      .order('createdAt', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError('Failed to load audit logs.');
          log.error(error);
        } else if (data) {
          setLogs(data as AuditLog[]);
        }
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [taskId]);

  return { logs, isLoading, error };
}
