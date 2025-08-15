"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery, "in category:", category)
  }

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hero Content */}
        

        

        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          Discover amazing local Persian businesses in your area. Connect with services, restaurants, shops, and more.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base bg-white border-0 rounded-lg"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="sm:w-48 h-12 bg-white border-0 rounded-lg">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food & Dining</SelectItem>
                <SelectItem value="health">Health & Beauty</SelectItem>
                <SelectItem value="home">Home Services</SelectItem>
                <SelectItem value="automotive">Automotive</SelectItem>
                <SelectItem value="retail">Retail & Shopping</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>
    </section>
  )
}
