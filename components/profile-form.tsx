"use client"

import { useRouter } from "next/navigation"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"

interface User {
  id: string
  email?: string
  app_metadata?: {
    provider?: string
    providers?: string[]
  }
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
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  })

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    match: false,
  })

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    is_business_owner: profile?.is_business_owner || false,
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const isOAuthUser = user.app_metadata?.provider === "google" || user.app_metadata?.providers?.includes("google")

  useEffect(() => {
    setPasswordValidation({
      minLength: passwordData.newPassword.length >= 8,
      match: passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword.length > 0,
    })
  }, [passwordData.newPassword, passwordData.confirmPassword])

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

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating profile. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New passwords do not match. Please check and try again.",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
      })
      return
    }

    setPasswordLoading(true)
    console.log("[v0] Starting password update process")

    try {
      if (!isOAuthUser && passwordData.oldPassword) {
        console.log("[v0] Verifying old password for non-OAuth user")
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: passwordData.oldPassword,
        })

        if (signInError) {
          console.log("[v0] Old password verification failed:", signInError.message)
          toast({
            variant: "destructive",
            title: "Incorrect Password",
            description: "Current password is incorrect. Please try again.",
          })
          setPasswordLoading(false)
          return
        }
        console.log("[v0] Old password verified successfully")
      }

      console.log("[v0] Updating user password")
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) {
        console.log("[v0] Password update error:", error.message)
        throw error
      }

      console.log("[v0] Password updated successfully")

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Success",
        description: isOAuthUser
          ? "Password created successfully! You can now sign in with email and password."
          : "Password updated successfully!",
      })
    } catch (error) {
      console.error("[v0] Error updating password:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating password. Please try again.",
      })
    } finally {
      console.log("[v0] Resetting password loading state")
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
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

      {/* Password Management Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-gray-600" />
            <CardTitle className="font-serif text-xl">{isOAuthUser ? "Create Password" : "Change Password"}</CardTitle>
          </div>
          <p className="text-sm text-gray-600 font-sans mt-2">
            {isOAuthUser
              ? "You signed in with Google. Create a password to enable email/password login."
              : "Update your password to keep your account secure."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="space-y-4">
              {!isOAuthUser && (
                <div className="space-y-2">
                  <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 font-sans">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      id="old_password"
                      type={showPassword.old ? "text" : "password"}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      required
                      className="pr-10"
                      aria-label="Current password"
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword.old ? "Hide current password" : "Show current password"}
                    >
                      {showPassword.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 font-sans">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={8}
                    className="pr-10"
                    aria-label="New password"
                    aria-required="true"
                    aria-describedby="password-requirements"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword.new ? "Hide new password" : "Show new password"}
                  >
                    {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.newPassword && (
                  <div className="flex items-center gap-2 text-xs" id="password-requirements">
                    {passwordValidation.minLength ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" aria-hidden="true" />
                    )}
                    <span className={passwordValidation.minLength ? "text-green-600" : "text-red-600"}>
                      At least 8 characters
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 font-sans">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="pr-10"
                    aria-label="Confirm new password"
                    aria-required="true"
                    aria-describedby="password-match"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword.confirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs" id="password-match">
                    {passwordValidation.match ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-600" aria-hidden="true" />
                    )}
                    <span className={passwordValidation.match ? "text-green-600" : "text-red-600"}>
                      {passwordValidation.match ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={passwordLoading || !passwordValidation.minLength || !passwordValidation.match}
              className="bg-cyan-800 hover:bg-cyan-900 disabled:opacity-50"
              aria-busy={passwordLoading}
            >
              {passwordLoading ? "Updating..." : isOAuthUser ? "Create Password" : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
