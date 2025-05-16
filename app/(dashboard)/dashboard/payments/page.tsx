"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownUp, CreditCard, Download, FileText, Filter, MoreHorizontal, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Sample payment data
const payments = [
  {
    id: "PAY12345",
    invoiceNumber: "INV-12345",
    customer: "John Doe",
    amount: 149.99,
    status: "completed",
    method: "credit_card",
    date: "2023-10-15T10:30:00Z",
    dueDate: "2023-10-15T10:30:00Z",
  },
  {
    id: "PAY12346",
    invoiceNumber: "INV-12346",
    customer: "Jane Smith",
    amount: 89.5,
    status: "completed",
    method: "paypal",
    date: "2023-10-14T14:45:00Z",
    dueDate: "2023-10-14T14:45:00Z",
  },
  {
    id: "PAY12347",
    invoiceNumber: "INV-12347",
    customer: "Robert Johnson",
    amount: 299.99,
    status: "pending",
    method: "bank_transfer",
    date: "2023-10-16T11:45:00Z",
    dueDate: "2023-10-23T11:45:00Z",
  },
  {
    id: "PAY12348",
    invoiceNumber: "INV-12348",
    customer: "Emily Davis",
    amount: 129.75,
    status: "completed",
    method: "credit_card",
    date: "2023-10-13T08:20:00Z",
    dueDate: "2023-10-13T08:20:00Z",
  },
  {
    id: "PAY12349",
    invoiceNumber: "INV-12349",
    customer: "Michael Wilson",
    amount: 199.99,
    status: "failed",
    method: "credit_card",
    date: "2023-10-17T13:10:00Z",
    dueDate: "2023-10-17T13:10:00Z",
  },
  {
    id: "PAY12350",
    invoiceNumber: "INV-12350",
    customer: "Sarah Brown",
    amount: 59.99,
    status: "refunded",
    method: "paypal",
    date: "2023-10-12T15:20:00Z",
    dueDate: "2023-10-12T15:20:00Z",
  },
  {
    id: "PAY12351",
    invoiceNumber: "INV-12351",
    customer: "David Miller",
    amount: 349.5,
    status: "pending",
    method: "bank_transfer",
    date: "2023-10-17T09:45:00Z",
    dueDate: "2023-10-24T09:45:00Z",
  },
  {
    id: "PAY12352",
    invoiceNumber: "INV-12352",
    customer: "Lisa Taylor",
    amount: 79.99,
    status: "completed",
    method: "credit_card",
    date: "2023-10-11T16:30:00Z",
    dueDate: "2023-10-11T16:30:00Z",
  },
]

