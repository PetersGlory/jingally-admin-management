"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getContainers, getDrivers } from "@/lib/api"
import { toast } from "sonner"
import Image from "next/image"
import { 
  User, Mail, Phone, Package, Scale, Ruler, AlertTriangle, 
  CreditCard, Activity, MapPin, Calendar, Clock, ArrowLeft,
  RefreshCw,
  AlertCircle,
  UserPlus
} from "lucide-react"
import { assignContainerToBooking, assignDriverToBooking, getShipmentDetails, updateBookingPayment, updateBookingStatus, updateBookingUser } from "@/lib/shipment"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

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
  containerNumber: string
  type: string
  capacity: number
  location: string
  status: string
}

interface Containers {
  id: string
  containerNumber: string
  type: string
  status: string
  capacity: number
  location: string
  lastMaintenanceDate: string | null
  nextMaintenanceDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Shipment {
  id: string
  adminId: string
  userInfo: any | null
  status: string
  packageType: string | null
  serviceType: string | null
  packageDescription: string | null
  fragile: boolean | null
  weight: number | null
  dimensions: Dimensions | null
  pickupAddress: Address | null
  deliveryAddress: Address | null
  deliveryType: string | null
  scheduledPickupTime: string | null
  estimatedDeliveryTime: string | null
  trackingNumber: string
  receiverName: string | null
  receiverPhoneNumber: string | null
  receiverEmail: string | null
  price: string | null
  paymentStatus: string
  notes: string | null
  paymentMethod: string | null
  driverId: string | null
  containerID: string | null
  images: string[]
  createdAt: string
  updatedAt: string
  driver: any | null
  container: Container | null
}

export default function ShipmentDetailsPage() {
  const router = useRouter()
  const params = useParams();
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false)
  const [containers, setContainers] = useState<Containers[]>([])
  const [selectedContainer, setSelectedContainer] = useState("")
  const [isAssigningContainer, setIsAssigningContainer] = useState(false)
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false)
  const [isEditCustomerLoading, setIsEditCustomerLoading] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [selectedDriver, setSelectedDriver] = useState("")
  const [isAssigningDriver, setIsAssigningDriver] = useState(false)
  const [drivers, setDrivers] = useState<any[]>([])

  useEffect(() => {
    fetchShipmentDetails()
    fetchContainers()
    fetchDrivers()
  }, [params?.id])

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true)
      const accessToken = localStorage.getItem("token") || ""
      const idParams = params?.id || ""
      const response = await getShipmentDetails(idParams, accessToken)

      if (response.success && response.data) {
        setShipment(response.data)
      } else {
        toast.error("Shipment not found")
        router.push("/dashboard/shipments/manual")
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

  const fetchDrivers = async () => {
    try {
      const accessToken = localStorage.getItem("token") || ""
      const data = await getDrivers(accessToken)
      setDrivers(data)
    } catch (error) {
      console.error("Error fetching drivers:", error)
      toast.error("Failed to fetch drivers")
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!shipment) return
    setIsUpdatingStatus(true)
    try {
      const accessToken = localStorage.getItem("token") || ""
      await updateBookingStatus(shipment.id, { status: newStatus }, accessToken)
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
      await updateBookingPayment({ 
        shipmentId: shipment.id, 
        paymentStatus: newStatus 
      }, accessToken)
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
      await assignContainerToBooking(shipment.id, selectedContainer, accessToken)
      toast.success("Container assigned successfully")
      fetchShipmentDetails()
    } catch (error) {
      console.error("Error assigning container:", error)
      toast.error("Failed to assign container")
    } finally {
      setIsAssigningContainer(false)
    }
  }

  const handleDriverAssignment = async (shipmentId: string) => {
    if (!selectedDriver) return
    setIsAssigningDriver(true)
    try {
      const accessToken = localStorage.getItem("token") || ""
      await assignDriverToBooking(shipmentId, selectedDriver, accessToken)
      toast.success("Driver assigned successfully")
      fetchShipmentDetails()
      fetchContainers()
      fetchDrivers()
    } catch (error) {
      console.error("Error assigning driver:", error)
      toast.error("Failed to assign driver")
    } finally {
      setIsAssigningDriver(false)
      setSelectedDriver("")
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

  const handleCustomerFormChange = (field: string, value: string) => {
    setCustomerForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCustomerFormSubmit = async () => {
    setIsEditCustomerLoading(true)
    try {
        const accessToken = localStorage.getItem("token") || ""
        const dataBody = {
            shipmentId: shipment?.id,
            userInfo: {
                firstName: customerForm.firstName,
                lastName: customerForm.lastName,
                email: customerForm.email,
                phone: customerForm.phone
            }
        }
        await updateBookingUser(dataBody, accessToken)
        // Here you would make the API call to update customer information
        toast.success("Customer information updated successfully")
        setIsEditCustomerModalOpen(false)
        fetchShipmentDetails() // Refresh the data
    } catch (error) {
      console.error("Error updating customer information:", error)
      toast.error("Failed to update customer information")
    } finally {
      setIsEditCustomerLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-b from-white to-gray-50">
        <div className="text-center p-8 rounded-xl shadow-lg bg-white/80 backdrop-blur-sm border border-gray-100">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Package className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading shipment details</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your shipment information...</p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-1 w-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-1 w-1 rounded-full bg-primary/40 animate-bounce"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-b from-white to-gray-50">
        <div className="text-center p-8 rounded-xl shadow-lg bg-white/80 backdrop-blur-sm border border-gray-100">
          <div className="relative mb-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shipment Not Found</h2>
          <p className="text-gray-500 mb-6">The requested shipment could not be found in our system.</p>
          <Button onClick={() => router.push("/dashboard/shipments/manual")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
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
          <Button variant="outline" onClick={() => router.push("/dashboard/shipments/manual")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipment Details</h1>
            <p className="text-muted-foreground">Tracking Number: {shipment.trackingNumber}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => {
          fetchShipmentDetails()
          fetchContainers()
          fetchDrivers()
        }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customer Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomerForm({
                  firstName: shipment.userInfo?.firstName || '',
                  lastName: shipment.userInfo?.lastName || '',
                  email: shipment.userInfo?.email || '',
                  phone: shipment.userInfo?.phone || ''
                })
                setIsEditCustomerModalOpen(true)
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <p className="font-medium">{shipment.userInfo?.firstName} {shipment.userInfo?.lastName}</p>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="font-medium">{shipment.userInfo?.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <p className="font-medium">{shipment.userInfo?.phone}</p>
              </div>
              {shipment.receiverPhoneNumber && (
                <div className="space-y-2">
                  <Label>Receiver Phone</Label>
                  <p className="font-medium">{shipment.receiverPhoneNumber}</p>
                </div>
              )}
              {shipment.receiverName && (
                <div className="space-y-2">
                  <Label>Receiver Name</Label>
                  <p className="font-medium">{shipment.receiverName}</p>
                </div>
              )}
              {shipment.receiverEmail && (
                <div className="space-y-2">
                  <Label>Receiver Email</Label>
                  <p className="font-medium">{shipment.receiverEmail}</p>
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
                    ? (() => {
                        let dims = null;
                        try {
                          dims = typeof shipment.dimensions === "string"
                            ? JSON.parse(shipment.dimensions)
                            : shipment.dimensions;
                        } catch (e) {
                          dims = null;
                        }
                        return dims && dims.width && dims.height && dims.length
                          ? `${dims.width}x${dims.height}x${dims.length} cm`
                          : 'Not specified';
                      })()
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
            {(() => {
              let pickupAddressObj = null;
              let deliveryAddressObj = null;
              try {
                pickupAddressObj = typeof shipment.pickupAddress === 'string' ? JSON.parse(shipment.pickupAddress) : shipment.pickupAddress;
              } catch (e) {
                pickupAddressObj = null;
              }
              try {
                deliveryAddressObj = typeof shipment.deliveryAddress === 'string' ? JSON.parse(shipment.deliveryAddress) : shipment.deliveryAddress;
              } catch (e) {
                deliveryAddressObj = null;
              }
              return (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Pickup Address</Label>
                    {pickupAddressObj ? (
                      <div className="space-y-1">
                        <p className="font-medium">{pickupAddressObj.street}</p>
                        <p className="text-sm text-muted-foreground">
                          {pickupAddressObj.city}, {pickupAddressObj.state}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pickupAddressObj.country} {pickupAddressObj.postcode || pickupAddressObj.zipCode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Not specified</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Address</Label>
                    {deliveryAddressObj ? (
                      <div className="space-y-1">
                        <p className="font-medium">{deliveryAddressObj.street}</p>
                        <p className="text-sm text-muted-foreground">
                          {deliveryAddressObj.city}, {deliveryAddressObj.state}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deliveryAddressObj.country} {deliveryAddressObj.postcode || deliveryAddressObj.zipCode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Not specified</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Driver Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipment.driver && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Driver Name</Label>
                    <p className="font-medium">
                      {shipment.driver.firstName} {shipment.driver.lastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Information</Label>
                    <p className="font-medium">{shipment.driver.phone}</p>
                    <p className="text-sm text-muted-foreground">{shipment.driver.email}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Driver Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Driver Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipment.driver ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Driver</Label>
                    <p className="font-medium">
                      {shipment.driver.firstName} {shipment.driver.lastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <p className="font-medium">{shipment.driver.phone}</p>
                    <p className="text-sm text-muted-foreground">{shipment.driver.email}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">No driver assigned</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Driver
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Driver</DialogTitle>
                        <DialogDescription>
                          Select a driver to assign to this shipment
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="driver">Select Driver</Label>
                          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a driver" />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers && drivers.map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  {driver.firstName} {driver.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedDriver("")
                            setIsAssigningDriver(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => handleDriverAssignment(shipment.id)} 
                          disabled={isAssigningDriver || !selectedDriver}
                        >
                          {isAssigningDriver ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Assigning...
                            </>
                          ) : (
                            "Assign Driver"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
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
              <Label>Payment Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
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
                <div className="space-y-2">
                  <Label>Method</Label>
                  <p className="font-medium capitalize">{shipment.paymentMethod}</p>
                </div>
                {shipment.price && (
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <p className="font-medium">${shipment.price}</p>
                  </div>
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
                <div className="space-y-2">
                  <Label>Location</Label>
                  <p className="font-medium">{shipment.container.location}</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge variant={shipment.container.status === 'available' ? 'default' : 'secondary'}>
                    {shipment.container.status}
                  </Badge>
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
        {shipment.images && Array.isArray(shipment.images) && shipment.images.length > 0 && (
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

      {/* Add the Edit Customer Modal */}
      <Dialog open={isEditCustomerModalOpen} onOpenChange={setIsEditCustomerModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={customerForm.firstName}
                  onChange={(e) => handleCustomerFormChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={customerForm.lastName}
                  onChange={(e) => handleCustomerFormChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={customerForm.email}
                onChange={(e) => handleCustomerFormChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={customerForm.phone}
                onChange={(e) => handleCustomerFormChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCustomerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomerFormSubmit}
              disabled={isEditCustomerLoading}
            >
              {isEditCustomerLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </> 
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 