"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, UserCheck, UserX, Crown, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_business_owner: boolean
  created_at: string
  phone?: string
}

interface UserManagementProps {
  users: User[]
}

export function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "business_owner":
        return "default"
      default:
        return "secondary"
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("profiles").update(updates).eq("id", userId)

      if (error) throw error

      setEditingUser(null)
      router.refresh()
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Users ({filteredUsers.length})</span>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="business_owner">Business Owners</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {user.role === "admin" ? (
                    <Crown className="h-5 w-5 text-yellow-600" />
                  ) : user.is_business_owner ? (
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  ) : (
                    <UserX className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-700">{user.full_name || "No name provided"}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                  <p className="text-xs text-gray-400">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role || "user"}</Badge>
                {user.is_business_owner && <Badge variant="outline">Business Owner</Badge>}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Full Name</label>
                          <Input
                            value={editingUser.full_name || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <Input
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone</label>
                          <Input
                            value={editingUser.phone || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Role</label>
                          <Select
                            value={editingUser.role || "user"}
                            onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="business_owner">Business Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-between pt-4">
                          <Button
                            onClick={() =>
                              handleUpdateUser(editingUser.id, {
                                full_name: editingUser.full_name,
                                email: editingUser.email,
                                phone: editingUser.phone,
                                role: editingUser.role,
                              })
                            }
                            disabled={isLoading}
                          >
                            Save Changes
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(editingUser.id)}
                            disabled={isLoading}
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete User
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
