"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery, "in", location)
  }

  return (
    <section className="bg-gradient-to-br from-cyan-50 to-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Content */}
          <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-6">
            Discover Your Community's <span className="text-cyan-800">Hidden Gems</span>
          </h1>

          <p className="font-sans text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Explore Persian-owned businesses near you that celebrate our culture and heritage.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search businesses, services, or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 focus:ring-0 text-base h-12"
                />
              </div>

              <div className="sm:w-48 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 border-0 focus:ring-0 text-base h-12"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 h-12 font-medium"
              >
                Search
              </Button>
            </div>
          </form>

          {/* CTA Button */}
          <Button size="lg" className="bg-cyan-800 hover:bg-cyan-900 text-white px-8 py-3 text-lg font-medium">
            Start Browsing
          </Button>
        </div>
      </div>
    </section>
  )
}
