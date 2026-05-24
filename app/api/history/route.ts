import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

// PostgreSQL/PostgREST error codes we handle.
const ERR_COLUMN_NOT_FOUND = '42703';   // PostgreSQL: column does not exist
const ERR_SCHEMA_CACHE     = 'PGRST204'; // PostgREST: column not in schema cache

function isMigrationMissing(code?: string) {
  return code === ERR_COLUMN_NOT_FOUND || code === ERR_SCHEMA_CACHE;
}

async function getAuthedClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

// Read the archive_retention_days config from DB (falls back to 30 if missing).
async function getRetentionDays(supabase: Awaited<ReturnType<typeof getAuthedClient>>): Promise<number> {
  try {
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'archive_retention_days')
      .single();
    const days = parseInt(data?.value ?? '30', 10);
    return isNaN(days) || days < 1 ? 30 : days;
  } catch {
    return 30;
  }
}

// ── GET /api/history ──────────────────────────────────────────────────────────
// ?archived=1  → return soft-deleted entries within the configured retention window
// default      → return active entries
//
// NOTE: Nothing is ever hard-deleted from the DB by application code.
// Items age out of the archive UI once their deleted_at + retention_days passes,
// but the DB row remains untouched. An admin can restore any item by flipping
// is_deleted = false directly in the Supabase dashboard.
export async function GET(req: NextRequest) {
  const supabase = await getAuthedClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ entries: [] });

  const showArchived = req.nextUrl.searchParams.get('archived') === '1';

  if (showArchived) {
    const retentionDays = await getRetentionDays(supabase);

    // Show only items whose deleted_at is within the retention window.
    // Items older than the window are hidden in UI but NEVER deleted from DB.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const { data, error } = await supabase
      .from('chat_history')
      .select('id, type, timestamp, emoji, label, preview, data, deleted_at')
      .eq('user_id', user.id)
      .eq('is_deleted', true)
      .gte('deleted_at', cutoff.toISOString())
      .order('deleted_at', { ascending: false })
      .limit(200);

    if (error && isMigrationMissing(error.code)) {
      return Response.json({ entries: [], retentionDays, migrationPending: true });
    }
    if (error) {
      console.error('[history GET archived]', error.message, error.code);
      return Response.json({ entries: [], retentionDays });
    }
    return Response.json({ entries: data ?? [], retentionDays });
  }

  // ── Active entries ─────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('chat_history')
    .select('id, type, timestamp, emoji, label, preview, data')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error && isMigrationMissing(error.code)) {
    // Migration not applied — fall back to all rows (no is_deleted filter).
    const { data: rows, error: e2 } = await supabase
      .from('chat_history')
      .select('id, type, timestamp, emoji, label, preview, data')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (e2) console.error('[history GET fallback]', e2.message);
    return Response.json({ entries: rows ?? [], migrationPending: true });
  }

  if (error) {
    console.error('[history GET]', error.message, error.code);
    return Response.json({ entries: [] });
  }
  return Response.json({ entries: data ?? [] });
}

// ── POST /api/history ─────────────────────────────────────────────────────────
// Create / upsert an active entry.
export async function POST(req: NextRequest) {
  const supabase = await getAuthedClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });

  const { entry } = await req.json();
  if (!entry) return Response.json({ ok: false }, { status: 400 });

  const base = {
    id:        entry.id,
    user_id:   user.id,
    type:      entry.type,
    timestamp: entry.timestamp,
    emoji:     entry.emoji,
    label:     entry.label,
    preview:   entry.preview,
    data:      entry.data,
  };

  // Try with the archive columns first.
  const { error } = await supabase.from('chat_history').upsert({
    ...base,
    is_deleted: false,
    deleted_at: null,
  });

  if (error && isMigrationMissing(error.code)) {
    const { error: e2 } = await supabase.from('chat_history').upsert(base);
    if (e2) {
      console.error('[history POST fallback]', e2.message);
      return Response.json({ ok: false, error: e2.message }, { status: 500 });
    }
    return Response.json({ ok: true, migrationPending: true });
  }

  if (error) {
    console.error('[history POST]', error.message, error.code);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}

// ── DELETE /api/history ───────────────────────────────────────────────────────
// Soft-delete all active rows → moves them to archive.
// Items are NEVER hard-deleted from the DB by this endpoint.
export async function DELETE(req: NextRequest) {
  const supabase = await getAuthedClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: true });

  const now = new Date();
  const { error } = await supabase
    .from('chat_history')
    .update({
      is_deleted: true,
      deleted_at: now.toISOString(),
    })
    .eq('user_id', user.id)
    .eq('is_deleted', false);

  if (error && isMigrationMissing(error.code)) {
    // Migration not run — skip (can't soft-delete without the columns).
    return Response.json({ ok: true, migrationPending: true });
  }

  if (error) {
    console.error('[history archive all]', error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
