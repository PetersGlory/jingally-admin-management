"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getShipments, updateShipmentStatus, getContainers, assignContainerToShipment, updateShipmentPaymentStatus } from "@/lib/api"
import { toast } from "sonner"
import Image from "next/image"
import { 
  User, Mail, Phone, Package, Scale, Ruler, AlertTriangle, 
  CreditCard, Activity, MapPin, Calendar, Clock, ArrowLeft,
  RefreshCw
} from "lucide-react"

interface Address {
  id?: string
  city: string
  type: string
  unit: string | null
  state: string
  street: string
  country: string
  zipCode: string | null
  latitude: string | number
  longitude: string | number
  isVerified?: boolean
  verificationDetails?: any
}

interface Dimensions {
  width: number
  height: number
  length: number
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Container {
  id: string
  containerNumber: string
  type: string
  capacity: number
}

interface Shipment {
  id: string
  userId: string
  status: string
  packageType: string | null
  serviceType: string | null
  packageDescription: string | null
  fragile: boolean | null
  weight: number | null
  dimensions: Dimensions | null
  pickupAddress: Address | null
  deliveryAddress: Address | null
  scheduledPickupTime: string | null
  estimatedDeliveryTime: string | null
  trackingNumber: string
  receiverName: string | null
  receiverPhoneNumber: string | null
  receiverEmail: string | null
  price: string | null
  paymentStatus: string
  notes: string | null
  driverId: string | null
  images: string[]
  createdAt: string
  updatedAt: string
  user: User
  driver: User | null
  container: Container | null
  paymentMethod: string | null
}

export default function ShipmentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false)
  const [containers, setContainers] = useState<Container[]>([])
  const [selectedContainer, setSelectedContainer] = useState("")
  const [isAssigningContainer, setIsAssigningContainer] = useState(false)

  useEffect(() => {
    fetchShipmentDetails()
    fetchContainers()
  }, [params?.id])

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem("token") || ""
      const data = await getShipments(accessToken)
      const shipmentData = data.find((s: Shipment) => s.id === params?.id)
      if (shipmentData) {
        setShipment(shipmentData)
      } else {
        toast.error("Shipment not found")
        router.push("/dashboard/shipments")
      }
    } catch (error) {
      console.error("Error fetching shipment details:", error)
      toast.error("Failed to fetch shipment details")
    } finally {
      setLoading(false)
    }
  }

  const fetchContainers = async () => {
    try {
      const accessToken = localStorage.getItem("token") || ""
      const data = await getContainers(accessToken)
      setContainers(data)
    } catch (error) {
      console.error("Error fetching containers:", error)
      toast.error("Failed to fetch containers")
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!shipment) return
    setIsUpdatingStatus(true)
    try {
      const accessToken = localStorage.getItem("token") || ""
      await updateShipmentStatus(accessToken, shipment.id, { status: newStatus })
      toast.success("Shipment status updated successfully")
      fetchShipmentDetails()
    } catch (error) {
      console.error("Error updating shipment status:", error)
      toast.error("Failed to update shipment status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handlePaymentStatusUpdate = async (newStatus: string) => {
    if (!shipment) return
    setIsUpdatingPaymentStatus(true)
    try {
      const accessToken = localStorage.getItem("token") || ""
      await updateShipmentPaymentStatus(accessToken, shipment.id, { 
        shipmentId: shipment.id, 
        paymentStatus: newStatus 
      })
      toast.success("Payment status updated successfully")
      fetchShipmentDetails()
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Failed to update payment status")
    } finally {
      setIsUpdatingPaymentStatus(false)
    }
  }

  const handleContainerAssignment = async () => {
    if (!shipment || !selectedContainer) return
    setIsAssigningContainer(true)
    try {
      const accessToken = localStorage.getItem("token") || ""
      await assignContainerToShipment(accessToken, shipment.id, selectedContainer)
      toast.success("Container assigned successfully")
      fetchShipmentDetails()
    } catch (error) {
      console.error("Error assigning container:", error)
      toast.error("Failed to assign container")
    } finally {
      setIsAssigningContainer(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500">{status}</Badge>
      case "in_transit":
        return <Badge variant="secondary" className="bg-blue-500 text-white">
          {status.replace("_", " ")}
        </Badge>
      case "out_for_delivery":
        return <Badge variant="outline" className="text-purple-500 border-purple-500">
          {status.replace(/_/g, " ")}
        </Badge>
      case "pending":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">
          {status}
        </Badge>
      case "processing":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">
          {status}
        </Badge>
      case "customs":
        return <Badge variant="outline" className="text-orange-500 border-orange-500">
          {status}
        </Badge>
      default:
        return <Badge variant="outline">{status.replace(/_/g, " ")}</Badge>
    }
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

  if (!shipment) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-red-500">Shipment not found</p>
          <Button onClick={() => router.push("/dashboard/shipments")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shipments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/shipments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipment Details</h1>
            <p className="text-muted-foreground">Tracking Number: {shipment.trackingNumber}</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchShipmentDetails}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <p className="font-medium">{shipment.user.firstName} {shipment.user.lastName}</p>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="font-medium">{shipment.user.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <p className="font-medium">{shipment.user.phone}</p>
              </div>
              {shipment.receiverPhoneNumber && (
                <div className="space-y-2">
                  <Label>Receiver Phone</Label>
                  <p className="font-medium">{shipment.receiverPhoneNumber}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Package Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Package Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight</Label>
                <p className="font-medium">{shipment.weight ? `${shipment.weight} kg` : 'Not specified'}</p>
              </div>
              <div className="space-y-2">
                <Label>Dimensions</Label>
                <p className="font-medium">
                  {shipment.dimensions 
                    ? `${shipment.dimensions.width}x${shipment.dimensions.height}x${shipment.dimensions.length} cm`
                    : 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Fragile</Label>
                <p className="font-medium">{shipment.fragile ? 'Yes' : 'No'}</p>
              </div>
              {shipment.price && (
                <div className="space-y-2">
                  <Label>Price</Label>
                  <p className="font-medium">${shipment.price}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Pickup Address</Label>
                {shipment.pickupAddress ? (
                  <div className="space-y-1">
                    <p className="font-medium">{shipment.pickupAddress.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {shipment.pickupAddress.city}, {shipment.pickupAddress.state}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shipment.pickupAddress.country} {shipment.pickupAddress.zipCode}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not specified</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Delivery Address</Label>
                {shipment.deliveryAddress ? (
                  <div className="space-y-1">
                    <p className="font-medium">{shipment.deliveryAddress.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shipment.deliveryAddress.country} {shipment.deliveryAddress.zipCode}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not specified</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Scheduled Pickup</Label>
                <p className="font-medium">
                  {shipment.scheduledPickupTime 
                    ? new Date(shipment.scheduledPickupTime).toLocaleString()
                    : 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Estimated Delivery</Label>
                <p className="font-medium">
                  {shipment.estimatedDeliveryTime 
                    ? new Date(shipment.estimatedDeliveryTime).toLocaleString()
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status and Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Status Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="flex items-center gap-2">
                {getStatusBadge(shipment.status)}
                <Select
                  defaultValue={shipment.status}
                  onValueChange={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={shipment.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  {shipment.paymentStatus}
                </Badge>
                {shipment.paymentMethod === 'bank_transfer' && shipment.paymentStatus !== 'paid' && (
                  <Select
                    defaultValue={shipment.paymentStatus}
                    onValueChange={handlePaymentStatusUpdate}
                    disabled={isUpdatingPaymentStatus}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Update payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Container Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Container Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {shipment.container ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Container Number</Label>
                  <p className="font-medium">{shipment.container.containerNumber}</p>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <p className="font-medium">{shipment.container.type}</p>
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <p className="font-medium">{shipment.container.capacity} tons</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">No container assigned</p>
                <div className="space-y-2">
                  <Label>Assign Container</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedContainer}
                      onValueChange={setSelectedContainer}
                      disabled={isAssigningContainer}
                    >
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select a container" />
                      </SelectTrigger>
                      <SelectContent>
                        {containers.map((container) => (
                          <SelectItem key={container.id} value={container.id}>
                            {container.containerNumber} - {container.type} ({container.capacity} tons)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleContainerAssignment}
                      disabled={isAssigningContainer || !selectedContainer}
                    >
                      {isAssigningContainer ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Assigning...
                        </>
                      ) : (
                        "Assign Container"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Package Images */}
        {shipment.images && shipment.images.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Package Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {shipment.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`Package image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 