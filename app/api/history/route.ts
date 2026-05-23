import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

async function getAuthedClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function GET() {
  const supabase = await getAuthedClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn('[history GET] No authenticated user');
    return Response.json({ entries: [] });
  }

  const { data, error } = await supabase
    .from('chat_history')
    .select('id, type, timestamp, emoji, label, preview, data')
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[history GET]', error.message, error.code);
    return Response.json({ entries: [] });
  }
  return Response.json({ entries: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await getAuthedClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn('[history POST] No authenticated user');
    return Response.json({ ok: false }, { status: 401 });
  }

  const { entry } = await req.json();
  if (!entry) return Response.json({ ok: false }, { status: 400 });

  const { error } = await supabase.from('chat_history').upsert({
    id:        entry.id,
    user_id:   user.id,
    type:      entry.type,
    timestamp: entry.timestamp,
    emoji:     entry.emoji,
    label:     entry.label,
    preview:   entry.preview,
    data:      entry.data,
  });

  if (error) {
    console.error('[history POST]', error.message, error.code, error.details);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}

export async function DELETE() {
  const supabase = await getAuthedClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: true });

  const { error } = await supabase
    .from('chat_history')
    .delete()
    .eq('user_id', user.id);

  if (error) console.error('[history DELETE]', error.message);
  return Response.json({ ok: true });
}
