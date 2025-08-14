"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email?: string
}

interface Profile {
  id: string
  full_name?: string
  phone?: string
  is_business_owner: boolean
}

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    is_business_owner: profile?.is_business_owner || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      router.refresh()
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-sans">
                Email
              </label>
              <Input id="email" type="email" value={user.email || ""} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500 font-sans">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 font-sans">
                Full Name
              </label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 font-sans">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+61 xxx xxx xxx"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_business_owner"
                checked={formData.is_business_owner}
                onCheckedChange={(checked) => setFormData({ ...formData, is_business_owner: checked as boolean })}
              />
              <label htmlFor="is_business_owner" className="text-sm font-medium text-gray-700 font-sans">
                I am a business owner
              </label>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="bg-cyan-800 hover:bg-cyan-900">
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
