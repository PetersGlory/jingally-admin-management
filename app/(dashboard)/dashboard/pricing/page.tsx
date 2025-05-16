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
import { ArrowDownUp, Calendar, Download, Filter, MoreHorizontal, Plus, Search, Tag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

// Sample pricing rules data
const pricingRules = [
  {
    id: "PR001",
    name: "Standard Domestic Shipping",
    type: "weight_based",
    basePrice: 9.99,
    additionalPrice: 2.5,
    additionalUnit: "kg",
    minWeight: 0,
    maxWeight: 20,
    active: true,
    serviceType: "standard",
    lastUpdated: "2023-09-15T10:30:00Z",
  },
  {
    id: "PR002",
    name: "Express Domestic Shipping",
    type: "weight_based",
    basePrice: 14.99,
    additionalPrice: 3.75,
    additionalUnit: "kg",
    minWeight: 0,
    maxWeight: 15,
    active: true,
    serviceType: "express",
    lastUpdated: "2023-09-15T10:35:00Z",
  },
  {
    id: "PR003",
    name: "International Economy",
    type: "weight_based",
    basePrice: 24.99,
    additionalPrice: 5.0,
    additionalUnit: "kg",
    minWeight: 0,
    maxWeight: 10,
    active: true,
    serviceType: "international",
    lastUpdated: "2023-09-16T11:20:00Z",
  },
  {
    id: "PR004",
    name: "International Priority",
    type: "weight_based",
    basePrice: 39.99,
    additionalPrice: 7.5,
    additionalUnit: "kg",
    minWeight: 0,
    maxWeight: 10,
    active: true,
    serviceType: "international",
    lastUpdated: "2023-09-16T11:25:00Z",
  },
  {
    id: "PR005",
    name: "Oversized Package Surcharge",
    type: "dimension_based",
    basePrice: 15.0,
    additionalPrice: 0,
    additionalUnit: "",
    minDimension: 100,
    maxDimension: null,
    active: true,
    serviceType: "surcharge",
    lastUpdated: "2023-09-17T09:15:00Z",
  },
  {
    id: "PR006",
    name: "Same-Day Delivery",
    type: "flat_rate",
    basePrice: 29.99,
    additionalPrice: 0,
    additionalUnit: "",
    active: true,
    serviceType: "same_day",
    lastUpdated: "2023-09-18T14:40:00Z",
  },
  {
    id: "PR007",
    name: "Rural Delivery Surcharge",
    type: "flat_rate",
    basePrice: 5.99,
    additionalPrice: 0,
    additionalUnit: "",
    active: true,
    serviceType: "surcharge",
    lastUpdated: "2023-09-19T10:10:00Z",
  },
  {
    id: "PR008",
    name: "Holiday Season Surcharge",
    type: "percentage",
    basePrice: 0,
    additionalPrice: 10,
    additionalUnit: "%",
    active: false,
    serviceType: "seasonal",
    startDate: "2023-12-01T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    lastUpdated: "2023-09-20T11:30:00Z",
  },
]

// Sample discount data
const discounts = [
  {
    id: "DISC001",
    name: "New Customer Discount",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderValue: 0,
    maxDiscount: 50,
    usageLimit: 1,
    usageCount: 245,
    active: true,
    startDate: "2023-01-01T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    lastUpdated: "2023-09-15T10:30:00Z",
  },
  {
    id: "DISC002",
    name: "Bulk Shipping Discount",
    code: "BULK15",
    type: "percentage",
    value: 15,
    minOrderValue: 100,
    maxDiscount: null,
    usageLimit: null,
    usageCount: 187,
    active: true,
    startDate: "2023-01-01T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    lastUpdated: "2023-09-16T11:20:00Z",
  },
  {
    id: "DISC003",
    name: "Summer Sale",
    code: "SUMMER20",
    type: "percentage",
    value: 20,
    minOrderValue: 50,
    maxDiscount: 100,
    usageLimit: null,
    usageCount: 532,
    active: false,
    startDate: "2023-06-01T00:00:00Z",
    endDate: "2023-08-31T23:59:59Z",
    lastUpdated: "2023-09-01T09:15:00Z",
  },
  {
    id: "DISC004",
    name: "Free Shipping",
    code: "FREESHIP",
    type: "fixed",
    value: 0,
    minOrderValue: 75,
    maxDiscount: null,
    usageLimit: null,
    usageCount: 421,
    active: true,
    startDate: "2023-01-01T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    lastUpdated: "2023-09-18T14:40:00Z",
  },
  {
    id: "DISC005",
    name: "Black Friday",
    code: "BF25",
    type: "percentage",
    value: 25,
    minOrderValue: 0,
    maxDiscount: 200,
    usageLimit: null,
    usageCount: 0,
    active: false,
    startDate: "2023-11-24T00:00:00Z",
    endDate: "2023-11-27T23:59:59Z",
    lastUpdated: "2023-09-20T11:30:00Z",
  },
]

export default function PricingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("pricing")
  const [selectedType, setSelectedType] = useState("")

  // Filter pricing rules based on search query and selected type
  const filteredPricingRules = pricingRules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === "" || rule.type === selectedType

    return matchesSearch && matchesType
  })

  // Filter discounts based on search query
  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.id.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // Get pricing rule type display
  const getPricingRuleType = (type: string) => {
    switch (type) {
      case "weight_based":
        return "Weight Based"
      case "dimension_based":
        return "Dimension Based"
      case "flat_rate":
        return "Flat Rate"
      case "percentage":
        return "Percentage"
      default:
        return type.replace(/_/g, " ")
    }
  }

  // Get discount type display
  const getDiscountType = (type: string, value: number) => {
    switch (type) {
      case "percentage":
        return `${value}%`
      case "fixed":
        return value > 0 ? `$${value.toFixed(2)}` : "Free Shipping"
      default:
        return `${value} ${type}`
    }
  }

  // Toggle pricing rule active status
  const toggleRuleStatus = (id: string) => {
    // In a real app, this would update the database
    console.log(`Toggling status for rule ${id}`)
  }

  // Toggle discount active status
  const toggleDiscountStatus = (id: string) => {
    // In a real app, this would update the database
    console.log(`Toggling status for discount ${id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pricing & Quote Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/pricing/quotes">
              <Tag className="mr-2 h-4 w-4" />
              View Quotes
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/pricing/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Management</CardTitle>
          <CardDescription>Manage pricing rules, discounts, and promotional offers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="pricing" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
                <TabsTrigger value="discounts">Discounts & Promotions</TabsTrigger>
              </TabsList>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2 sm:max-w-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "pricing" ? "Search pricing rules..." : "Search discounts..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeTab === "pricing" && (
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="weight_based">Weight Based</SelectItem>
                        <SelectItem value="dimension_based">Dimension Based</SelectItem>
                        <SelectItem value="flat_rate">Flat Rate</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
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

              <TabsContent value="pricing" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead>Additional</TableHead>
                        <TableHead>Service Type</TableHead>
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
                      {filteredPricingRules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            No pricing rules found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPricingRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell className="font-medium">
                              <Link href={`/dashboard/pricing/${rule.id}`} className="hover:underline">
                                {rule.id}
                              </Link>
                            </TableCell>
                            <TableCell>{rule.name}</TableCell>
                            <TableCell>{getPricingRuleType(rule.type)}</TableCell>
                            <TableCell>${rule.basePrice.toFixed(2)}</TableCell>
                            <TableCell>
                              {rule.additionalPrice > 0
                                ? `$${rule.additionalPrice.toFixed(2)}/${rule.additionalUnit}`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {rule.serviceType.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={rule.active}
                                onCheckedChange={() => toggleRuleStatus(rule.id)}
                                aria-label={`Toggle ${rule.name} active status`}
                              />
                            </TableCell>
                            <TableCell>{new Date(rule.lastUpdated).toLocaleDateString()}</TableCell>
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
                                    <Link href={`/dashboard/pricing/${rule.id}`}>View details</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/pricing/${rule.id}/edit`}>Edit rule</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Duplicate rule</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Delete rule</DropdownMenuItem>
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

              <TabsContent value="discounts" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Min. Order</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>
                          <Button variant="ghost" className="p-0 font-medium flex items-center gap-1">
                            Valid Period
                            <ArrowDownUp className="ml-2 h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDiscounts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No discounts found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDiscounts.map((discount) => (
                          <TableRow key={discount.id}>
                            <TableCell className="font-medium">
                              <Link href={`/dashboard/pricing/discounts/${discount.id}`} className="hover:underline">
                                {discount.code}
                              </Link>
                            </TableCell>
                            <TableCell>{discount.name}</TableCell>
                            <TableCell>{getDiscountType(discount.type, discount.value)}</TableCell>
                            <TableCell>
                              {discount.minOrderValue > 0 ? `$${discount.minOrderValue.toFixed(2)}` : "None"}
                            </TableCell>
                            <TableCell>
                              {discount.usageCount} / {discount.usageLimit ? discount.usageLimit : "∞"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span>
                                  {new Date(discount.startDate).toLocaleDateString()} -{" "}
                                  {new Date(discount.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={discount.active}
                                onCheckedChange={() => toggleDiscountStatus(discount.id)}
                                aria-label={`Toggle ${discount.name} active status`}
                              />
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
                                    <Link href={`/dashboard/pricing/discounts/${discount.id}`}>View details</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/pricing/discounts/${discount.id}/edit`}>Edit discount</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Duplicate discount</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Delete discount</DropdownMenuItem>
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
            Showing <strong>{activeTab === "pricing" ? filteredPricingRules.length : filteredDiscounts.length}</strong>{" "}
            of <strong>{activeTab === "pricing" ? pricingRules.length : discounts.length}</strong>{" "}
            {activeTab === "pricing" ? "pricing rules" : "discounts"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

