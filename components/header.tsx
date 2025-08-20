"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, User, LogOut, Shield, Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { useState } from "react"

interface HeaderProps {
  user?: any
  profile?: any
}

export function Header({ user, profile }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 relative">
              <Image src="/logo.png" alt="Persian Hub Logo" width={40} height={40} className="object-contain" />
            </div>
            <span className="font-serif font-bold text-xl text-gray-900">Persian Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/businesses" className="text-gray-600 hover:text-cyan-800 font-sans">
              Browse Businesses
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-cyan-800 font-sans">
              Categories
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-cyan-800 font-sans">
              About
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <MapPin className="h-4 w-4 mr-2" />
              Near Me
            </Button>

            {user ? (
              <>
                <Link href="/dashboard">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                    Dashboard
                  </Button>
                </Link>

                {profile?.role === "admin" && (
                  <Link href="/admin">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {profile?.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <form action={signOut} className="w-full">
                        <button type="submit" className="flex items-center w-full text-left">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-serif font-bold text-xl text-gray-900">Persian Hub</span>
                    <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  <nav className="flex flex-col space-y-4 mb-8">
                    <Link
                      href="/businesses"
                      className="text-gray-600 hover:text-cyan-800 font-sans py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Browse Businesses
                    </Link>
                    <Link
                      href="/categories"
                      className="text-gray-600 hover:text-cyan-800 font-sans py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Categories
                    </Link>
                    <Link
                      href="/about"
                      className="text-gray-600 hover:text-cyan-800 font-sans py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                  </nav>

                  <div className="flex flex-col space-y-4">
                    <Button variant="ghost" size="sm" className="justify-start">
                      <MapPin className="h-4 w-4 mr-2" />
                      Near Me
                    </Button>

                    {user ? (
                      <>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                            Dashboard
                          </Button>
                        </Link>

                        {profile?.role === "admin" && (
                          <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Admin Panel
                            </Button>
                          </Link>
                        )}

                        <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <User className="h-4 w-4 mr-2" />
                            Profile Settings
                          </Button>
                        </Link>

                        <form action={signOut} className="w-full">
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start bg-transparent"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </form>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                            <User className="h-4 w-4 mr-2" />
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                          <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                            Join Now
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

export async function HeaderWrapper() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    profile = data
  }

  return <Header user={user} profile={profile} />
}
