import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, User, LogOut, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

export async function Header() {
  let user = null
  let profile = null

  try {
    // Check if required environment variables are available
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      user = authUser

      if (user) {
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        profile = data
      }
    }
  } catch (error) {
    // Silently handle errors during build process
    console.log("[v0] Header: Supabase not available during build, showing logged out state")
  }

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

          {/* Navigation */}
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

          {/* Actions */}
          <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  )
}
