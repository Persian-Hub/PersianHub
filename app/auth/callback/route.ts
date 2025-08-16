import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  console.log("[v0] OAuth callback received:", { code: !!code, error, error_description })

  if (error) {
    console.log("[v0] OAuth error:", error, error_description)
    return NextResponse.redirect(new URL("/auth/login?error=oauth_error", request.url))
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      console.log("[v0] Exchanging code for session...")
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.log("[v0] Session exchange error:", exchangeError)
        return NextResponse.redirect(new URL("/auth/login?error=session_error", request.url))
      }

      console.log("[v0] Session created successfully:", {
        user: data.user?.email,
        session: !!data.session,
      })

      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch (error) {
      console.log("[v0] Callback error:", error)
      return NextResponse.redirect(new URL("/auth/login?error=callback_error", request.url))
    }
  }

  console.log("[v0] No code received in callback")
  return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
}
