export interface VerboseWorkingHours {
  [day: string]: {
    open: string
    close: string
    closed: boolean
  }
}

export interface StandardWorkingHours {
  [day: string]: string // "09:00 - 17:00" or "Closed"
}

// Day name mappings
const DAY_MAPPINGS = {
  monday: "mon",
  tuesday: "tue",
  wednesday: "wed",
  thursday: "thu",
  friday: "fri",
  saturday: "sat",
  sunday: "sun",
} as const

const REVERSE_DAY_MAPPINGS = {
  mon: "monday",
  tue: "tuesday",
  wed: "wednesday",
  thu: "thursday",
  fri: "friday",
  sat: "saturday",
  sun: "sunday",
} as const

/**
 * Convert verbose working hours format to standardized format
 * From: {"monday": {"open": "09:00", "close": "17:00", "closed": false}}
 * To: {"mon": "09:00 - 17:00"}
 */
export function convertToStandardFormat(verboseHours: VerboseWorkingHours): StandardWorkingHours {
  const standardHours: StandardWorkingHours = {}

  Object.entries(verboseHours).forEach(([day, hours]) => {
    const shortDay = DAY_MAPPINGS[day as keyof typeof DAY_MAPPINGS]
    if (shortDay) {
      if (hours.closed) {
        standardHours[shortDay] = "Closed"
      } else {
        standardHours[shortDay] = `${hours.open} - ${hours.close}`
      }
    }
  })

  return standardHours
}

/**
 * Convert standardized working hours format to verbose format for form display
 * From: {"mon": "09:00 - 17:00"}
 * To: {"monday": {"open": "09:00", "close": "17:00", "closed": false}}
 */
export function convertToVerboseFormat(standardHours: StandardWorkingHours): VerboseWorkingHours {
  const verboseHours: VerboseWorkingHours = {}

  Object.entries(standardHours).forEach(([shortDay, timeString]) => {
    const fullDay = REVERSE_DAY_MAPPINGS[shortDay as keyof typeof REVERSE_DAY_MAPPINGS]
    if (fullDay) {
      if (timeString === "Closed") {
        verboseHours[fullDay] = {
          open: "09:00",
          close: "17:00",
          closed: true,
        }
      } else {
        const [open, close] = timeString.split(" - ")
        verboseHours[fullDay] = {
          open: open || "09:00",
          close: close || "17:00",
          closed: false,
        }
      }
    }
  })

  return verboseHours
}

/**
 * Normalize working hours data - handles both old and new formats
 * Always returns verbose format for form compatibility
 */
export function normalizeWorkingHours(hours: any): VerboseWorkingHours {
  if (!hours) {
    // Return default hours
    return {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "09:00", close: "17:00", closed: true },
    }
  }

  // Parse if string
  if (typeof hours === "string") {
    try {
      hours = JSON.parse(hours)
    } catch {
      return normalizeWorkingHours(null) // Return defaults if parsing fails
    }
  }

  // Check if it's already in verbose format (has 'open', 'close', 'closed' properties)
  const firstKey = Object.keys(hours)[0]
  if (firstKey && typeof hours[firstKey] === "object" && "open" in hours[firstKey]) {
    return hours as VerboseWorkingHours
  }

  // Check if it's in standard format (string values like "09:00 - 17:00")
  if (firstKey && typeof hours[firstKey] === "string") {
    return convertToVerboseFormat(hours as StandardWorkingHours)
  }

  // Fallback to defaults
  return normalizeWorkingHours(null)
}
