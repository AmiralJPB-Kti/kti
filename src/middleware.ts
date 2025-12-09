import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  const adminEmails = typeof adminEmailsEnv === 'string' 
    ? adminEmailsEnv.split(',').map(e => e.trim().toLowerCase()) 
    : [];

  let isAdmin = false;
  const userEmail = session?.user?.email;
  if (userEmail && typeof userEmail === 'string') {
    isAdmin = adminEmails.includes(userEmail.toLowerCase());
  }
  const isProtectedPath = request.nextUrl.pathname.startsWith('/studio') || request.nextUrl.pathname.startsWith('/admin');

  // If trying to access a protected path and not authenticated OR not an admin
  if (isProtectedPath && (!session || !isAdmin)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login'; // Redirect to login page
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response
}

export const config = {
  matcher: ['/studio/:path*', '/admin/:path*', '/login'], // Apply middleware to /studio, /admin and /login paths
}
