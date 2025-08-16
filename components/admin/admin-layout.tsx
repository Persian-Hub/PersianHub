"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Clock,
  MessageSquare,
  Building2,
  Users,
  Star,
  Tag,
  ArrowLeft,
  LogOut,
  Search,
  Bell,
  Settings,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase/client"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  searchPlaceholder?: string
  actions?: React.ReactNode
}

export function AdminLayout({ children, title, searchPlaceholder, actions }: AdminLayoutProps) {
  const pathname = usePathname()
  const [counts, setCounts] = useState({
    businesses: 0,
    pendingBusinesses: 0,
    users: 0,
    reviews: 0,
    pendingReviews: 0,
    categories: 0,
  })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          businessesResult,
          pendingBusinessesResult,
          usersResult,
          reviewsResult,
          pendingReviewsResult,
          categoriesResult,
        ] = await Promise.all([
          supabase.from("businesses").select("*", { count: "exact", head: true }),
          supabase.from("businesses").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("reviews").select("*", { count: "exact", head: true }),
          supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("categories").select("*", { count: "exact", head: true }),
        ])

        setCounts({
          businesses: businessesResult.count || 0,
          pendingBusinesses: pendingBusinessesResult.count || 0,
          users: usersResult.count || 0,
          reviews: reviewsResult.count || 0,
          pendingReviews: pendingReviewsResult.count || 0,
          categories: categoriesResult.count || 0,
        })
      } catch (error) {
        console.error("Error fetching admin counts:", error)
      }
    }

    fetchCounts()
  }, [])

  const navigation = [
    {
      name: "Main",
      items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
      name: "Content Review",
      items: [
        {
          name: "Pending Businesses",
          href: "/admin/pending-businesses",
          icon: Clock,
          badge: counts.pendingBusinesses > 0 ? counts.pendingBusinesses.toString() : undefined,
          urgent: counts.pendingBusinesses > 0,
        },
        {
          name: "Pending Reviews",
          href: "/admin/pending-reviews",
          icon: MessageSquare,
          badge: counts.pendingReviews > 0 ? counts.pendingReviews.toString() : undefined,
          urgent: counts.pendingReviews > 0,
        },
      ],
    },
    {
      name: "Management",
      items: [
        { name: "All Businesses", href: "/admin/businesses", icon: Building2, badge: counts.businesses.toString() },
        { name: "Users", href: "/admin/users", icon: Users, badge: counts.users.toString() },
        { name: "All Reviews", href: "/admin/reviews", icon: Star, badge: counts.reviews.toString() },
        { name: "Categories", href: "/admin/categories", icon: Tag, badge: counts.categories.toString() },
      ],
    },
  ]

  return (
    <div className="flex h-screen bg-muted/30">
      <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col shadow-lg">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">PH</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground font-serif">Persian Hub</h2>
              <p className="text-sm text-sidebar-foreground/70 font-sans">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {navigation.map((section) => (
            <div key={section.name}>
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-4 font-sans">
                {section.name}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                          isActive
                            ? "text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
                        )}
                      />
                      <span className="flex-1 font-sans">{item.name}</span>
                      {item.badge && (
                        <Badge
                          variant={item.urgent ? "destructive" : "secondary"}
                          className={cn(
                            "ml-3 text-xs font-medium",
                            isActive
                              ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                              : item.urgent
                                ? "bg-destructive text-destructive-foreground animate-pulse"
                                : "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border/50 space-y-2">
          <Link
            href="/"
            className="flex items-center px-4 py-3 text-sm font-medium text-sidebar-foreground/80 rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors font-sans"
          >
            <ArrowLeft className="mr-3 h-5 w-5 text-sidebar-foreground/60" />
            Back to Directory
          </Link>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-sidebar-foreground/80 rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors font-sans">
            <LogOut className="mr-3 h-5 w-5 text-sidebar-foreground/60" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-serif">{title}</h1>
              <p className="text-sm text-muted-foreground font-sans mt-1">Manage your Persian Hub platform</p>
            </div>

            <div className="flex items-center gap-4">
              {searchPlaceholder && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    className="pl-10 w-80 bg-input border-border focus:ring-ring font-sans"
                  />
                </div>
              )}

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {counts.pendingBusinesses + counts.pendingReviews > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                    {counts.pendingBusinesses + counts.pendingReviews}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>

              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">A</AvatarFallback>
              </Avatar>

              {actions}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
