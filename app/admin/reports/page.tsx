import { AdminLayout } from "@/components/admin/admin-layout"
import { BusinessReportsManagement } from "@/components/admin/business-reports-management"

export default function AdminReportsPage() {
  return (
    <AdminLayout title="Business Reports" searchPlaceholder="Search reports...">
      <BusinessReportsManagement />
    </AdminLayout>
  )
}
