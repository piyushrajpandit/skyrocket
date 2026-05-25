/**
 * Custom data fetching hook with loading, error, and retry states.
 * Usage:
 *   const { data, loading, error, retry } = useFetch<MyType>("/api/my-data");
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useFetch<T = any>(
  url: string | null,
  options?: RequestInit
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(url, options);
      const json = await res.json();

      if (!res.ok || json.success === false) {
        setError(json.error || json.message || `Request failed (${res.status})`);
        setData(null);
      } else {
        setData(json.data ?? json);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, retry: fetchData };
}
