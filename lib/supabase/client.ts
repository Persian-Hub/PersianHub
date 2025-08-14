import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export function createClient() {
  try {
    if (!isSupabaseConfigured) {
      console.warn("Supabase environment variables are not set.")
      return null
    }
    return createClientComponentClient()
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
}

let clientInstance: any = null
try {
  if (isSupabaseConfigured) {
    clientInstance = createClientComponentClient()
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
  clientInstance = null
}

export const supabase = clientInstance
