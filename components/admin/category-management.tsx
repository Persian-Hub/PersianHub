"use client"
import { useState, useTransition } from "react"
import { Tag, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/actions"

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

export function CategoryManagement({ categories: initialCategories }: CategoryManagementProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newSubcategoryName, setNewSubcategoryName] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append("name", newCategoryName.trim())

      const result = await createCategory(null, formData)

      if (result.error) {
        alert(result.error)
      } else if (result.data) {
        setCategories((prev) => [...prev, { ...result.data, subcategories: [] }])
        setNewCategoryName("")
      }
    })
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append("categoryId", editingCategory.id)
      formData.append("name", editingCategory.name.trim())

      const result = await updateCategory(null, formData)

      if (result.error) {
        alert(result.error)
      } else {
        setCategories((prev) => prev.map((cat) => (cat.id === editingCategory.id ? editingCategory : cat)))
        setEditingCategory(null)
      }
    })
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure? This will also delete all subcategories.")) return

    startTransition(async () => {
      const result = await deleteCategory(categoryId)

      if (result.error) {
        alert(result.error)
      } else {
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      }
    })
  }

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategoryId) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append("name", newSubcategoryName.trim())
      formData.append("categoryId", selectedCategoryId)

      const result = await createSubcategory(null, formData)

      if (result.error) {
        alert(result.error)
      } else if (result.data) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === selectedCategoryId ? { ...cat, subcategories: [...cat.subcategories, result.data] } : cat,
          ),
        )
        setNewSubcategoryName("")
        setSelectedCategoryId("")
      }
    })
  }

  const handleEditSubcategory = async () => {
    if (!editingSubcategory || !editingSubcategory.name.trim()) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append("subcategoryId", editingSubcategory.id)
      formData.append("name", editingSubcategory.name.trim())

      const result = await updateSubcategory(null, formData)

      if (result.error) {
        alert(result.error)
      } else {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            subcategories: cat.subcategories.map((sub) =>
              sub.id === editingSubcategory.id ? editingSubcategory : sub,
            ),
          })),
        )
        setEditingSubcategory(null)
      }
    })
  }

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return

    startTransition(async () => {
      const result = await deleteSubcategory(subcategoryId)

      if (result.error) {
        alert(result.error)
      } else {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            subcategories: cat.subcategories.filter((sub) => sub.id !== subcategoryId),
          })),
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Add New Category</h3>
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
            />
            <Button onClick={handleAddCategory} disabled={isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Add New Subcategory</h3>
          <div className="space-y-2">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Subcategory name"
              />
              <Button onClick={handleAddSubcategory} disabled={isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

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
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setEditingCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Category Name</Label>
                        <Input
                          value={editingCategory?.name || ""}
                          onChange={(e) =>
                            setEditingCategory((prev) => (prev ? { ...prev, name: e.target.value } : null))
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleEditCategory} disabled={isPending}>
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingCategory(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-700"
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {category.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{subcategory.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingSubcategory(subcategory)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Subcategory</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Subcategory Name</Label>
                            <Input
                              value={editingSubcategory?.name || ""}
                              onChange={(e) =>
                                setEditingSubcategory((prev) => (prev ? { ...prev, name: e.target.value } : null))
                              }
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleEditSubcategory} disabled={isPending}>
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => setEditingSubcategory(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
