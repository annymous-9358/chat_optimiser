import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // RLS ensures the row belongs to the authenticated user.
  const { error } = await supabase.from('chat_history').delete().eq('id', id);
  if (error) console.error('[history/:id DELETE]', error.message);

  return Response.json({ ok: true });
}
