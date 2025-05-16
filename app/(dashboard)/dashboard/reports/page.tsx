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
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileText,
  Filter,
  LineChart,
  MoreHorizontal,
  PieChart,
  Plus,
  Search,
  Share2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample reports data
const reports = [
  {
    id: "REP001",
    name: "Monthly Performance Report",
    type: "performance",
    format: "pdf",
    createdAt: "2023-10-15T10:30:00Z",
    createdBy: "Admin User",
    period: "October 2023",
    size: "1.2 MB",
    scheduled: true,
    frequency: "monthly",
  },
  {
    id: "REP002",
    name: "Quarterly Revenue Analysis",
    type: "financial",
    format: "excel",
    createdAt: "2023-10-10T14:45:00Z",
    createdBy: "Finance Manager",
    period: "Q3 2023",
    size: "3.5 MB",
    scheduled: true,
    frequency: "quarterly",
  },
  {
    id: "REP003",
    name: "Delivery Time Performance",
    type: "operational",
    format: "pdf",
    createdAt: "2023-10-17T11:45:00Z",
    createdBy: "Operations Manager",
    period: "Last 30 days",
    size: "2.1 MB",
    scheduled: false,
    frequency: null,
  },
  {
    id: "REP004",
    name: "Customer Satisfaction Survey",
    type: "customer",
    format: "pdf",
    createdAt: "2023-10-12T09:15:00Z",
    createdBy: "Customer Service Manager",
    period: "September 2023",
    size: "1.8 MB",
    scheduled: true,
    frequency: "monthly",
  },
  {
    id: "REP005",
    name: "Shipment Volume by Region",
    type: "operational",
    format: "excel",
    createdAt: "2023-10-16T13:20:00Z",
    createdBy: "Regional Manager",
    period: "Last 90 days",
    size: "4.2 MB",
    scheduled: false,
    frequency: null,
  },
  {
    id: "REP006",
    name: "Issue Frequency Analysis",
    type: "operational",
    format: "pdf",
    createdAt: "2023-10-14T15:10:00Z",
    createdBy: "Quality Assurance",
    period: "Last 60 days",
    size: "1.5 MB",
    scheduled: true,
    frequency: "biweekly",
  },
  {
    id: "REP007",
    name: "Annual Business Review",
    type: "financial",
    format: "pdf",
    createdAt: "2023-09-30T16:30:00Z",
    createdBy: "CEO",
    period: "2023 YTD",
    size: "5.8 MB",
    scheduled: true,
    frequency: "annually",
  },
  {
    id: "REP008",
    name: "Carrier Performance Comparison",
    type: "operational",
    format: "excel",
    createdAt: "2023-10-05T11:25:00Z",
    createdBy: "Logistics Manager",
    period: "Last 90 days",
    size: "2.7 MB",
    scheduled: false,
    frequency: null,
  },
]

