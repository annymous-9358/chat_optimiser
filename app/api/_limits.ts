import { createSupabaseServer } from './_supabase';

export type Plan = 'free' | 'starter' | 'pro' | 'team';
export type AssistantMode = 'basic' | 'full';

interface PlanConfig {
  windowType: 'daily' | 'monthly' | 'unlimited';
  limit: number | null;
  assistantMode: AssistantMode;
  label: string;
}

export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  free:    { windowType: 'daily',     limit: 5,    assistantMode: 'basic', label: 'Free' },
  starter: { windowType: 'monthly',   limit: 50,   assistantMode: 'basic', label: 'Starter' },
  pro:     { windowType: 'unlimited', limit: null, assistantMode: 'full',  label: 'Pro' },
  team:    { windowType: 'unlimited', limit: null, assistantMode: 'full',  label: 'Team' },
};

export interface LimitResult {
  allowed: boolean;
  plan: Plan;
  assistantMode: AssistantMode;
  remaining: number | null;
  resetAt?: string;
  message?: string;
}

export async function checkAndLogUsage(toolSlug: string): Promise<LimitResult> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, plan: 'free', assistantMode: 'basic', remaining: 0, message: 'Sign in to use this tool' };
  }

  const { data: planRow } = await supabase
    .from('user_plans')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const plan = ((planRow?.plan) ?? 'free') as Plan;
  const config = PLAN_CONFIG[plan];

  if (config.windowType === 'unlimited') {
    await supabase.from('usage_logs').insert({ user_id: user.id, tool_slug: toolSlug });
    return { allowed: true, plan, assistantMode: config.assistantMode, remaining: null };
  }

  const now = new Date();
  const windowStart = config.windowType === 'daily'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('used_at', windowStart.toISOString());

  const used = count ?? 0;
  const limit = config.limit!;

  if (used >= limit) {
    const resetAt = config.windowType === 'daily'
      ? new Date(windowStart.getTime() + 86_400_000).toISOString()
      : new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const window = config.windowType === 'daily' ? 'daily' : 'monthly';
    return {
      allowed: false, plan, assistantMode: config.assistantMode, remaining: 0, resetAt,
      message: `You've used all ${limit} ${window} uses on the ${config.label} plan. Upgrade to continue.`,
    };
  }

  await supabase.from('usage_logs').insert({ user_id: user.id, tool_slug: toolSlug });
  return { allowed: true, plan, assistantMode: config.assistantMode, remaining: limit - used - 1 };
}
