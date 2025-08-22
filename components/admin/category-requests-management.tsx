"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Check,
  X,
  Clock,
  Users,
  Search,
  TrendingUp,
  MessageSquare,
  Building2,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { notify } from "@/lib/ui/notify"
import { confirm } from "@/components/ui/confirm-dialog"

interface CategoryRequest {
  id: string
  proposed_category_name: string
  proposed_subcategory_name?: string
  description: string
  example_businesses?: string
  status: "pending" | "approved" | "rejected" | "merged"
  admin_notes?: string
  created_at: string
  updated_at: string
  profiles?: { full_name: string; email: string }
  businesses?: { name: string }
  business_id?: string
}

interface SearchAnalytic {
  id: string
  search_term: string
  search_count: number
  first_searched_at: string
  last_searched_at: string
}

interface CategoryRequestsManagementProps {
  categoryRequests: CategoryRequest[]
  searchAnalytics: SearchAnalytic[]
}

export function CategoryRequestsManagement({
  categoryRequests: initialRequests,
  searchAnalytics,
}: CategoryRequestsManagementProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [loading, setLoading] = useState<string | null>(null)
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({})
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  const filteredRequests = requests.filter(
    (request) =>
      request.proposed_category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.businesses?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingRequests = filteredRequests.filter((r) => r.status === "pending")
  const processedRequests = filteredRequests.filter((r) => r.status !== "pending")

  const getRequestCount = (categoryName: string) => {
    return requests.filter(
      (r) => r.proposed_category_name.toLowerCase() === categoryName.toLowerCase() && r.status === "pending",
    ).length
  }

  const getSearchCount = (categoryName: string) => {
    const analytics = searchAnalytics.find((s) => s.search_term.toLowerCase() === categoryName.toLowerCase())
    return analytics?.search_count || 0
  }

  const handleManualAutoApproval = async () => {
    const confirmed = await confirm({
      title: "Run Auto-Approval Process",
      description:
        "This will check all pending category requests and automatically approve those that meet the thresholds (10+ requests or 100+ searches). Continue?",
      confirmText: "Run Auto-Approval",
    })

    if (!confirmed) return

    setLoading("auto-approval")
    try {
      const response = await fetch("/api/admin/auto-approve-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Refresh the page to show updated data
      window.location.reload()

      notify.success(`Auto-approval completed: ${result.approved} of ${result.processed} requests approved`)
    } catch (error) {
      console.error("Error running auto-approval:", error)
      notify.error("Failed to run auto-approval process. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handleUpdateStatus = async (
    requestId: string,
    newStatus: "approved" | "rejected" | "merged",
    notes?: string,
  ) => {
    const confirmed = await confirm({
      title: `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} Category Request`,
      description: `Are you sure you want to ${newStatus} this category request?`,
      confirmText: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
      variant: newStatus === "rejected" ? "destructive" : "default",
    })

    if (!confirmed) return

    setLoading(requestId)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase
        .from("category_requests")
        .update({
          status: newStatus,
          admin_notes: notes || adminNotes[requestId] || null,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) throw error

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: newStatus,
                admin_notes: notes || adminNotes[requestId] || null,
                updated_at: new Date().toISOString(),
              }
            : req,
        ),
      )

      notify.success(`Category request ${newStatus} successfully!`)
    } catch (error) {
      console.error(`Error ${newStatus}ing category request:`, error)
      notify.error(`Failed to ${newStatus} category request. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  const handleBulkApprove = async (categoryName: string) => {
    const matchingRequests = requests.filter(
      (r) => r.proposed_category_name.toLowerCase() === categoryName.toLowerCase() && r.status === "pending",
    )

    const confirmed = await confirm({
      title: "Bulk Approve Category Requests",
      description: `Are you sure you want to approve all ${matchingRequests.length} requests for "${categoryName}"?`,
      confirmText: "Approve All",
    })

    if (!confirmed) return

    setLoading("bulk-approve")
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const requestIds = matchingRequests.map((r) => r.id)

      const { error } = await supabase
        .from("category_requests")
        .update({
          status: "approved",
          admin_notes: `Bulk approved with ${matchingRequests.length} requests`,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in("id", requestIds)

      if (error) throw error

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          requestIds.includes(req.id)
            ? {
                ...req,
                status: "approved" as const,
                admin_notes: `Bulk approved with ${matchingRequests.length} requests`,
                updated_at: new Date().toISOString(),
              }
            : req,
        ),
      )

      notify.success(`Bulk approved ${matchingRequests.length} category requests!`)
    } catch (error) {
      console.error("Error bulk approving requests:", error)
      notify.error("Failed to bulk approve requests. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "merged":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Merged
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAutoApprovalStatus = (categoryName: string) => {
    const requestCount = getRequestCount(categoryName)
    const searchCount = getSearchCount(categoryName)

    if (requestCount >= 10 || searchCount >= 100) {
      return { eligible: true, reason: `${requestCount} requests, ${searchCount} searches` }
    }
    return { eligible: false, reason: `${requestCount}/10 requests, ${searchCount}/100 searches` }
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search category requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleManualAutoApproval}
            disabled={loading === "auto-approval"}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${loading === "auto-approval" ? "animate-spin" : ""}`} />
            {loading === "auto-approval" ? "Running..." : "Run Auto-Approval"}
          </Button>
          <div className="text-sm text-muted-foreground">
            {pendingRequests.length} pending • {processedRequests.length} processed
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Processed ({processedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Search Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No pending requests</h3>
                <p className="text-sm text-muted-foreground">All category requests have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => {
              const autoApproval = getAutoApprovalStatus(request.proposed_category_name)
              const isExpanded = expandedRequest === request.id

              return (
                <Card key={request.id} className="border-l-4 border-l-yellow-400">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{request.proposed_category_name}</CardTitle>
                          {request.proposed_subcategory_name && (
                            <Badge variant="outline">{request.proposed_subcategory_name}</Badge>
                          )}
                          {getStatusBadge(request.status)}
                          {autoApproval.eligible && (
                            <Badge className="bg-green-100 text-green-800">Auto-Eligible</Badge>
                          )}
                        </div>
                        {request.businesses?.name ? (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-blue-600">
                              Requested by business: {request.businesses.name}
                            </span>
                          </div>
                        ) : (
                          <div className="mb-2">
                            <span className="text-sm text-muted-foreground">
                              No business associated (ID: {request.business_id || "null"})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {getRequestCount(request.proposed_category_name)} requests
                          </div>
                          <div className="flex items-center gap-1">
                            <Search className="h-4 w-4" />
                            {getSearchCount(request.proposed_category_name)} searches
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span
                              className={
                                request.businesses?.name ? "text-blue-600 font-medium" : "text-muted-foreground"
                              }
                            >
                              {request.businesses?.name ||
                                `No business associated (ID: ${request.business_id || "null"})`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                      </div>

                      {request.example_businesses && (
                        <div>
                          <Label className="text-sm font-medium">Example Businesses</Label>
                          <p className="text-sm text-muted-foreground mt-1">{request.example_businesses}</p>
                        </div>
                      )}

                      <div>
                        <Label htmlFor={`notes-${request.id}`} className="text-sm font-medium">
                          Admin Notes
                        </Label>
                        <Textarea
                          id={`notes-${request.id}`}
                          placeholder="Add notes for this request..."
                          value={adminNotes[request.id] || ""}
                          onChange={(e) => setAdminNotes((prev) => ({ ...prev, [request.id]: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Requested By</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.profiles?.full_name} ({request.profiles?.email})
                          {request.businesses?.name ? (
                            <span className="block mt-1 text-blue-600 font-medium">
                              Business: {request.businesses.name}
                            </span>
                          ) : (
                            <span className="block mt-1 text-muted-foreground">
                              No business associated (Business ID: {request.business_id || "null"})
                            </span>
                          )}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Auto-Approval Status</Label>
                        <p className="text-sm text-muted-foreground mt-1">{autoApproval.reason}</p>
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <Button
                          onClick={() => handleUpdateStatus(request.id, "approved")}
                          disabled={loading === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(request.id, "rejected")}
                          disabled={loading === request.id}
                          variant="destructive"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        {getRequestCount(request.proposed_category_name) > 1 && (
                          <Button
                            onClick={() => handleBulkApprove(request.proposed_category_name)}
                            disabled={loading === "bulk-approve"}
                            variant="outline"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Bulk Approve ({getRequestCount(request.proposed_category_name)})
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          {processedRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{request.proposed_category_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {request.profiles?.full_name} • {new Date(request.updated_at).toLocaleDateString()}
                      {request.businesses?.name ? (
                        <span className="block text-blue-600 font-medium">Business: {request.businesses.name}</span>
                      ) : (
                        <span className="block text-muted-foreground">
                          No business associated (ID: {request.business_id || "null"})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {request.admin_notes && (
                  <p className="text-sm text-muted-foreground mt-2 italic">"{request.admin_notes}"</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Term Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchAnalytics.slice(0, 20).map((analytics) => (
                  <div key={analytics.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{analytics.search_term}</h4>
                      <p className="text-sm text-muted-foreground">
                        First searched: {new Date(analytics.first_searched_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{analytics.search_count}</div>
                      <div className="text-sm text-muted-foreground">searches</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
