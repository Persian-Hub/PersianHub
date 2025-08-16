import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  const res = NextResponse.next()
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    console.log("[v0] Middleware: OAuth code detected, redirecting to callback route...")
    return NextResponse.redirect(new URL(`/auth/callback?code=${code}`, request.url))
  }

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  const protectedRoutes = ["/dashboard", "/profile", "/admin"]

  const requiresAuth = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (requiresAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const redirectUrl = new URL("/auth/login", request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}
