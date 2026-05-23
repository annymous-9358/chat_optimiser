import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = getClient();

  if (supabase) {
    const { error } = await supabase.from('chat_history').delete().eq('id', id);
    if (error) console.error('[history/:id DELETE]', error.message);
  }

  return Response.json({ ok: true });
}
