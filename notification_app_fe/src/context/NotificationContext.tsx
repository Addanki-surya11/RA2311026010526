"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ScoredNotification } from "@/lib/types";
import { computePriority, getTopN } from "@/lib/priority";

interface NotificationContextValue {
  all: ScoredNotification[];
  priority: ScoredNotification[];
  loading: boolean;
  error: string | null;
  viewedIds: Set<string>;
  markViewed: (id: string) => void;
  refresh: (type?: string, limit?: number, page?: number) => Promise<void>;
  topN: number;
  setTopN: (n: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/** Sort notifications newest-first by their Timestamp ("YYYY-MM-DD HH:MM:SS") */
function sortByTime(notifications: ScoredNotification[]): ScoredNotification[] {
  return [...notifications].sort((a, b) => {
    const tA = new Date(a.Timestamp.replace(" ", "T")).getTime();
    const tB = new Date(b.Timestamp.replace(" ", "T")).getTime();
    return tB - tA; // descending — newest first
  });
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [all, setAll] = useState<ScoredNotification[]>([]);
  const [priority, setPriority] = useState<ScoredNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [topN, setTopN] = useState(10);

  const refresh = useCallback(
    async (type?: string, limit = 100, page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: String(limit),
          page: String(page),
        });
        if (type && type !== "All") params.set("notification_type", type);

        const res = await fetch(`/api/notifications?${params.toString()}`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body?.detail || body?.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const raw = data.notifications || [];
        const scored = computePriority(raw).map((n) => ({
          ...n,
          _viewed: viewedIds.has(n.ID),
        }));

        // All Notifications & Filter: newest first by timestamp
        setAll(sortByTime(scored));

        // Priority Inbox: highest score first (type + recency weight)
        setPriority(getTopN(scored, topN));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [viewedIds, topN]
  );

  const markViewed = useCallback((id: string) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setAll((prev) =>
      prev.map((n) => (n.ID === id ? { ...n, _viewed: true } : n))
    );
    setPriority((prev) =>
      prev.map((n) => (n.ID === id ? { ...n, _viewed: true } : n))
    );
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute priority list when topN changes
  useEffect(() => {
    setPriority(getTopN(all, topN));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topN]);

  return (
    <NotificationContext.Provider
      value={{ all, priority, loading, error, viewedIds, markViewed, refresh, topN, setTopN }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
