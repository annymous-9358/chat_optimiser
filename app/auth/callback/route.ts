import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

/**
 * OAuth providers redirect here after the user approves access.
 * We exchange the one-time `code` for a Supabase session, then
 * redirect to the app root.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Always redirect home — HistoryContext will pick up the new session.
  return NextResponse.redirect(origin);
}
