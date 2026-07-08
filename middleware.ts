// Route protection for /dashboard/* — see skills/backend-auth.md.
// Runs on every dashboard request: refreshes the Supabase session cookie,
// then enforces: no session -> login; inactive profile -> sign out + login;
// active session -> allow through.
//
// The dashboard is deliberately English-only (see CLAUDE.md) and stays
// completely outside next-intl's locale routing below — this function is
// dispatched to only for /dashboard/* requests.
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

async function dashboardMiddleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/dashboard/login';
  const isSetPasswordPage = request.nextUrl.pathname === '/dashboard/set-password';

  if (!user) {
    if (isLoginPage) return response;
    return NextResponse.redirect(new URL('/dashboard/login', request.url));
  }

  // Fetch the profile before deciding what an already-authenticated session
  // is allowed to do — an inactive profile must never reach the "already
  // signed in" branch below, whatever page it's on (including /dashboard/login
  // itself, e.g. right after a login attempt that succeeded at the auth
  // level but belongs to a deactivated account).
  const { data: profile } = await supabase
    .from('profiles')
    .select('active, must_change_password')
    .eq('id', user.id)
    .single();

  if (!profile?.active) {
    await supabase.auth.signOut();
    const url = new URL('/dashboard/login', request.url);
    url.searchParams.set('message', 'account-inactive');
    // supabase.auth.signOut() clears the session cookies by reassigning the
    // `response` closure variable above (via the cookies.setAll callback) —
    // but NextResponse.redirect() below creates a brand-new response object
    // that would otherwise discard those cleared cookies, leaving the old
    // session cookie intact and causing an infinite redirect loop between
    // this page and /dashboard/login (the still-"logged in" cookie keeps
    // bouncing back here). Copy the cleared cookies onto the response we
    // actually return.
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (isLoginPage) {
    // Already signed in (and active) — no reason to see the login form again.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // First-login forced password change (skills/backend-auth.md) — enforced
  // here, not just in the UI, so a staffer can't reach any dashboard content
  // (including via a direct URL) before setting their own password.
  if (profile.must_change_password && !isSetPasswordPage) {
    return NextResponse.redirect(new URL('/dashboard/set-password', request.url));
  }

  if (!profile.must_change_password && isSetPasswordPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// The public site (marketing pages + /my-dress) is locale-aware; /dashboard
// keeps its own English-only auth middleware, untouched by next-intl.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return dashboardMiddleware(request);
  }
  return intlMiddleware(request);
}

export const config = {
  // Runs on every request except /api, Next internals, and static files —
  // this covers /dashboard/* (handled above) and every locale-prefixed
  // public route (handled by next-intl).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
