"use server"

export async function getGoogleMapsScriptUrl() {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) throw new Error("Missing GOOGLE_MAPS_API_KEY")

  // Your real Map ID
  const mapId = "5ba0cee0da187a56483a0d90"

  const params = new URLSearchParams({
    key,
    v: "weekly",
    libraries: "marker,places", // needed for AdvancedMarkerElement and Places API
    map_ids: mapId, // optional but recommended
    loading: "async",
  })

  return `https://maps.googleapis.com/maps/api/js?${params.toString()}`
}
