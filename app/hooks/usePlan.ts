'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '../context/AuthContext';

export type Plan = 'free' | 'starter' | 'pro' | 'team';

export const PLAN_LIMITS: Record<Plan, { window: 'daily' | 'monthly' | null; limit: number | null; assistantMode: 'basic' | 'full' }> = {
  free:    { window: 'daily',   limit: 5,    assistantMode: 'basic' },
  starter: { window: 'monthly', limit: 50,   assistantMode: 'basic' },
  pro:     { window: null,      limit: null, assistantMode: 'full'  },
  team:    { window: null,      limit: null, assistantMode: 'full'  },
};

export interface PlanInfo {
  plan: Plan;
  loading: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
  window: 'daily' | 'monthly' | null;
  assistantMode: 'basic' | 'full';
}

function makeClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

export function usePlan(): PlanInfo {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan>('free');
  const [loading, setLoading] = useState(true);
  const [used, setUsed] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const supabase = makeClient();

    async function load() {
      const { data: planRow } = await supabase
        .from('user_plans').select('plan').eq('user_id', user!.id).single();
      const p = ((planRow?.plan) ?? 'free') as Plan;
      setPlan(p);

      const cfg = PLAN_LIMITS[p];
      if (!cfg.window) { setUsed(0); setLoading(false); return; }

      const now = new Date();
      const windowStart = cfg.window === 'daily'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth(), 1);

      const { count } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gte('used_at', windowStart.toISOString());

      setUsed(count ?? 0);
      setLoading(false);
    }

    load();
  }, [user]);

  const cfg = PLAN_LIMITS[plan];
  const remaining = cfg.limit !== null ? Math.max(0, cfg.limit - used) : null;

  return { plan, loading, used, limit: cfg.limit, remaining, window: cfg.window, assistantMode: cfg.assistantMode };
}
