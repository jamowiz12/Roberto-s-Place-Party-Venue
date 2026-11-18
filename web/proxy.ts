import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !/^https?:\/\//.test(url) || url.includes('your-project') || !key || key.includes('your-publishable-key')) {
    return response
  }
  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const protectedRoutes = ['/profile', '/admin']
  const isProtected = protectedRoutes.some((path) => request.nextUrl.pathname.startsWith(path))
  if (isProtected) {
    const { data } = await supabase.auth.getClaims()
    if (!data?.claims) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = { matcher: ['/profile/:path*', '/admin/:path*'] }
