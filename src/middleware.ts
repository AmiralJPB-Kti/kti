import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Safety Check for Env Vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Middleware warning: Supabase credentials missing.');
    // If we can't check auth, we must block admin routes to be safe
    if (request.nextUrl.pathname.startsWith('/studio') || request.nextUrl.pathname.startsWith('/admin')) {
         return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
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
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, redirect to home instead of crashing
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/studio/:path*', '/admin/:path*', '/login'], // Apply middleware to /studio, /admin and /login paths
}