// Sample analytics dashboards data
const dashboards = [
  {
    id: "DASH001",
    name: "Executive Overview",
    description: "High-level KPIs and business metrics for executive team",
    lastViewed: "2023-10-17T09:30:00Z",
    createdBy: "Admin User",
    shared: true,
    favorite: true,
  },
  {
    id: "DASH002",
    name: "Operations Dashboard",
    description: "Real-time operational metrics and delivery performance",
    lastViewed: "2023-10-16T14:15:00Z",
    createdBy: "Operations Manager",
    shared: true,
    favorite: true,
  },
  {
    id: "DASH003",
    name: "Financial Performance",
    description: "Revenue, costs, and profitability analysis",
    lastViewed: "2023-10-15T11:45:00Z",
    createdBy: "Finance Manager",
    shared: true,
    favorite: false,
  },
  {
    id: "DASH004",
    name: "Customer Insights",
    description: "Customer satisfaction, retention, and behavior analysis",
    lastViewed: "2023-10-14T10:20:00Z",
    createdBy: "Marketing Manager",
    shared: false,
    favorite: true,
  },
  {
    id: "DASH005",
    name: "Regional Performance",
    description: "Geographical distribution of shipments and performance by region",
    lastViewed: "2023-10-13T15:30:00Z",
    createdBy: "Regional Manager",
    shared: true,
    favorite: false,
  },
  {
    id: "DASH006",
    name: "Issue Tracking",
    description: "Analysis of delivery issues, delays, and exceptions",
    lastViewed: "2023-10-12T13:10:00Z",
    createdBy: "Quality Assurance",
    shared: false,
    favorite: false,
  },
]

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("reports")
  const [selectedType, setSelectedType] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("")

  // Filter reports based on search query, selected type, and selected format
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.createdBy.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === "" || report.type === selectedType

    const matchesFormat = selectedFormat === "" || report.format === selectedFormat

    return matchesSearch && matchesType && matchesFormat
  })

  // Filter dashboards based on search query
  const filteredDashboards = dashboards.filter((dashboard) => {
    const matchesSearch =
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.createdBy.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // Get report type badge
  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case "performance":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            {type}
          </Badge>
        )
      case "financial":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            {type}
          </Badge>
        )
      case "operational":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            {type}
          </Badge>
        )
      case "customer":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            {type}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Get report format icon
  const getReportFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "excel":
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Get dashboard icon
  const getDashboardIcon = (id: string) => {
    // Just for visual variety, assign different chart icons based on ID
    const lastChar = id.charAt(id.length - 1)
    const num = Number.parseInt(lastChar)

    if (num % 3 === 0) {
      return <BarChart3 className="h-4 w-4 text-muted-foreground" />
    } else if (num % 3 === 1) {
      return <LineChart className="h-4 w-4 text-muted-foreground" />
    } else {
      return <PieChart className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Scheduled Reports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/reports/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports & Analytics</CardTitle>
          <CardDescription>Access reports, analytics dashboards, and business intelligence tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="reports" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
              </TabsList>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2 sm:max-w-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "reports" ? "Search reports..." : "Search dashboards..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeTab === "reports" && (
                    <>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Formats</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>
              </div>

              <TabsContent value="reports" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>
                          <Button variant="ghost" className="p-0 font-medium flex items-center gap-1">
                            Created
                            <ArrowDownUp className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No reports found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              <Link href={`/dashboard/reports/${report.id}`} className="hover:underline">
                                {report.name}
                              </Link>
                            </TableCell>
                            <TableCell>{getReportTypeBadge(report.type)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getReportFormatIcon(report.format)}
                                <span className="uppercase">{report.format}</span>
                              </div>
                            </TableCell>
                            <TableCell>{report.period}</TableCell>
                            <TableCell>{report.size}</TableCell>
                            <TableCell>
                              {report.scheduled ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="capitalize">{report.frequency}</span>
                                </div>
                              ) : (
                                "No"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                <span className="text-xs text-muted-foreground">{report.createdBy}</span>
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
                                    <Link href={`/dashboard/reports/${report.id}`}>View report</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Schedule</DropdownMenuItem>
                                  <DropdownMenuItem>Regenerate</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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

              <TabsContent value="dashboards" className="mt-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDashboards.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 h-24 flex items-center justify-center border rounded-md">
                      <p className="text-muted-foreground">No dashboards found.</p>
                    </div>
                  ) : (
                    filteredDashboards.map((dashboard) => (
                      <Card key={dashboard.id} className={dashboard.favorite ? "border-primary/50" : ""}>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center justify-between">
                            <Link href={`/dashboard/reports/dashboards/${dashboard.id}`} className="hover:underline">
                              {dashboard.name}
                            </Link>
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
                                  <Link href={`/dashboard/reports/dashboards/${dashboard.id}`}>Open dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="mr-2 h-4 w-4" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </CardTitle>
                          <CardDescription className="line-clamp-2">{dashboard.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-32 bg-muted/20 rounded-md flex items-center justify-center">
                            {getDashboardIcon(dashboard.id)}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between text-xs text-muted-foreground">
                          <div>Created by: {dashboard.createdBy}</div>
                          <div>Last viewed: {new Date(dashboard.lastViewed).toLocaleDateString()}</div>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{activeTab === "reports" ? filteredReports.length : filteredDashboards.length}</strong> of{" "}
            <strong>{activeTab === "reports" ? reports.length : dashboards.length}</strong>{" "}
            {activeTab === "reports" ? "reports" : "dashboards"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

