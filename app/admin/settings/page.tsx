import { AdminLayout } from "@/components/admin/admin-layout"
import { EmailTestUtility } from "@/components/admin/email-test-utility"

export default function AdminSettingsPage() {
  return (
    <AdminLayout title="Platform Settings">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Configuration</h2>
          <p className="text-gray-600">Test and configure email notification settings.</p>
        </div>

        <EmailTestUtility />
      </div>
    </AdminLayout>
  )
}
