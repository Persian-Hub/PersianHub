"use client"
import { MoreHorizontal, Tag } from "lucide-react"

interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  category_id: string
}

interface CategoryManagementProps {
  categories: Category[]
}

export function CategoryManagement({ categories }: CategoryManagementProps) {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.subcategories.length} subcategories</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="space-y-2">
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{subcategory.name}</span>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreHorizontal className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
