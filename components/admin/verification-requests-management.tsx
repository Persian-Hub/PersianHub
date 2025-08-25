"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, Shield, Building2, User, Mail, Phone, Globe, MapPin } from "lucide-react"
import { processVerificationRequest } from "@/lib/actions/admin-verification"

interface VerificationRequest {
  id: string
  business_id: string
  requested_by: string
  status: string
  request_message: string
  admin_notes?: string
  created_at: string
  updated_at: string
  approved_at?: string
  approved_by?: string
  businesses: {
    id: string
    name: string
    slug: string
    address: string
    phone?: string
    email?: string
    website?: string
    is_verified: boolean
    categories?: { name: string }
  }
  profiles: {
    id: string
    full_name: string
    email: string
  }
}

interface VerificationRequestsManagementProps {
  requests: VerificationRequest[]
}

export function VerificationRequestsManagement({ requests }: VerificationRequestsManagementProps) {
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const processedRequests = requests.filter((req) => req.status !== "pending")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const handleProcessRequest = async (approve: boolean) => {
    if (!selectedRequest) return

    setIsProcessing(true)
    try {
      const result = await processVerificationRequest(
        selectedRequest.id,
        selectedRequest.business_id,
        approve,
        adminNotes,
      )

      if (result.success) {
        setDialogOpen(false)
        setSelectedRequest(null)
        setAdminNotes("")
        window.location.reload() // Refresh to show updated status
      } else {
        alert(result.message || "Failed to process verification request")
      }
    } catch (error) {
      console.error("Error processing verification request:", error)
      alert("Failed to process verification request")
    } finally {
      setIsProcessing(false)
    }
  }

  const openDialog = (request: VerificationRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(action)
    setAdminNotes("")
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                <p className="text-2xl font-bold text-amber-600">{pendingRequests.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="processed">Processed Requests ({processedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending verification requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <CardTitle className="font-serif text-xl">{request.businesses.name}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {request.profiles.full_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {request.profiles.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openDialog(request, "approve")}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button onClick={() => openDialog(request, "reject")} variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Business Details</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {request.businesses.address}
                          </div>
                          {request.businesses.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              {request.businesses.phone}
                            </div>
                          )}
                          {request.businesses.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              {request.businesses.email}
                            </div>
                          )}
                          {request.businesses.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-500" />
                              <a
                                href={request.businesses.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {request.businesses.website}
                              </a>
                            </div>
                          )}
                          {request.businesses.categories && (
                            <div className="text-cyan-800 font-medium">{request.businesses.categories.name}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Verification Request</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {request.request_message}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          {processedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No processed verification requests</p>
              </CardContent>
            </Card>
          ) : (
            processedRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <CardTitle className="font-serif text-xl">{request.businesses.name}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                        {request.businesses.is_verified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {request.profiles.full_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Processed {new Date(request.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Original Request</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {request.request_message}
                      </div>
                    </div>
                    {request.admin_notes && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Admin Response</Label>
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700">
                          {request.admin_notes}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Process Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve" : "Reject"} Verification Request</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will mark the business as verified and send a confirmation email to the owner."
                : "This will reject the verification request and send a notification email to the owner."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{selectedRequest.businesses.name}</h4>
                <p className="text-sm text-gray-600 mb-2">Owner: {selectedRequest.profiles.full_name}</p>
                <p className="text-sm text-gray-700">{selectedRequest.request_message}</p>
              </div>

              <div>
                <Label htmlFor="admin-notes" className="text-sm font-medium">
                  {actionType === "approve" ? "Approval Notes (Optional)" : "Rejection Reason"}
                </Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    actionType === "approve"
                      ? "Add any notes about the approval..."
                      : "Please explain why this verification request is being rejected..."
                  }
                  className="mt-1"
                  rows={3}
                  required={actionType === "reject"}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={() => handleProcessRequest(actionType === "approve")}
              disabled={isProcessing || (actionType === "reject" && !adminNotes.trim())}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {isProcessing ? "Processing..." : actionType === "approve" ? "Approve Request" : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
