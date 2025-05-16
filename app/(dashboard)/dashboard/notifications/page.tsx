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
import {
  ArrowDownUp,
  Bell,
  CheckCircle,
  Download,
  Edit,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  XCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

// Sample notification templates data
const notificationTemplates = [
  {
    id: "NT001",
    name: "Order Confirmation",
    type: "email",
    subject: "Your Order #{{order_id}} has been confirmed",
    body: "Dear {{customer_name}},\n\nThank you for your order. Your order #{{order_id}} has been confirmed and is being processed.\n\nEstimated delivery date: {{delivery_date}}.\n\nThank you for choosing our service.\n\nBest regards,\nThe Delivery Team",
    active: true,
    lastUpdated: "2023-09-15T10:30:00Z",
    triggers: ["order_created"],
  },
  {
    id: "NT002",
    name: "Shipment Created",
    type: "email",
    subject: "Your Shipment #{{tracking_number}} has been created",
    body: "Dear {{customer_name}},\n\nYour shipment #{{tracking_number}} has been created and is being prepared for dispatch.\n\nYou can track your shipment using the following link: {{tracking_link}}.\n\nThank you for choosing our service.\n\nBest regards,\nThe Delivery Team",
    active: true,
    lastUpdated: "2023-09-15T11:15:00Z",
    triggers: ["shipment_created"],
  },
  {
    id: "NT003",
    name: "Out for Delivery",
    type: "sms",
    subject: "",
    body: "Your package #{{tracking_number}} is out for delivery today. Estimated delivery time: {{delivery_time}}. Track here: {{tracking_link}}",
    active: true,
    lastUpdated: "2023-09-16T09:20:00Z",
    triggers: ["status_out_for_delivery"],
  },
  {
    id: "NT004",
    name: "Delivery Confirmation",
    type: "email",
    subject: "Your Package has been Delivered",
    body: "Dear {{customer_name}},\n\nWe're pleased to inform you that your package #{{tracking_number}} has been delivered.\n\nDelivery details:\nTime: {{delivery_time}}\nLocation: {{delivery_location}}\nReceived by: {{recipient_name}}\n\nThank you for choosing our service.\n\nBest regards,\nThe Delivery Team",
    active: true,
    lastUpdated: "2023-09-16T14:45:00Z",
    triggers: ["status_delivered"],
  },
  {
    id: "NT005",
    name: "Delivery Delay",
    type: "email",
    subject: "Delivery Delay Notification",
    body: "Dear {{customer_name}},\n\nWe regret to inform you that your package #{{tracking_number}} has been delayed.\n\nNew estimated delivery date: {{new_delivery_date}}.\n\nWe apologize for any inconvenience caused.\n\nBest regards,\nThe Delivery Team",
    active: true,
    lastUpdated: "2023-09-17T10:10:00Z",
    triggers: ["status_delayed"],
  },
  {
    id: "NT006",
    name: "Delivery Attempt",
    type: "sms",
    subject: "",
    body: "We attempted to deliver your package #{{tracking_number}} today but were unable to. We'll try again on {{next_delivery_date}}. Details: {{delivery_notes}}",
    active: true,
    lastUpdated: "2023-09-18T11:30:00Z",
    triggers: ["delivery_attempt_failed"],
  },
  {
    id: "NT007",
    name: "Payment Confirmation",
    type: "email",
    subject: "Payment Confirmation for Order #{{order_id}}",
    body: "Dear {{customer_name}},\n\nThank you for your payment of {{amount}} for order #{{order_id}}.\n\nPayment details:\nAmount: {{amount}}\nPayment method: {{payment_method}}\nTransaction ID: {{transaction_id}}\nDate: {{payment_date}}\n\nThank you for choosing our service.\n\nBest regards,\nThe Delivery Team",
    active: true,
    lastUpdated: "2023-09-19T09:45:00Z",
    triggers: ["payment_received"],
  },
  {
    id: "NT008",
    name: "Package Exception",
    type: "push",
    subject: "Action Required: Issue with Your Package",
    body: "There's an issue with your package #{{tracking_number}}. Please check your account or contact customer support for details.",
    active: true,
    lastUpdated: "2023-09-20T13:15:00Z",
    triggers: ["status_exception"],
  },
]

// Sample notification logs data
const notificationLogs = [
  {
    id: "NL001",
    templateId: "NT001",
    templateName: "Order Confirmation",
    type: "email",
    recipient: "john.doe@example.com",
    status: "delivered",
    sentAt: "2023-10-17T10:30:00Z",
    deliveredAt: "2023-10-17T10:31:05Z",
    openedAt: "2023-10-17T11:15:22Z",
    relatedId: "ORD12345",
  },
  {
    id: "NL002",
    templateId: "NT002",
    templateName: "Shipment Created",
    type: "email",
    recipient: "jane.smith@example.com",
    status: "delivered",
    sentAt: "2023-10-17T11:15:00Z",
    deliveredAt: "2023-10-17T11:16:12Z",
    openedAt: null,
    relatedId: "SHP12346",
  },
  {
    id: "NL003",
    templateId: "NT003",
    templateName: "Out for Delivery",
    type: "sms",
    recipient: "+1234567890",
    status: "delivered",
    sentAt: "2023-10-17T09:20:00Z",
    deliveredAt: "2023-10-17T09:20:45Z",
    openedAt: null,
    relatedId: "SHP12347",
  },
  {
    id: "NL004",
    templateId: "NT004",
    templateName: "Delivery Confirmation",
    type: "email",
    recipient: "robert.johnson@example.com",
    status: "delivered",
    sentAt: "2023-10-16T14:45:00Z",
    deliveredAt: "2023-10-16T14:46:30Z",
    openedAt: "2023-10-16T15:20:15Z",
    relatedId: "SHP12348",
  },
  {
    id: "NL005",
    templateId: "NT005",
    templateName: "Delivery Delay",
    type: "email",
    recipient: "emily.davis@example.com",
    status: "failed",
    sentAt: "2023-10-17T10:10:00Z",
    deliveredAt: null,
    openedAt: null,
    relatedId: "SHP12349",
    failureReason: "Invalid email address",
  },
  {
    id: "NL006",
    templateId: "NT006",
    templateName: "Delivery Attempt",
    type: "sms",
    recipient: "+1987654321",
    status: "delivered",
    sentAt: "2023-10-16T11:30:00Z",
    deliveredAt: "2023-10-16T11:30:55Z",
    openedAt: null,
    relatedId: "SHP12350",
  },
  {
    id: "NL007",
    templateId: "NT007",
    templateName: "Payment Confirmation",
    type: "email",
    recipient: "michael.wilson@example.com",
    status: "bounced",
    sentAt: "2023-10-15T09:45:00Z",
    deliveredAt: null,
    openedAt: null,
    relatedId: "PAY12345",
    failureReason: "Mailbox full",
  },
  {
    id: "NL008",
    templateId: "NT008",
    templateName: "Package Exception",
    type: "push",
    recipient: "device_id_12345",
    status: "delivered",
    sentAt: "2023-10-17T13:15:00Z",
    deliveredAt: "2023-10-17T13:15:10Z",
    openedAt: "2023-10-17T13:16:05Z",
    relatedId: "SHP12351",
  },
]

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedType, setSelectedType] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  // Filter notification templates based on search query and selected type
  const filteredTemplates = notificationTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === "" || template.type === selectedType

    return matchesSearch && matchesType
  })

  // Filter notification logs based on search query, selected type, and selected status
  const filteredLogs = notificationLogs.filter((log) => {
    const matchesSearch =
      log.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === "" || log.type === selectedType

    const matchesStatus = selectedStatus === "" || log.status === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Get notification type icon
  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4 text-muted-foreground" />
      case "sms":
        return <Phone className="h-4 w-4 text-muted-foreground" />
      case "push":
        return <Bell className="h-4 w-4 text-muted-foreground" />
      default:
        return <MessageSquare className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Get notification status badge
  const getNotificationStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500">{status}</Badge>
      case "failed":
        return <Badge variant="destructive">{status}</Badge>
      case "bounced":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            {status}
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            {status}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Toggle template active status
  const toggleTemplateStatus = (id: string) => {
    // In a real app, this would update the database
    console.log(`Toggling status for template ${id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notification Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/notifications/settings">
              <Bell className="mr-2 h-4 w-4" />
              Notification Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/notifications/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Management</CardTitle>
          <CardDescription>Manage notification templates and monitor delivery status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="templates" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="logs">Notification Logs</TabsTrigger>
              </TabsList>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2 sm:max-w-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "templates" ? "Search templates..." : "Search notification logs..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>

                  {activeTab === "logs" && (
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="bounced">Bounced</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <TabsContent value="templates" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Triggers</TableHead>
                        <TableHead>Active</TableHead>
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
                      {filteredTemplates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No templates found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">
                              <Link href={`/dashboard/notifications/${template.id}`} className="hover:underline">
                                {template.id}
                              </Link>
                            </TableCell>
                            <TableCell>{template.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getNotificationTypeIcon(template.type)}
                                <span className="capitalize">{template.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{template.subject || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {template.triggers.map((trigger) => (
                                  <Badge key={trigger} variant="outline" className="capitalize">
                                    {trigger.replace(/_/g, " ")}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={template.active}
                                onCheckedChange={() => toggleTemplateStatus(template.id)}
                                aria-label={`Toggle ${template.name} active status`}
                              />
                            </TableCell>
                            <TableCell>{new Date(template.lastUpdated).toLocaleDateString()}</TableCell>
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
                                    <Link href={`/dashboard/notifications/${template.id}`}>View template</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/notifications/${template.id}/edit`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit template
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send test
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Duplicate template</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Delete template</DropdownMenuItem>
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

              <TabsContent value="logs" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <Button variant="ghost" className="p-0 font-medium flex items-center gap-1">
                            Sent At
                            <ArrowDownUp className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Delivered At</TableHead>
                        <TableHead>Opened</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            No notification logs found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => (
                          <TableRow
                            key={log.id}
                            className={
                              log.status === "failed" || log.status === "bounced" ? "bg-red-50 dark:bg-red-950/10" : ""
                            }
                          >
                            <TableCell className="font-medium">
                              <Link href={`/dashboard/notifications/logs/${log.id}`} className="hover:underline">
                                {log.id}
                              </Link>
                            </TableCell>
                            <TableCell>{log.templateName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getNotificationTypeIcon(log.type)}
                                <span className="capitalize">{log.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">{log.recipient}</TableCell>
                            <TableCell>{getNotificationStatusBadge(log.status)}</TableCell>
                            <TableCell>{new Date(log.sentAt).toLocaleString()}</TableCell>
                            <TableCell>
                              {log.deliveredAt ? new Date(log.deliveredAt).toLocaleString() : "N/A"}
                            </TableCell>
                            <TableCell>
                              {log.openedAt ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/notifications/logs/${log.id}`}>View</Link>
                              </Button>
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
            Showing <strong>{activeTab === "templates" ? filteredTemplates.length : filteredLogs.length}</strong> of{" "}
            <strong>{activeTab === "templates" ? notificationTemplates.length : notificationLogs.length}</strong>{" "}
            {activeTab === "templates" ? "templates" : "notification logs"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

