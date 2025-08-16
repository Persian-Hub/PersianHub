import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")
  const next = requestUrl.searchParams.get("next") || "/"

  console.log("[v0] Callback: OAuth callback received:", { code: !!code, error, error_description })

  if (error) {
    console.log("[v0] Callback: OAuth error:", error, error_description)
    return NextResponse.redirect(new URL("/auth/login?error=oauth_error", request.url))
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      console.log("[v0] Callback: Exchanging code for session (backup)...")
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.log("[v0] Callback: Session exchange error:", exchangeError)
        return NextResponse.redirect(new URL("/auth/login?error=session_error", request.url))
      }

      console.log("[v0] Callback: Session created successfully:", {
        user: data.user?.email,
        session: !!data.session,
      })

      const cleanUrl = new URL(next, request.url)
      return NextResponse.redirect(cleanUrl)
    } catch (error) {
      console.log("[v0] Callback: error:", error)
      return NextResponse.redirect(new URL("/auth/login?error=callback_error", request.url))
    }
  }

  console.log("[v0] Callback: No code received")
  return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
}
