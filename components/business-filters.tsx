"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Category {
  id: number
  name: string
  slug: string
}

interface BusinessFiltersProps {
  categories: Category[]
  searchParams: {
    category?: string
    location?: string
    search?: string
    sort?: string
  }
}

async function trackSearchAnalytics(searchTerm: string) {
  if (!searchTerm.trim()) return

  const supabase = createClient()
  const cleanTerm = searchTerm.toLowerCase().trim()

  try {
    // Check if this search term already exists
    const { data: existingAnalytics, error: fetchError } = await supabase
      .from("category_search_analytics")
      .select("id, search_count")
      .eq("search_term", cleanTerm)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[v0] Error fetching search analytics:", fetchError)
      return
    }

    if (existingAnalytics) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("category_search_analytics")
        .update({
          search_count: existingAnalytics.search_count + 1,
          last_searched_at: new Date().toISOString(),
        })
        .eq("id", existingAnalytics.id)

      if (updateError) {
        console.error("[v0] Error updating search analytics:", updateError)
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase.from("category_search_analytics").insert({
        search_term: cleanTerm,
        search_count: 1,
        first_searched_at: new Date().toISOString(),
        last_searched_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("[v0] Error inserting search analytics:", insertError)
      }
    }

    console.log(`[v0] Tracked search for: "${cleanTerm}"`)
  } catch (error) {
    console.error("[v0] Error in trackSearchAnalytics:", error)
  }
}

export function BusinessFilters({ categories, searchParams }: BusinessFiltersProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "")
  const [location, setLocation] = useState(searchParams.location || "")

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(currentSearchParams.toString())

    if (value && value !== "") {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/businesses?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(currentSearchParams.toString())

    if (searchQuery) {
      params.set("search", searchQuery)
      trackSearchAnalytics(searchQuery)
    } else {
      params.delete("search")
    }

    if (location) {
      params.set("location", location)
    } else {
      params.delete("location")
    }

    router.push(`/businesses?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setLocation("")
    router.push("/businesses")
  }

  const hasActiveFilters = searchParams.category || searchParams.search || searchParams.location

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="search" className="font-sans text-sm font-medium">
                Business or Service
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="font-sans text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="City or suburb"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full bg-cyan-800 hover:bg-cyan-900">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={searchParams.category || "all"} onValueChange={(value) => updateFilters("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={searchParams.sort || "newest"} onValueChange={(value) => updateFilters("sort", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  )
}
