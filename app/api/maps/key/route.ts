import { NextResponse } from "next/server"

export async function GET() {
  const key = process.env.GOOGLE_MAPS_BROWSER_KEY

  if (!key) {
    return NextResponse.json({ error: "Maps API key not configured" }, { status: 500 })
  }

  return NextResponse.json({ key })
}
