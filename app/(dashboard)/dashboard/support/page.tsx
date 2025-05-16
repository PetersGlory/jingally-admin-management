"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  ArrowDownUp,
  Clock,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  User,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample support tickets data
const supportTickets = [
  {
    id: "TKT001",
    subject: "Package not delivered on time",
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "open",
    priority: "high",
    category: "delivery",
    assignedTo: "Sarah Johnson",
    createdAt: "2023-10-15T10:30:00Z",
    lastUpdated: "2023-10-17T09:15:00Z",
    responseTime: "2h 45m",
    messageCount: 4,
  },
  {
    id: "TKT002",
    subject: "Wrong item received in order #12346",
    customer: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "in_progress",
    priority: "medium",
    category: "order_issue",
    assignedTo: "Michael Brown",
    createdAt: "2023-10-14T14:45:00Z",
    lastUpdated: "2023-10-16T11:20:00Z",
    responseTime: "3h 15m",
    messageCount: 3,
  },
  {
    id: "TKT003",
    subject: "Refund request for damaged package",
    customer: {
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "pending",
    priority: "medium",
    category: "refund",
    assignedTo: "Unassigned",
    createdAt: "2023-10-16T11:45:00Z",
    lastUpdated: "2023-10-16T11:45:00Z",
    responseTime: "N/A",
    messageCount: 1,
  },
  {
    id: "TKT004",
    subject: "Unable to track my shipment",
    customer: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "resolved",
    priority: "low",
    category: "tracking",
    assignedTo: "Sarah Johnson",
    createdAt: "2023-10-13T08:20:00Z",
    lastUpdated: "2023-10-15T14:30:00Z",
    responseTime: "1h 50m",
    messageCount: 5,
  },
  {
    id: "TKT005",
    subject: "Billing discrepancy on invoice #INV12349",
    customer: {
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "open",
    priority: "high",
    category: "billing",
    assignedTo: "David Miller",
    createdAt: "2023-10-17T13:10:00Z",
    lastUpdated: "2023-10-17T14:25:00Z",
    responseTime: "1h 15m",
    messageCount: 2,
  },
  {
    id: "TKT006",
    subject: "Need to change delivery address",
    customer: {
      name: "Sarah Brown",
      email: "sarah.brown@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "in_progress",
    priority: "medium",
    category: "delivery",
    assignedTo: "Michael Brown",
    createdAt: "2023-10-12T15:20:00Z",
    lastUpdated: "2023-10-16T09:45:00Z",
    responseTime: "4h 25m",
    messageCount: 3,
  },
  {
    id: "TKT007",
    subject: "Package reported as delivered but not received",
    customer: {
      name: "David Miller",
      email: "david.miller@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "escalated",
    priority: "critical",
    category: "delivery",
    assignedTo: "Lisa Taylor",
    createdAt: "2023-10-11T09:45:00Z",
    lastUpdated: "2023-10-17T10:30:00Z",
    responseTime: "50m",
    messageCount: 8,
  },
  {
    id: "TKT008",
    subject: "Question about international shipping rates",
    customer: {
      name: "Lisa Taylor",
      email: "lisa.taylor@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    status: "resolved",
    priority: "low",
    category: "inquiry",
    assignedTo: "Sarah Johnson",
    createdAt: "2023-10-10T16:30:00Z",
    lastUpdated: "2023-10-12T11:15:00Z",
    responseTime: "2h 10m",
    messageCount: 4,
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Filter tickets based on search query and selected filters
  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus

    const matchesPriority = selectedPriority === "all" || ticket.priority === selectedPriority

    const matchesCategory = selectedCategory === "all" || ticket.category === selectedCategory

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  // Get ticket status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500">{status}</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500">{status.replace("_", " ")}</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            {status}
          </Badge>
        )
      case "resolved":
        return <Badge className="bg-green-500">{status}</Badge>
      case "escalated":
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge variant="outline">{status.replace("_", " ")}</Badge>
    }
  }

  // Get ticket priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">{priority}</Badge>
      case "high":
        return <Badge className="bg-red-500">{priority}</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">{priority}</Badge>
      case "low":
        return <Badge className="bg-green-500">{priority}</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Support & Customer Service</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/support/knowledge-base">
              <MessageSquare className="mr-2 h-4 w-4" />
              Knowledge Base
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/support/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4 high priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Avg. response time: 2.5h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">15 in the last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1d 4h</div>
            <p className="text-xs text-muted-foreground">-12% from last week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Manage customer inquiries, issues, and support requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center gap-2 sm:max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="order_issue">Order Issue</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="tracking">Tracking</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="inquiry">Inquiry</SelectItem>
                  </SelectContent>
                </Select>

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
                    <TableHead>Ticket</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>
                      <Button variant="ghost" className="p-0 font-medium flex items-center gap-1">
                        Last Updated
                        <ArrowDownUp className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No tickets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className={ticket.status === "escalated" ? "bg-red-50 dark:bg-red-950/10" : ""}
                      >
                        <TableCell>
                          <div className="font-medium">
                            <Link href={`/dashboard/support/${ticket.id}`} className="hover:underline">
                              {ticket.id}
                            </Link>
                          </div>
                          <div className="text-sm text-muted-foreground max-w-[250px] truncate">{ticket.subject}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={ticket.customer.avatar} alt={ticket.customer.name} />
                              <AvatarFallback>{ticket.customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{ticket.customer.name}</div>
                              <div className="text-xs text-muted-foreground">{ticket.customer.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {ticket.category.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.assignedTo === "Unassigned" ? (
                            <span className="text-muted-foreground">Unassigned</span>
                          ) : (
                            ticket.assignedTo
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(ticket.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
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
                                <Link href={`/dashboard/support/${ticket.id}`}>
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  View conversation
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Assign ticket
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="mr-2 h-4 w-4" />
                                Call customer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {ticket.status !== "resolved" && <DropdownMenuItem>Mark as resolved</DropdownMenuItem>}
                              {ticket.status !== "escalated" && (
                                <DropdownMenuItem>
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  Escalate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            Showing <strong>{filteredTickets.length}</strong> of <strong>{supportTickets.length}</strong> tickets
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

