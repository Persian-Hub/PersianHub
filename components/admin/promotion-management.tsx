"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, DollarSign, Settings, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { updatePromotionSettings } from "@/lib/actions/promotion"
import { toast } from "sonner"

interface Promotion {
  id: string
  amount: number
  currency: string
  status: string
  promotion_start_date: string | null
  promotion_end_date: string | null
  created_at: string
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  businesses: {
    name: string
    slug: string
    address: string
  }
  profiles: {
    full_name: string
    email: string
  }
}

interface PromotionSettings {
  promotion_cost: number
  promotion_duration_days: number
  currency: string
}

interface PromotionManagementProps {
  promotions: Promotion[]
  settings: PromotionSettings
}

export function PromotionManagement({ promotions, settings: initialSettings }: PromotionManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [editingSettings, setEditingSettings] = useState(false)
  const [newSettings, setNewSettings] = useState(initialSettings)
  const [isLoading, setIsLoading] = useState(false)

  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch =
      promotion.businesses?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || promotion.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isActive = (promotion: Promotion) => {
    if (promotion.status !== "completed" || !promotion.promotion_start_date || !promotion.promotion_end_date)
      return false
    const now = new Date()
    const start = new Date(promotion.promotion_start_date)
    const end = new Date(promotion.promotion_end_date)
    return now >= start && now <= end
  }

  const getDaysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const handleUpdateSettings = async () => {
    setIsLoading(true)
    try {
      await updatePromotionSettings(
        newSettings.promotion_cost,
        newSettings.promotion_duration_days,
        newSettings.currency,
      )
      setEditingSettings(false)
      toast.success("Promotion settings updated successfully")
      window.location.reload() // Refresh to show updated settings
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error("Failed to update promotion settings")
    } finally {
      setIsLoading(false)
    }
  }

  const totalRevenue = promotions.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)

  const activePromotions = promotions.filter((p) => isActive(p)).length
  const completedPromotions = promotions.filter((p) => p.status === "completed").length
  const pendingPromotions = promotions.filter((p) => p.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Promotions</p>
                <p className="text-2xl font-bold text-gray-900">{activePromotions}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedPromotions}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPromotions}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Promotion Settings
            </span>
            <Dialog open={editingSettings} onOpenChange={setEditingSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Edit Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Promotion Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cost">Promotion Cost</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">$</span>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newSettings.promotion_cost}
                        onChange={(e) =>
                          setNewSettings({
                            ...newSettings,
                            promotion_cost: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (Days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={newSettings.promotion_duration_days}
                      onChange={(e) =>
                        setNewSettings({
                          ...newSettings,
                          promotion_duration_days: Number.parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={newSettings.currency}
                      onValueChange={(value) =>
                        setNewSettings({
                          ...newSettings,
                          currency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setEditingSettings(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateSettings} disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Settings"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Cost</p>
              <p className="text-xl font-semibold text-gray-900">
                ${initialSettings.promotion_cost.toFixed(2)} {initialSettings.currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="text-xl font-semibold text-gray-900">{initialSettings.promotion_duration_days} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Currency</p>
              <p className="text-xl font-semibold text-gray-900">{initialSettings.currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by business name, owner name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPromotions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No promotions found</p>
            ) : (
              filteredPromotions.map((promotion) => (
                <div key={promotion.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {promotion.businesses?.name || "Unknown Business"}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(promotion.status)}`}
                        >
                          {getStatusIcon(promotion.status)}
                          <span className="capitalize">{promotion.status}</span>
                        </div>
                        {isActive(promotion) && (
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p>
                            <strong>Owner:</strong> {promotion.profiles?.full_name || "Unknown"}
                          </p>
                          <p>
                            <strong>Email:</strong> {promotion.profiles?.email || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Amount:</strong> ${promotion.amount.toFixed(2)} {promotion.currency}
                          </p>
                          <p>
                            <strong>Date:</strong> {new Date(promotion.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          {promotion.promotion_start_date && promotion.promotion_end_date && (
                            <>
                              <p>
                                <strong>Period:</strong> {new Date(promotion.promotion_start_date).toLocaleDateString()}{" "}
                                - {new Date(promotion.promotion_end_date).toLocaleDateString()}
                              </p>
                              {isActive(promotion) && (
                                <p>
                                  <strong>Days Remaining:</strong> {getDaysRemaining(promotion.promotion_end_date)}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
