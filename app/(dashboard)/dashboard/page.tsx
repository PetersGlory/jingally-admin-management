"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowDown,
  ArrowUp,
  Package,
  Truck,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getDashboardStats } from "@/lib/api"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [adminMetrics, setAdminMetrics] = useState({
    totalShipments: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingShipments: 0,
    completedShipments: 0,
  })

  const [systemStatus, setSystemStatus] = useState({
    trackingSystem: "operational",
    paymentProcessing: "operational",
    notificationService: "operational",
    apiGateway: "operational",
    userAuthentication: "operational"
  })

  const [recentActivity, setRecentActivity] = useState([])

  const fetchAdminMetrics = async () => {
    const accessToken = localStorage.getItem("token") || "";
    setIsLoading(true)
    try {
      const response = await getDashboardStats(accessToken)
      console.log(response)
      setAdminMetrics(response)
      
      // Simulate system status check
      setSystemStatus({
        trackingSystem: Math.random() > 0.1 ? "operational" : "degraded",
        paymentProcessing: Math.random() > 0.1 ? "operational" : "degraded",
        notificationService: Math.random() > 0.1 ? "operational" : "degraded",
        apiGateway: Math.random() > 0.1 ? "operational" : "degraded",
        userAuthentication: Math.random() > 0.1 ? "operational" : "degraded"
      })

    } catch (error) {
      console.error("Error fetching admin metrics:", error)
    } finally {
      setIsLoading(false)
    } 
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-500"
      case "degraded":
        return "text-yellow-500"
      case "outage":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "outage":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />
    }
  }

  const handleDownloadReport = () => {
    // Create CSV content
    const csvContent = [
      // Headers
      ["Dashboard Report", new Date().toLocaleDateString()],
      [], // Empty line
      ["Metric", "Value"],
      ["Total Users", adminMetrics.totalUsers],
      ["Total Shipments", adminMetrics.totalShipments],
      ["Pending Shipments", adminMetrics.pendingShipments],
      ["Completed Shipments", adminMetrics.completedShipments],
      ["Total Revenue", `$${adminMetrics.totalRevenue.toFixed(2)}`],
      ["Delivery Success Rate", `${((adminMetrics.completedShipments / adminMetrics.totalShipments) * 100).toFixed(1)}%`],
      [], // Empty line
      ["System Status", "Status"],
      ...Object.entries(systemStatus).map(([system, status]) => [
        system.replace(/([A-Z])/g, ' $1').trim(),
        status
      ])
    ].map(row => row.join(",")).join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchAdminMetrics()
  }, [])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[100vh] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6 p-8 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
            </div>
            <div className="relative">
              <Package className="h-8 w-8 text-primary animate-bounce" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loading Dashboard</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch your data...</p>
          </div>
        </div>
      </div>
    )

  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button onClick={fetchAdminMetrics}>Refresh Data</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminMetrics.totalShipments}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground flex items-center">
                    {adminMetrics.pendingShipments} pending
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminMetrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground flex items-center">
                    Total registered users
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${adminMetrics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground flex items-center">
                    Total revenue
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivery Success</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {adminMetrics.totalShipments > 0 
                    ? ((adminMetrics.completedShipments / adminMetrics.totalShipments) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground flex items-center">
                    {adminMetrics.completedShipments} completed
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Shipment Activity</CardTitle>
                <CardDescription>Shipment volume over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-muted mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Total Shipments: {adminMetrics.totalShipments}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pending: {adminMetrics.pendingShipments} | Completed: {adminMetrics.completedShipments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current status of all systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(systemStatus).map(([system, status]) => (
                    <div key={system} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className="capitalize">{system.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <span className={`text-sm ${getStatusColor(status)} capitalize`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}

