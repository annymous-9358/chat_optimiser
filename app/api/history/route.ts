import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Build client per-request so hot-reloads / new env vars always take effect.
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const supabase = getClient();
  if (!sessionId || !supabase) return Response.json({ entries: [] });

  const { data, error } = await supabase
    .from('chat_history')
    .select('id, type, timestamp, emoji, label, preview, data')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: false })
    .limit(60);

  if (error) {
    console.error('[history GET]', error.message, error.code);
    return Response.json({ entries: [] });
  }
  return Response.json({ entries: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = getClient();
  if (!supabase) {
    console.warn('[history POST] Supabase not configured — using localStorage only');
    return Response.json({ ok: true });
  }

  const { sessionId, entry } = await req.json();
  if (!sessionId || !entry) return Response.json({ ok: false }, { status: 400 });

  const { error } = await supabase.from('chat_history').upsert({
    id: entry.id,
    session_id: sessionId,
    type: entry.type,
    timestamp: entry.timestamp,
    emoji: entry.emoji,
    label: entry.label,
    preview: entry.preview,
    data: entry.data,
  });

  if (error) {
    console.error('[history POST]', error.message, error.code, error.details);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const supabase = getClient();
  if (!sessionId || !supabase) return Response.json({ ok: true });

  const { error } = await supabase
    .from('chat_history')
    .delete()
    .eq('session_id', sessionId);

  if (error) console.error('[history DELETE]', error.message);
  return Response.json({ ok: true });
}
