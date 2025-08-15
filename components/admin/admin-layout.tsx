"use client"

import type React from "react"

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
} from "lucide-react"
import { Input } from "@/components/ui/input"

const navigation = [
  {
    name: "Main",
    items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    name: "Content Review",
    items: [
      { name: "Pending Businesses", href: "/admin/businesses?status=pending", icon: Clock },
      { name: "Pending Reviews", href: "/admin/reviews?status=pending", icon: MessageSquare },
    ],
  },
  {
    name: "Management",
    items: [
      { name: "All Businesses", href: "/admin/businesses", icon: Building2, badge: "1" },
      { name: "Users", href: "/admin/users", icon: Users, badge: "1" },
      { name: "All Reviews", href: "/admin/reviews", icon: Star, badge: "0" },
      { name: "Categories", href: "/admin/categories", icon: Tag, badge: "9" },
    ],
  },
]

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  searchPlaceholder?: string
  actions?: React.ReactNode
}

export function AdminLayout({ children, title, searchPlaceholder, actions }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Persian Hub Admin</h2>
        </div>

        <nav className="flex-1 px-4 space-y-8">
          {navigation.map((section) => (
            <div key={section.name}>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{section.name}</h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                        )}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "ml-3 inline-block py-0.5 px-2 text-xs rounded-full",
                            isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="mr-3 h-5 w-5 text-gray-400" />
            Back to Directory
          </Link>
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50">
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <div className="flex items-center space-x-4">
              {searchPlaceholder && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder={searchPlaceholder} className="pl-10 w-80" />
                </div>
              )}
              {actions}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  )
}
