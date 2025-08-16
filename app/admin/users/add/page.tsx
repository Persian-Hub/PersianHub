import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AddUserForm } from "@/components/admin/add-user-form"

async function checkAdminAccess() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }
}

export default async function AddUserPage() {
  await checkAdminAccess()

  return (
    <AdminLayout title="Add User">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Create New User Account</h2>
          <p className="text-gray-600">Add a new user to the Persian Hub platform.</p>
        </div>
        <AddUserForm />
      </div>
    </AdminLayout>
  )
}
