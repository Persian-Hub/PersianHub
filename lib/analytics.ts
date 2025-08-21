import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type ClickAction = "view" | "call" | "directions"

interface TrackClickOptions {
  businessId: string
  action: ClickAction
  userId?: string
}

// Client-side click tracking function
export async function trackClick({ businessId, action, userId }: TrackClickOptions): Promise<void> {
  try {
    console.log("[v0] Tracking click:", { businessId, action, userId })

    // Send tracking request in background (non-blocking)
    const response = await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessId,
        actionType: action,
        userId,
      }),
    })

    if (!response.ok) {
      console.warn("[v0] Analytics tracking failed:", response.status)
    } else {
      const result = await response.json()
      if (result.deduplicated) {
        console.log("[v0] Click was deduplicated")
      } else {
        console.log("[v0] Click tracked successfully")
      }
    }
  } catch (error) {
    // Fail silently - analytics should never break user experience
    console.warn("[v0] Analytics tracking error:", error)
  }
}

// Hook for getting current user ID
export function useAnalyticsUser() {
  const supabase = createClientComponentClient()

  const getCurrentUserId = async (): Promise<string | undefined> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user?.id
    } catch {
      return undefined
    }
  }

  return { getCurrentUserId }
}

// Utility to track business view (for page visits)
export async function trackBusinessView(businessId: string): Promise<void> {
  try {
    const supabase = createClientComponentClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await trackClick({
      businessId,
      action: "view",
      userId: user?.id,
    })
  } catch (error) {
    console.warn("[v0] Failed to track business view:", error)
  }
}

// Utility functions for common tracking scenarios
export const analytics = {
  trackView: (businessId: string, userId?: string) => trackClick({ businessId, action: "view", userId }),

  trackCall: (businessId: string, userId?: string) => trackClick({ businessId, action: "call", userId }),

  trackDirections: (businessId: string, userId?: string) => trackClick({ businessId, action: "directions", userId }),
}
