import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth / magic-link callback.
 * Creates the redirect response first, then wires Supabase to write session
 * cookies directly onto that response — so the Set-Cookie headers are present
 * in the 302 that the browser follows.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Build the redirect response up front so we can attach cookies to it.
  // Redirect into the app workspace, not the public marketing home page.
  const response = NextResponse.redirect(`${origin}/app`);

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Write session cookies onto the redirect response.
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
