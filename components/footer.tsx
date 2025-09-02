"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Shield, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function Footer() {
  const [businessCount, setBusinessCount] = useState(0)

  useEffect(() => {
    const getBusinessCount = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")

      setBusinessCount(count || 0)
    }

    getBusinessCount()
  }, [])

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔍</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Persian Hub </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Discover amazing local Persian businesses in your area. Connect with services, restaurants, shops, and
              more.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Over {businessCount.toLocaleString()} active businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Verified and trusted</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/businesses" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Search Businesses
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/dashboard/add-business" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Register Business
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Premium Packages
                </Link>
              </li>
              <li>
                <Link href="/mobile" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Mobile App
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support & Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Data Deletion Instructions
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Report an Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Newsletter</h3>
            <p className="text-gray-600 text-sm mb-4">Stay updated with our latest news and special offers</p>
            <div className="space-y-3">
              <Input type="email" placeholder="Enter your email" className="text-sm" />
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Subscribe</Button>
            </div>
            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span>info@persianhub.com.au</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕒</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="py-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Accurate Location</h4>
              <p className="text-sm text-gray-600">Find nearby businesses with GPS precision</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Verified Businesses</h4>
              <p className="text-sm text-gray-600">All businesses are reviewed and verified</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Payment</h4>
              <p className="text-sm text-gray-600">Online payment with highest security</p>
            </div>
          </div>
        </div>

        {/* Mobile App Section */}
        <div className="py-8 bg-blue-600 rounded-2xl text-center text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold mb-2">Download the Mobile App</h3>
          <p className="text-blue-100 mb-6">Easier access to local businesses</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
              Google Play
            </Button>
            <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
              App Store
            </Button>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <span className="text-sm text-gray-600">Follow us:</span>
            <div className="flex space-x-3">
              <Link href="#" className="text-gray-400 hover:text-blue-600">
                <span className="sr-only">Facebook</span>
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-pink-600">
                <span className="sr-only">Instagram</span>
                <div className="w-6 h-6 bg-pink-600 rounded"></div>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-400">
                <span className="sr-only">Twitter</span>
                <div className="w-6 h-6 bg-blue-400 rounded"></div>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-700">
                <span className="sr-only">LinkedIn</span>
                <div className="w-6 h-6 bg-blue-700 rounded"></div>
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-600">© 2024 Persian Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
