import { useCallback, useEffect, useState } from 'react';
import { get, type ApiPage } from '../lib/api';

export function useApiPage<T>(path: string, enabled = true) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await get<ApiPage<T>>(path);
      setData(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [path, enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}

export function useApiItem<T>(path: string, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      setData((await get<{ data: T }>(path)).data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [path, enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload, setData };
}
