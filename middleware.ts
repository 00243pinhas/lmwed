// Route protection for /dashboard/* — see skills/backend-auth.md.
// Runs on every dashboard request: refreshes the Supabase session cookie,
// then enforces: no session -> login; inactive profile -> sign out + login;
// active session -> allow through.
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

  if (!user) {
    if (isLoginPage) return response;
    return NextResponse.redirect(new URL('/dashboard/login', request.url));
  }

  if (isLoginPage) {
    // Already signed in — no reason to see the login form again.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active')
    .eq('id', user.id)
    .single();

  if (!profile?.active) {
    await supabase.auth.signOut();
    const url = new URL('/dashboard/login', request.url);
    url.searchParams.set('message', 'account-inactive');
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