// Sample invoice data
const invoices = [
  {
    id: "INV-12345",
    customer: "John Doe",
    amount: 149.99,
    status: "paid",
    issueDate: "2023-10-08T10:30:00Z",
    dueDate: "2023-10-15T10:30:00Z",
    paymentId: "PAY12345",
  },
  {
    id: "INV-12346",
    customer: "Jane Smith",
    amount: 89.5,
    status: "paid",
    issueDate: "2023-10-07T14:45:00Z",
    dueDate: "2023-10-14T14:45:00Z",
    paymentId: "PAY12346",
  },
  {
    id: "INV-12347",
    customer: "Robert Johnson",
    amount: 299.99,
    status: "pending",
    issueDate: "2023-10-09T11:45:00Z",
    dueDate: "2023-10-23T11:45:00Z",
    paymentId: "PAY12347",
  },
  {
    id: "INV-12348",
    customer: "Emily Davis",
    amount: 129.75,
    status: "paid",
    issueDate: "2023-10-06T08:20:00Z",
    dueDate: "2023-10-13T08:20:00Z",
    paymentId: "PAY12348",
  },
  {
    id: "INV-12349",
    customer: "Michael Wilson",
    amount: 199.99,
    status: "overdue",
    issueDate: "2023-10-03T13:10:00Z",
    dueDate: "2023-10-17T13:10:00Z",
    paymentId: "PAY12349",
  },
  {
    id: "INV-12350",
    customer: "Sarah Brown",
    amount: 59.99,
    status: "refunded",
    issueDate: "2023-10-05T15:20:00Z",
    dueDate: "2023-10-12T15:20:00Z",
    paymentId: "PAY12350",
  },
  {
    id: "INV-12351",
    customer: "David Miller",
    amount: 349.5,
    status: "pending",
    issueDate: "2023-10-10T09:45:00Z",
    dueDate: "2023-10-24T09:45:00Z",
    paymentId: "PAY12351",
  },
  {
    id: "INV-12352",
    customer: "Lisa Taylor",
    amount: 79.99,
    status: "paid",
    issueDate: "2023-10-04T16:30:00Z",
    dueDate: "2023-10-11T16:30:00Z",
    paymentId: "PAY12352",
  },
]

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("payments")
  const [selectedStatus, setSelectedStatus] = useState("")

  // Filter payments based on search query and selected status
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "" || payment.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Filter invoices based on search query and selected status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "" || invoice.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">{status}</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            {status}
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">{status}</Badge>
      case "refunded":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            {status}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get invoice status badge
  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">{status}</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            {status}
          </Badge>
        )
      case "overdue":
        return <Badge variant="destructive">{status}</Badge>
      case "refunded":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            {status}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get payment method display
  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card"
      case "paypal":
        return "PayPal"
      case "bank_transfer":
        return "Bank Transfer"
      default:
        return method.replace(/_/g, " ")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payment Administration</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/payments/settings">
              <CreditCard className="mr-2 h-4 w-4" />
              Payment Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/payments/create-invoice">
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>Manage payments, invoices, and refunds.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="payments" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
              </TabsList>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2 sm:max-w-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "payments" ? "Search payments..." : "Search invoices..."}
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
                      {activeTab === "payments" ? (
                        <>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <TabsContent value="payments" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button variant="ghost" className="p-0 font-medium flex items-center gap-1">
                            ID
                            <ArrowDownUp className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>
                          <Button variant="ghost" className="p-0 font-medium flex items-center gap-1">
                            Date
                            <ArrowDownUp className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No payments found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              <Link href={`/dashboard/payments/${payment.id}`} className="hover:underline">
                                {payment.id}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/dashboard/payments/invoice/${payment.invoiceNumber}`}
                                className="hover:underline"
                              >
                                {payment.invoiceNumber}
                              </Link>
                            </TableCell>
                            <TableCell>{payment.customer}</TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                            <TableCell>{getPaymentMethod(payment.method)}</TableCell>
                            <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/payments/${payment.id}`}>View details</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/payments/invoice/${payment.invoiceNumber}`}>
                                      View invoice
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {payment.status === "completed" && <DropdownMenuItem>Issue refund</DropdownMenuItem>}
                                  {payment.status === "pending" && <DropdownMenuItem>Mark as paid</DropdownMenuItem>}
                                  <DropdownMenuItem>Send receipt</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="invoices" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button variant="ghost" className="p-0 font-medium flex items-center gap-1">
                            Invoice #
                            <ArrowDownUp className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <Button variant="ghost" className="p-0 font-medium flex items-center gap-1">
                            Issue Date
                            <ArrowDownUp className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" className="p-0 font-medium flex items-center gap-1">
                            Due Date
                            <ArrowDownUp className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No invoices found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              <Link href={`/dashboard/payments/invoice/${invoice.id}`} className="hover:underline">
                                {invoice.id}
                              </Link>
                            </TableCell>
                            <TableCell>{invoice.customer}</TableCell>
                            <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                            <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                            <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/payments/invoice/${invoice.id}`}>View invoice</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Download PDF</DropdownMenuItem>
                                  <DropdownMenuItem>Send to customer</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {invoice.status === "pending" && <DropdownMenuItem>Mark as paid</DropdownMenuItem>}
                                  <DropdownMenuItem>Edit invoice</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{activeTab === "payments" ? filteredPayments.length : filteredInvoices.length}</strong> of{" "}
            <strong>{activeTab === "payments" ? payments.length : invoices.length}</strong>{" "}
            {activeTab === "payments" ? "payments" : "invoices"}
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

