"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MoreHorizontal, Download, Package, RefreshCw, Plane, Ship, Eye, UserPlus, Calendar, Clock, MapPin, User, Phone, Mail, Scale, Ruler, AlertTriangle, CreditCard, Activity } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getShipments, updateShipmentStatus, getContainers, assignContainerToShipment, updateShipmentPaymentStatus } from "@/lib/api"
import Image from "next/image"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

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
  container: Container | null,
  paymentMethod: string | null
}

export default function ShipmentsPage() {
  const [selectedShipments, setSelectedShipments] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<string>("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [containers, setContainers] = useState<any[]>([])
  const [selectedContainer, setSelectedContainer] = useState("")
  const [containerSearchQuery, setContainerSearchQuery] = useState("")
  const [isAssigningContainer, setIsAssigningContainer] = useState(false)
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false)
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false)

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    const accessToken = localStorage.getItem("token") || "";
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

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedShipments.length === filteredShipments.length) {
      setSelectedShipments([])
    } else {
      setSelectedShipments(filteredShipments.map((shipment) => shipment.id))
    }
  }

  // Handle individual checkbox selection
  const handleSelectShipment = (shipmentId: string) => {
    if (selectedShipments.includes(shipmentId)) {
      setSelectedShipments(selectedShipments.filter((id) => id !== shipmentId))
    } else {
      setSelectedShipments([...selectedShipments, shipmentId])
    }
  }

  // Filter shipments based on search query and active tab
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.pickupAddress?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.deliveryAddress?.city.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && shipment.packageType === activeTab
  })

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
      case "customs":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            {status}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status.replace(/_/g, " ")}</Badge>
    }
  }

  // Get shipment type icon
  const getShipmentTypeIcon = (type: string) => {
    switch (type) {
      case "parcel":
        return <Package className="h-4 w-4 text-muted-foreground" />
      case "airfreight":
        return <Plane className="h-4 w-4 text-muted-foreground" />
      case "seafreight":
        return <Ship className="h-4 w-4 text-muted-foreground" />
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />
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

  const handlePaymentStatusUpdate = async (shipmentId: string, newStatus: string) => {
    setIsUpdatingPaymentStatus(true)
    try {
      const accessToken = localStorage.getItem("token") || ""
      await updateShipmentPaymentStatus(accessToken, shipmentId, { shipmentId: shipmentId, paymentStatus: newStatus })
      toast.success("Shipment payment status updated successfully")
      fetchShipments() // Refresh the shipments list
    } catch (error) {
      console.error("Error updating shipment payment status:", error)
      toast.error("Failed to update shipment payment status")
    } finally {
      setIsUpdatingPaymentStatus(false)
    }
  }

  const handleContainerAssignment = async (shipmentId: string) => {
    if (!selectedContainer) {
      toast.error("Please select a container")
      return
    }

    setIsAssigningContainer(true)
    try {
      const accessToken = localStorage.getItem("token") || ""
      await assignContainerToShipment(accessToken, shipmentId, selectedContainer)
      toast.success("Container assigned successfully")
      setIsContainerModalOpen(false)
      setSelectedContainer("")
      fetchShipments() // Refresh the shipments list
    } catch (error) {
      console.error("Error assigning container:", error)
      toast.error("Failed to assign container")
    } finally {
      setIsAssigningContainer(false)
    }
  }

  // Filter containers based on search query
  const filteredContainers = containers.filter((container) =>
    container.containerNumber.toLowerCase().includes(containerSearchQuery.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold tracking-tight">Shipment Management</h1>
        
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>Manage all shipments, track status, and update information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Shipments</TabsTrigger>
                <TabsTrigger value="parcel">Parcels</TabsTrigger>
                <TabsTrigger value="airfreight">Airfreight</TabsTrigger>
                <TabsTrigger value="seafreight">Seafreight</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center gap-2 sm:max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shipments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedShipments.length === filteredShipments.length && filteredShipments.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all shipments"
                      />
                    </TableHead>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Container</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No shipments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedShipments.includes(shipment.id)}
                            onCheckedChange={() => handleSelectShipment(shipment.id)}
                            aria-label={`Select shipment ${shipment.trackingNumber}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/shipments/${shipment.id}`} className="hover:underline">
                            {shipment.trackingNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{shipment.user.firstName} {shipment.user.lastName}</span>
                            <span className="text-sm text-muted-foreground">{shipment.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell>
                          <Badge variant={shipment.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                            {shipment.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {shipment.paymentMethod ? (
                            <Badge variant="default">
                              {shipment.paymentMethod}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {shipment.container ? (
                            <Badge variant="default">
                              {shipment.container.containerNumber}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/shipments/${shipment.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </Button>

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
                                    <label htmlFor="driver">Select Driver</label>
                                    <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a driver" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="driver1">Driver 1</SelectItem>
                                        <SelectItem value="driver2">Driver 2</SelectItem>
                                        <SelectItem value="driver3">Driver 3</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedDriver("")}>Cancel</Button>
                                  <Button onClick={() => {
                                    // Handle driver assignment
                                    setSelectedDriver("")
                                  }}>Assign Driver</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog onOpenChange={setIsContainerModalOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => fetchContainers()}>
                                  <Package className="mr-2 h-4 w-4" />
                                  Add to Container
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assign Container</DialogTitle>
                                  <DialogDescription>
                                    Select a container to assign to this shipment
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="container-search">Search Containers</Label>
                                    <Input
                                      id="container-search"
                                      placeholder="Search by container number..."
                                      value={containerSearchQuery}
                                      onChange={(e) => setContainerSearchQuery(e.target.value)}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="container">Select Container</Label>
                                    <Select
                                      value={selectedContainer}
                                      onValueChange={setSelectedContainer}
                                      disabled={isAssigningContainer}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a container" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {filteredContainers.map((container) => (
                                          <SelectItem key={container.id} value={container.id}>
                                            {container.containerNumber} - {container.type} ({container.capacity} tons)
                                          </SelectItem>
                                        ))}
                                        {filteredContainers.length === 0 && (
                                          <SelectItem value="none" disabled>
                                            No containers found
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsContainerModalOpen(false)
                                      setSelectedContainer("")
                                      setContainerSearchQuery("")
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleContainerAssignment(shipment.id)}
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
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
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
            Showing <strong>{filteredShipments.length}</strong> of <strong>{shipments.length}</strong> shipments
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  )
}

