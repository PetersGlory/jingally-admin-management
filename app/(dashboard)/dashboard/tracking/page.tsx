"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Clock, MapPin, Package, RefreshCw, Search, Truck, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getShipments, updateShipmentStatus } from "@/lib/api"
import { toast } from "sonner"

interface Shipment {
  id: string
  trackingNumber: string
  status: string
  location: string
  timestamp: string
  notes: string
  hasIssue: boolean
  user: {
    firstName: string
    lastName: string
  }
}

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    const accessToken = localStorage.getItem("token") || ""
    try {
      setLoading(true)
      const data = await getShipments(accessToken)
      setShipments(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch shipments. Please try again later.")
      console.error("Error fetching shipments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (shipmentId: string, newStatus: string) => {
    setIsUpdatingStatus(true)
    try {
      const accessToken = localStorage.getItem("token") || ""
      if (!accessToken) {
        throw new Error("No access token found")
      }
      
      await updateShipmentStatus(accessToken, shipmentId, { status: newStatus })
      toast.success("Shipment status updated successfully")
      fetchShipments() // Refresh the shipments list
    } catch (error) {
      console.error("Error updating shipment status:", error)
      toast.error("Failed to update shipment status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Filter shipments based on search query, active tab, and selected status
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${shipment.user.firstName} ${shipment.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" || (activeTab === "issues" && shipment.hasIssue) || (activeTab === "normal" && !shipment.hasIssue)

    const matchesStatus = selectedStatus === "all" || shipment.status === selectedStatus

    return matchesSearch && matchesTab && matchesStatus
  })

  // Get count of shipments with issues
  const issuesCount = shipments.filter((shipment) => shipment.hasIssue).length

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500">{status}</Badge>
      case "in_transit":
        return (
          <Badge variant="secondary" className="bg-blue-500 text-white">
            {status.replace("_", " ")}
          </Badge>
        )
      case "out_for_delivery":
        return (
          <Badge variant="outline" className="text-purple-500 border-purple-500">
            {status.replace(/_/g, " ")}
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            {status}
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            {status}
          </Badge>
        )
      case "delayed":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            {status}
          </Badge>
        )
      case "exception":
        return <Badge variant="destructive">{status}</Badge>
      case "lost":
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge variant="outline">{status.replace(/_/g, " ")}</Badge>
    }
  }

  // Get status icon
  const getStatusIcon = (status: string, hasIssue: boolean) => {
    if (hasIssue) {
      switch (status) {
        case "delayed":
          return <Clock className="h-5 w-5 text-orange-500" />
        case "exception":
          return <AlertCircle className="h-5 w-5 text-red-500" />
        case "lost":
          return <XCircle className="h-5 w-5 text-red-500" />
        default:
          return <AlertCircle className="h-5 w-5 text-red-500" />
      }
    } else {
      switch (status) {
        case "delivered":
          return <CheckCircle className="h-5 w-5 text-green-500" />
        case "in_transit":
          return <Truck className="h-5 w-5 text-blue-500" />
        case "out_for_delivery":
          return <Truck className="h-5 w-5 text-purple-500" />
        case "pending":
          return <Clock className="h-5 w-5 text-yellow-500" />
        case "processing":
          return <Package className="h-5 w-5 text-blue-500" />
        default:
          return <Package className="h-5 w-5 text-muted-foreground" />
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchShipments} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tracking Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchShipments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/tracking/update">
              <Truck className="mr-2 h-4 w-4" />
              Update Status
            </Link>
          </Button>
        </div>
      </div>

      {/* Issues Alert */}
      {issuesCount > 0 && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            There {issuesCount === 1 ? "is" : "are"} {issuesCount} shipment{issuesCount === 1 ? "" : "s"} with tracking issues that need your attention.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tracking Updates</CardTitle>
          <CardDescription>Monitor shipment status and manage tracking information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Updates</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="normal">Normal</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center gap-2 sm:max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracking..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="exception">Exception</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No tracking updates found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id} className={shipment.hasIssue ? "bg-red-50 dark:bg-red-950/10" : ""}>
                        <TableCell>{getStatusIcon(shipment.status, shipment.hasIssue)}</TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/tracking/${shipment.trackingNumber}`} className="hover:underline">
                            {shipment.trackingNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{`${shipment.user.firstName} ${shipment.user.lastName}`}</TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {shipment.location}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(shipment.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{shipment.notes}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/tracking/update?id=${shipment.id}`}>Update</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredShipments.length}</strong> of <strong>{shipments.length}</strong> tracking updates
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

