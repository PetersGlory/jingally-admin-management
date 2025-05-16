"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, MapPin, Package, RefreshCw, Truck, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { trackShipment } from "@/lib/api"
import { toast } from "sonner"

interface Address {
  city: string
  type: string
  state: string
  street: string
  country: string
  placeId: string
  latitude: number
  postcode: string
  longitude: number
}

interface ShipmentDetails {
  trackingNumber: string
  status: string
  estimatedDeliveryTime: string
  pickupAddress: Address
  deliveryAddress: Address
}

export default function TrackingDetailsPage() {
  const params = useParams()
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchShipmentDetails()
  }, [params.trackingID])

  const fetchShipmentDetails = async () => {
    const accessToken = localStorage.getItem("token") || ""
    try {
      setLoading(true)
      const response = await trackShipment(accessToken, params.trackingID as string)
      setShipment(response.data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch shipment details. Please try again later.")
      console.error("Error fetching shipment details:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      delivered: { label: "Delivered", variant: "default" },
      in_transit: { label: "In Transit", variant: "secondary" },
      out_for_delivery: { label: "Out for Delivery", variant: "secondary" },
      pending: { label: "Pending", variant: "outline" },
      processing: { label: "Processing", variant: "secondary" },
      delayed: { label: "Delayed", variant: "destructive" },
      exception: { label: "Exception", variant: "destructive" },
      lost: { label: "Lost", variant: "destructive" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "outline" }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchShipmentDetails} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-gray-600">Shipment not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tracking Details</h1>
        <Button variant="outline" onClick={fetchShipmentDetails}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment Information</CardTitle>
          <CardDescription>Tracking number: {shipment.trackingNumber}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Status</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(shipment.status)}
                  {getStatusBadge(shipment.status)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Estimated Delivery</h3>
                <p className="mt-1">
                  {new Date(shipment.estimatedDeliveryTime).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pickup Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{shipment.pickupAddress.street}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shipment.pickupAddress.city}, {shipment.pickupAddress.state}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shipment.pickupAddress.country} {shipment.pickupAddress.postcode}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{shipment.deliveryAddress.street}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shipment.deliveryAddress.country} {shipment.deliveryAddress.postcode}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
