import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

const ERR_COLUMN_NOT_FOUND = '42703';
const ERR_SCHEMA_CACHE     = 'PGRST204';

function isMigrationMissing(code?: string) {
  return code === ERR_COLUMN_NOT_FOUND || code === ERR_SCHEMA_CACHE;
}

async function getAuthedClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

// ── DELETE /api/history/[id] ──────────────────────────────────────────────────
// Soft-delete one entry → moves it to archive.
// The DB row is NEVER hard-deleted by this endpoint.
// To permanently remove a row, do it directly in the Supabase dashboard.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
    .eq('id', id)
    .eq('user_id', user.id);

  if (error && isMigrationMissing(error.code)) {
    // Migration not run — nothing to soft-delete yet.
    return Response.json({ ok: true, migrationPending: true });
  }

  if (error) console.error('[history/:id archive]', error.message);
  return Response.json({ ok: true });
}

// ── PATCH /api/history/[id] — restore an archived entry back to active ────────
export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await getAuthedClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: true });

  const { error } = await supabase
    .from('chat_history')
    .update({
      is_deleted: false,
      deleted_at: null,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) console.error('[history/:id restore]', error.message);
  return Response.json({ ok: true });
}
