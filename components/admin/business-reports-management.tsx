"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Shield,
  Flag,
  DollarSign,
  FileText,
  Copyright,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  Calendar,
  MessageSquare,
} from "lucide-react"
import { getBusinessReports, updateBusinessReportStatus } from "@/lib/actions/business-reports"

interface BusinessReport {
  id: string
  business_id: string
  reporter_id: string
  report_category: string
  description: string
  status: string
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  businesses: {
    id: string
    name: string
    slug: string
  } | null
}

const reportCategories = {
  bullying_unwanted_contact: {
    label: "Bullying or unwanted contact",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  restricted_items: {
    label: "Selling or promoting restricted items",
    icon: Shield,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  nudity_sexual_activity: {
    label: "Nudity or sexual activity",
    icon: Flag,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  scam_fraud_spam: {
    label: "Scam, fraud or spam",
    icon: DollarSign,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  false_information: {
    label: "False information",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  intellectual_property: {
    label: "Intellectual Property",
    icon: Copyright,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  child_sexual_abuse: {
    label: "Child Sexual Abuse and Exploitation",
    icon: AlertCircle,
    color: "text-red-800",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
  },
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-800", icon: Eye },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  dismissed: { label: "Dismissed", color: "bg-gray-100 text-gray-800", icon: XCircle },
}

export function BusinessReportsManagement() {
  const [reports, setReports] = useState<BusinessReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<BusinessReport | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const result = await getBusinessReports()
      if (result.success) {
        setReports(result.reports || [])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = (report: BusinessReport) => {
    setSelectedReport(report)
    setNewStatus(report.status)
    setAdminNotes(report.admin_notes || "")
    setIsDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedReport || !newStatus) return

    setIsUpdating(true)
    try {
      const result = await updateBusinessReportStatus(selectedReport.id, newStatus, adminNotes)
      if (result.success) {
        await fetchReports()
        setIsDialogOpen(false)
        setSelectedReport(null)
      }
    } catch (error) {
      console.error("Error updating report:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getFilteredReports = (status: string) => {
    if (status === "all") return reports
    return reports.filter((report) => report.status === status)
  }

  const renderReportCard = (report: BusinessReport) => {
    const category = reportCategories[report.report_category as keyof typeof reportCategories]
    const status = statusConfig[report.status as keyof typeof statusConfig]
    const IconComponent = category?.icon || AlertTriangle
    const StatusIcon = status?.icon || Clock

    return (
      <Card key={report.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${category?.bgColor} ${category?.borderColor} border`}>
                <IconComponent className={`h-5 w-5 ${category?.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{report.businesses?.name || "Unknown Business"}</CardTitle>
                <p className="text-sm text-muted-foreground">{category?.label}</p>
              </div>
            </div>
            <Badge className={status?.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status?.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground line-clamp-3">{report.description}</div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(report.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Reporter ID: {report.reporter_id?.slice(0, 8)}...
            </div>
          </div>

          {report.admin_notes && (
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs font-medium">Admin Notes</span>
              </div>
              <p className="text-sm">{report.admin_notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => handleViewReport(report)} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Review
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/businesses/${report.businesses?.slug}`} target="_blank" rel="noopener noreferrer">
                <Building2 className="h-4 w-4 mr-2" />
                View Business
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  const pendingReports = getFilteredReports("pending")
  const underReviewReports = getFilteredReports("under_review")
  const resolvedReports = getFilteredReports("resolved")
  const dismissedReports = getFilteredReports("dismissed")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReports.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{underReviewReports.length}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedReports.length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dismissedReports.length}</p>
                <p className="text-sm text-muted-foreground">Dismissed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="under_review">Under Review ({underReviewReports.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedReports.length})</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed ({dismissedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending reports</h3>
                <p className="text-muted-foreground">All reports have been reviewed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingReports.map(renderReportCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="under_review" className="space-y-4">
          {underReviewReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No reports under review</h3>
                <p className="text-muted-foreground">No reports are currently being reviewed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {underReviewReports.map(renderReportCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No resolved reports</h3>
                <p className="text-muted-foreground">No reports have been resolved yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resolvedReports.map(renderReportCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dismissed" className="space-y-4">
          {dismissedReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No dismissed reports</h3>
                <p className="text-muted-foreground">No reports have been dismissed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dismissedReports.map(renderReportCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Business Report</DialogTitle>
            <DialogDescription>Review and update the status of this business report.</DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Business</Label>
                  <p className="text-sm">{selectedReport.businesses?.name || "Unknown Business"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Report Category</Label>
                  <p className="text-sm">
                    {reportCategories[selectedReport.report_category as keyof typeof reportCategories]?.label}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reported Date</Label>
                  <p className="text-sm">{new Date(selectedReport.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <p className="text-sm">{statusConfig[selectedReport.status as keyof typeof statusConfig]?.label}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Report Description</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating || !newStatus}>
              {isUpdating ? "Updating..." : "Update Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
