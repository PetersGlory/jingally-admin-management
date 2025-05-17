"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, Search, Filter, Download, RefreshCw, ArrowLeft, Eye, UserPlus, FileDown, Receipt, CreditCard, Package2, MoreVertical } from "lucide-react"
import { getShipments } from "@/lib/shipment"
import { toast } from "sonner"
import PackagePayment from "../create/PackagePayment"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { format } from "date-fns"
import { jsPDF } from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// import "jspdf-autotable";

// Form validation schema
const userInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phoneNumber: z.string().min(1, "Phone number is required"),
})

type UserInfoFormData = z.infer<typeof userInfoSchema>

interface Shipment {
  id: string
  trackingNumber: string
  status: string
  packageType: string | null
  serviceType: string | null
  packageDescription: string | null
  fragile: boolean | null
  weight: number | null
  dimensions: {
    width: number
    height: number
    length: number
  } | null
  pickupAddress: {
    city: string
    type: string
    state: string
    street: string
    country: string
    postcode: string
  } | null
  deliveryAddress: {
    city: string
    type: string
    state: string
    street: string
    country: string
    postcode: string
  } | null
  deliveryType: string
  scheduledPickupTime: string | null
  estimatedDeliveryTime: string | null
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
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
}

interface ContainerInfo {
  containerNumber: string;
  containerType: string;
  sealNumber: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

// Add these styles at the top of the file after imports
const modalStyles = {
  content: "max-w-4xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col",
  header: "border-b border-gray-200 pb-4 flex-shrink-0",
  title: "text-2xl font-bold text-gray-900",
  description: "text-sm text-gray-500 mt-1",
  section: "bg-gray-50 rounded-lg p-4",
  sectionTitle: "text-lg font-semibold text-gray-900 mb-3",
  infoGrid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  infoItem: "flex flex-col space-y-1",
  infoLabel: "text-sm font-medium text-gray-500",
  infoValue: "text-sm text-gray-900",
  divider: "border-t border-gray-200 my-4",
  footer: "flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 flex-shrink-0",
  scrollableContent: "overflow-y-auto flex-1 px-6 py-4",
}

export default function ManualShipmentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isUpdatePaymentModalOpen, setIsUpdatePaymentModalOpen] = useState(false)
  const [isUpdateContainerModalOpen, setIsUpdateContainerModalOpen] = useState(false)
  const [selectedShipmentForUpdate, setSelectedShipmentForUpdate] = useState<Shipment | null>(null)
  const totalSteps = 1

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoSchema),
  })

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    const accessToken = localStorage.getItem("token") || ""
    try {
      setLoading(true)
      const data = await getShipments(accessToken)
      setShipments(data.data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch shipments. Please try again later.")
      console.error("Error fetching shipments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  const onSubmit = async (data: UserInfoFormData) => {
    try {
      // Here you would typically make an API call to update the user information
      console.log("User info submitted:", data)
      toast.success("User information updated successfully")
      setIsAddUserModalOpen(false)
      reset()
    } catch (error) {
      toast.error("Failed to update user information")
    }
  }

  // Filter shipments based on search query and active tab
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.pickupAddress?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.deliveryAddress?.city.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
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

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const generateInvoicePDF = (invoiceData: InvoiceData) => {
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185); // Blue color
    doc.text("JINGALLY", 105, 20, { align: "center" });
    
    // Company Details
    doc.setFontSize(10);
    doc.setTextColor(100); // Gray color
    doc.text("123 Business Street, London, UK", 105, 27, { align: "center" });
    doc.text("Phone: +44 123 456 7890 | Email: info@jingally.com", 105, 33, { align: "center" });
    
    // Invoice Title
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("INVOICE", 105, 45, { align: "center" });
    
    // Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 20, 55);
    doc.text(`Date: ${invoiceData.date}`, 20, 60);
    doc.text(`Due Date: ${invoiceData.dueDate}`, 20, 65);
    
    // Customer Information
    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text("Bill To:", 20, 80);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(invoiceData.customerInfo.name, 20, 87);
    doc.text(invoiceData.customerInfo.email, 20, 92);
    doc.text(invoiceData.customerInfo.phone, 20, 97);
    
    // Items Table Header
    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text("Items", 20, 115);
    
    // Table Headers
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Description", 20, 125);
    doc.text("Price", 150, 125);
    
    // Draw line under headers
    doc.setDrawColor(200);
    doc.line(20, 127, 190, 127);
    
    // Item Details
    let yPos = 135;
    doc.setTextColor(60);
    invoiceData.items.forEach(item => {
      doc.text(item.description, 20, yPos);
      doc.text(`£${item.price.toFixed(2)}`, 150, yPos);
      yPos += 10;
    });
    
    // Draw line before totals
    doc.setDrawColor(200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Totals
    doc.setTextColor(100);
    doc.text("Subtotal:", 130, yPos);
    doc.text(`£${invoiceData.subtotal.toFixed(2)}`, 150, yPos);
    yPos += 10;
    doc.text("Tax (20%):", 130, yPos);
    doc.text(`£${invoiceData.tax.toFixed(2)}`, 150, yPos);
    yPos += 10;
    
    // Total
    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text("Total:", 130, yPos);
    doc.text(`£${invoiceData.total.toFixed(2)}`, 150, yPos);
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Thank you for your business!", 105, pageHeight - 30, { align: "center" });
    doc.text("This is a computer-generated invoice, no signature required.", 105, pageHeight - 25, { align: "center" });
    doc.text("Terms & Conditions: Payment is due within 30 days.", 105, pageHeight - 20, { align: "center" });
    
    // Save PDF
    doc.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
  };

  const handleProcessPayment = (shipment: Shipment) => {
    const invoiceData: InvoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      date: format(new Date(), 'dd/MM/yyyy'),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy'),
      customerInfo: {
        name: shipment.receiverName || 'N/A',
        email: shipment.receiverEmail || 'N/A',
        phone: shipment.receiverPhoneNumber || 'N/A',
      },
      items: [{
        description: `Shipment ${shipment.trackingNumber}`,
        quantity: 1,
        price: parseFloat(shipment.price || '0'),
      }],
      subtotal: parseFloat(shipment.price || '0'),
      tax: parseFloat(shipment.price || '0') * 0.2,
      total: parseFloat(shipment.price || '0') * 1.2,
    };

    generateInvoicePDF(invoiceData);
    setIsInvoiceModalOpen(true);
  };

  const handleUpdatePaymentStatus = (shipment: Shipment) => {
    setSelectedShipmentForUpdate(shipment);
    setIsUpdatePaymentModalOpen(true);
  };

  const handleUpdateContainerInfo = (shipment: Shipment) => {
    setSelectedShipmentForUpdate(shipment);
    setIsUpdateContainerModalOpen(true);
  };

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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Manual Shipment Payment</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/shipments/create" onClick={() => {
            localStorage.removeItem('packageInfo');
            localStorage.removeItem('currentStep');
            localStorage.removeItem('shipmentCreationStep');
          }}>
            <Package className="mr-2 h-4 w-4" />
            Create Shipment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment Details</CardTitle>
          <CardDescription>Review and complete payment for your shipment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
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
                <Button variant="outline" size="sm" onClick={fetchShipments}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No shipments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">
                          {shipment.trackingNumber}
                        </TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell>
                          <Badge variant={shipment.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                            {shipment.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{shipment.serviceType}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedShipment(shipment)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className={modalStyles.content}>
                                <DialogHeader className={modalStyles.header}>
                                  <DialogTitle className={modalStyles.title}>Shipment Details</DialogTitle>
                                  <DialogDescription className={modalStyles.description}>
                                    Detailed information about shipment {shipment.trackingNumber}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className={modalStyles.scrollableContent}>
                                  <div className="space-y-6">
                                    <div className={modalStyles.infoGrid}>
                                      <div className={modalStyles.section}>
                                        <h3 className={modalStyles.sectionTitle}>Package Information</h3>
                                        <div className="space-y-3">
                                          <div className={modalStyles.infoItem}>
                                            <span className={modalStyles.infoLabel}>Type</span>
                                            <span className={modalStyles.infoValue}>{shipment.packageType || 'N/A'}</span>
                                          </div>
                                          <div className={modalStyles.infoItem}>
                                            <span className={modalStyles.infoLabel}>Service</span>
                                            <span className={modalStyles.infoValue}>{shipment.serviceType || 'N/A'}</span>
                                          </div>
                                          <div className={modalStyles.infoItem}>
                                            <span className={modalStyles.infoLabel}>Weight</span>
                                            <span className={modalStyles.infoValue}>{shipment.weight ? `${shipment.weight}kg` : 'N/A'}</span>
                                          </div>
                                          <div className={modalStyles.infoItem}>
                                            <span className={modalStyles.infoLabel}>Dimensions</span>
                                            <span className={modalStyles.infoValue}>
                                              {shipment.dimensions 
                                                ? `${shipment.dimensions.length}x${shipment.dimensions.width}x${shipment.dimensions.height}cm`
                                                : 'N/A'}
                                            </span>
                                          </div>
                                          <div className={modalStyles.infoItem}>
                                            <span className={modalStyles.infoLabel}>Fragile</span>
                                            <span className={modalStyles.infoValue}>
                                              {shipment.fragile ? (
                                                <Badge variant="destructive">Yes</Badge>
                                              ) : (
                                                <Badge variant="secondary">No</Badge>
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className={modalStyles.section}>
                                        <h3 className={modalStyles.sectionTitle}>Address Information</h3>
                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Pickup Address</h4>
                                              <div className="bg-white rounded-md p-3 border border-gray-200">
                                                {shipment.pickupAddress ? (
                                                  <>
                                                    <p className="text-sm text-gray-900">{shipment.pickupAddress.street}</p>
                                                    <p className="text-sm text-gray-900">
                                                      {shipment.pickupAddress.city}, {shipment.pickupAddress.state}
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                      {shipment.pickupAddress.country} {shipment.pickupAddress.postcode}
                                                    </p>
                                                  </>
                                                ) : (
                                                  <p className="text-sm text-gray-500">No pickup address provided</p>
                                                )}
                                              </div>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h4>
                                              <div className="bg-white rounded-md p-3 border border-gray-200">
                                                {shipment.deliveryAddress ? (
                                                  <>
                                                    <p className="text-sm text-gray-900">{shipment.deliveryAddress.street}</p>
                                                    <p className="text-sm text-gray-900">
                                                      {shipment.deliveryAddress.city}, {shipment.deliveryAddress.state}
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                      {shipment.deliveryAddress.country} {shipment.deliveryAddress.postcode}
                                                    </p>
                                                  </>
                                                ) : (
                                                  <p className="text-sm text-gray-500">No delivery address provided</p>
                                                )}
                                              </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className={modalStyles.infoGrid}>
                                      <div className={modalStyles.section}>
                                        <h3 className={modalStyles.sectionTitle}>Timing Information</h3>
                                        <div className="space-y-3">
                                          <div className={modalStyles.infoItem}>
                                            <span className={modalStyles.infoLabel}>Scheduled Pickup</span>
                                            <span className={modalStyles.infoValue}>
                                              {shipment.scheduledPickupTime 
                                                ? new Date(shipment.scheduledPickupTime).toLocaleString('en-GB', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                  })
                                                : 'N/A'}
                                            </span>
                                          </div>
                                          <div className={modalStyles.infoItem}>
                                            <span className={modalStyles.infoLabel}>Estimated Delivery</span>
                                            <span className={modalStyles.infoValue}>
                                              {shipment.estimatedDeliveryTime 
                                                ? new Date(shipment.estimatedDeliveryTime).toLocaleString('en-GB', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                  })
                                                : 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className={modalStyles.section}>
                                        <h3 className={modalStyles.sectionTitle}>Payment Information</h3>
                                        <div className="space-y-3">
                                          <div className={modalStyles.infoItem}>
                                            <span className={modalStyles.infoLabel}>Status</span>
                                            <span className={modalStyles.infoValue}>
                                              <Badge 
                                                variant={shipment.paymentStatus === 'paid' ? 'default' : 'secondary'}
                                                className="capitalize"
                                              >
                                                {shipment.paymentStatus}
                                              </Badge>
                                            </span>
                                          </div>
                                          <div className={modalStyles.infoItem}>
                                            <span className={modalStyles.infoLabel}>Price</span>
                                            <span className="text-lg font-semibold text-gray-900">
                                              {shipment.price ? `£${shipment.price}` : 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter className={modalStyles.footer}>
                                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                                    Close
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      setIsViewModalOpen(false)
                                      setIsAddUserModalOpen(true)
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add User Information
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleUpdatePaymentStatus(shipment)}>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Update Payment Status
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateContainerInfo(shipment)}>
                                  <Package2 className="mr-2 h-4 w-4" />
                                  Update Container Info
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcessPayment(shipment)}
                            >
                              <Receipt className="mr-2 h-4 w-4" />
                              Process Payment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* {selectedShipment && (
              <div className="mt-8">
                <PackagePayment onNext={handleNext} onBack={handleBack} />
              </div>
            )} */}

            <div className="flex items-center justify-between mt-4">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add User Information Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className={modalStyles.header}>
            <DialogTitle className={modalStyles.title}>Add User Information</DialogTitle>
            <DialogDescription className={modalStyles.description}>
              Please provide the user's contact information for this shipment.
            </DialogDescription>
          </DialogHeader>
          <div className={modalStyles.scrollableContent}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>

              <DialogFooter className={modalStyles.footer}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddUserModalOpen(false)
                    reset()
                  }}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </div>
                  ) : (
                    "Save Information"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Generated</DialogTitle>
            <DialogDescription>
              Your invoice has been generated and downloaded. You can find it in your downloads folder.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsInvoiceModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Payment Status Modal */}
      <Dialog open={isUpdatePaymentModalOpen} onOpenChange={setIsUpdatePaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update the payment status for shipment {selectedShipmentForUpdate?.trackingNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea className="w-full p-2 border rounded-md" rows={3} placeholder="Add any notes about the payment status update..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdatePaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle payment status update
              toast.success("Payment status updated successfully");
              setIsUpdatePaymentModalOpen(false);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Container Information Modal */}
      <Dialog open={isUpdateContainerModalOpen} onOpenChange={setIsUpdateContainerModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Container Information</DialogTitle>
            <DialogDescription>
              Update container details for shipment {selectedShipmentForUpdate?.trackingNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Container Number</Label>
              <Input placeholder="Enter container number" />
            </div>
            <div className="space-y-2">
              <Label>Container Type</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="20ft">20ft Standard</option>
                <option value="40ft">40ft Standard</option>
                <option value="40hq">40ft High Cube</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Seal Number</Label>
              <Input placeholder="Enter seal number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" placeholder="Enter weight" />
              </div>
              <div className="space-y-2">
                <Label>Dimensions (L x W x H)</Label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="L" />
                  <Input type="number" placeholder="W" />
                  <Input type="number" placeholder="H" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateContainerModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle container info update
              toast.success("Container information updated successfully");
              setIsUpdateContainerModalOpen(false);
            }}>
              Update Information
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
