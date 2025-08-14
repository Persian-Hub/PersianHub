import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  Utensils,
  Scissors,
  Home,
  Car,
  ShoppingBag,
  GraduationCap,
  Laptop,
  Calendar,
  Briefcase,
  Plane,
  Hammer,
  Scale,
} from "lucide-react"

const categories = [
  {
    name: "Food & Dining",
    slug: "food-dining",
    description: "Taste the Tradition",
    icon: Utensils,
    color: "bg-red-100 text-red-600",
  },
  {
    name: "Health & Beauty",
    slug: "health-beauty",
    description: "Wellness & Care",
    icon: Scissors,
    color: "bg-pink-100 text-pink-600",
  },
  {
    name: "Home Services",
    slug: "home-services",
    description: "Expert Solutions",
    icon: Home,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Automotive",
    slug: "automotive",
    description: "Drive with Confidence",
    icon: Car,
    color: "bg-gray-100 text-gray-600",
  },
  {
    name: "Retail & Shopping",
    slug: "retail-shopping",
    description: "Unique Finds",
    icon: ShoppingBag,
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Education",
    slug: "education",
    description: "Learn & Grow",
    icon: GraduationCap,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    name: "Technology",
    slug: "technology",
    description: "Digital Innovation",
    icon: Laptop,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Events & Entertainment",
    slug: "events-entertainment",
    description: "Celebrate Life",
    icon: Calendar,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    name: "Professional Services",
    slug: "professional-services",
    description: "Expert Guidance",
    icon: Briefcase,
    color: "bg-teal-100 text-teal-600",
  },
  {
    name: "Travel & Transport",
    slug: "travel-transport",
    description: "Journey Together",
    icon: Plane,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    name: "Construction & Trades",
    slug: "construction-trades",
    description: "Building Dreams",
    icon: Hammer,
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Legal & Finance",
    slug: "legal-finance",
    description: "Trusted Advice",
    icon: Scale,
    color: "bg-slate-100 text-slate-600",
  },
]

export function CategoryGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 mb-4">Explore by Category</h2>
          <p className="font-sans text-lg text-gray-600 max-w-2xl mx-auto">
            Find exactly what you're looking for in our diverse community of Persian businesses
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link key={category.slug} href={`/categories/${category.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                      {category.name}
                    </h3>
                    <p className="font-sans text-sm text-gray-500">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
