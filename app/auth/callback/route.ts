import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(redirectUrl);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('error', 'missing_supabase_env');
    return NextResponse.redirect(redirectUrl);
  }

  const redirectTo = url.searchParams.get('redirect_to') || '/dashboard';
  const redirectUrl = new URL(redirectTo, url.origin);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code);

  return response;
}


