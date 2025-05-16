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
  Download,
  Edit,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Upload,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample document templates data
const documentTemplates = [
  {
    id: "TEMP001",
    name: "Shipping Label - Standard",
    type: "shipping_label",
    format: "pdf",
    lastUpdated: "2023-09-15T10:30:00Z",
    updatedBy: "Admin User",
    version: "1.2",
    dimensions: "4x6 inches",
    default: true,
  },
  {
    id: "TEMP002",
    name: "Shipping Label - International",
    type: "shipping_label",
    format: "pdf",
    lastUpdated: "2023-09-16T11:15:00Z",
    updatedBy: "Admin User",
    version: "1.1",
    dimensions: "4x6 inches",
    default: false,
  },
  {
    id: "TEMP003",
    name: "Airway Bill - Standard",
    type: "airway_bill",
    format: "pdf",
    lastUpdated: "2023-09-17T09:20:00Z",
    updatedBy: "Operations Manager",
    version: "2.0",
    dimensions: "8.5x11 inches",
    default: true,
  },
  {
    id: "TEMP004",
    name: "Bill of Lading - Ocean Freight",
    type: "bill_of_lading",
    format: "pdf",
    lastUpdated: "2023-09-18T14:45:00Z",
    updatedBy: "Logistics Manager",
    version: "1.5",
    dimensions: "8.5x11 inches",
    default: true,
  },
  {
    id: "TEMP005",
    name: "Commercial Invoice",
    type: "invoice",
    format: "pdf",
    lastUpdated: "2023-09-19T10:10:00Z",
    updatedBy: "Finance Manager",
    version: "2.1",
    dimensions: "8.5x11 inches",
    default: true,
  },
  {
    id: "TEMP006",
    name: "Customs Declaration Form",
    type: "customs_form",
    format: "pdf",
    lastUpdated: "2023-09-20T11:30:00Z",
    updatedBy: "Compliance Officer",
    version: "1.3",
    dimensions: "8.5x11 inches",
    default: true,
  },
  {
    id: "TEMP007",
    name: "Packing List",
    type: "packing_list",
    format: "pdf",
    lastUpdated: "2023-09-21T13:15:00Z",
    updatedBy: "Warehouse Manager",
    version: "1.0",
    dimensions: "8.5x11 inches",
    default: true,
  },
  {
    id: "TEMP008",
    name: "Delivery Receipt",
    type: "receipt",
    format: "pdf",
    lastUpdated: "2023-09-22T15:40:00Z",
    updatedBy: "Admin User",
    version: "1.4",
    dimensions: "8.5x5.5 inches",
    default: true,
  },
]

// Sample documents data
const documents = [
  {
    id: "DOC001",
    name: "Shipping Label - Order #12345",
    type: "shipping_label",
    format: "pdf",
    createdAt: "2023-10-15T10:30:00Z",
    createdBy: "System",
    size: "56 KB",
    relatedId: "ORD12345",
    downloadCount: 3,
  },
  {
    id: "DOC002",
    name: "Commercial Invoice - Order #12346",
    type: "invoice",
    format: "pdf",
    createdAt: "2023-10-14T14:45:00Z",
    createdBy: "Finance Manager",
    size: "128 KB",
    relatedId: "ORD12346",
    downloadCount: 2,
  },
  {
    id: "DOC003",
    name: "Airway Bill - Shipment #SHP12347",
    type: "airway_bill",
    format: "pdf",
    createdAt: "2023-10-16T11:45:00Z",
    createdBy: "System",
    size: "98 KB",
    relatedId: "SHP12347",
    downloadCount: 1,
  },
  {
    id: "DOC004",
    name: "Customs Declaration - Shipment #SHP12348",
    type: "customs_form",
    format: "pdf",
    createdAt: "2023-10-13T08:20:00Z",
    createdBy: "Compliance Officer",
    size: "145 KB",
    relatedId: "SHP12348",
    downloadCount: 4,
  },
  {
    id: "DOC005",
    name: "Bill of Lading - Shipment #SHP12349",
    type: "bill_of_lading",
    format: "pdf",
    createdAt: "2023-10-17T13:10:00Z",
    createdBy: "Logistics Manager",
    size: "210 KB",
    relatedId: "SHP12349",
    downloadCount: 2,
  },
  {
    id: "DOC006",
    name: "Packing List - Order #12350",
    type: "packing_list",
    format: "pdf",
    createdAt: "2023-10-12T15:20:00Z",
    createdBy: "Warehouse Manager",
    size: "87 KB",
    relatedId: "ORD12350",
    downloadCount: 1,
  },
  {
    id: "DOC007",
    name: "Delivery Receipt - Shipment #SHP12351",
    type: "receipt",
    format: "pdf",
    createdAt: "2023-10-11T09:45:00Z",
    createdBy: "System",
    size: "42 KB",
    relatedId: "SHP12351",
    downloadCount: 5,
  },
  {
    id: "DOC008",
    name: "Commercial Invoice - Order #12352",
    type: "invoice",
    format: "pdf",
    createdAt: "2023-10-10T16:30:00Z",
    createdBy: "Finance Manager",
    size: "132 KB",
    relatedId: "ORD12352",
    downloadCount: 3,
  },
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("documents")
  const [selectedType, setSelectedType] = useState("")

  // Filter documents based on search query and selected type
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.relatedId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === "" || document.type === selectedType

    return matchesSearch && matchesType
  })

  // Filter templates based on search query and selected type
  const filteredTemplates = documentTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === "" || template.type === selectedType

    return matchesSearch && matchesType
  })

  // Get document type display
  const getDocumentTypeDisplay = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Get document type badge
  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case "shipping_label":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            {getDocumentTypeDisplay(type)}
          </Badge>
        )
      case "invoice":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            {getDocumentTypeDisplay(type)}
          </Badge>
        )
      case "airway_bill":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            {getDocumentTypeDisplay(type)}
          </Badge>
        )
      case "bill_of_lading":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            {getDocumentTypeDisplay(type)}
          </Badge>
        )
      case "customs_form":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            {getDocumentTypeDisplay(type)}
          </Badge>
        )
      case "packing_list":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            {getDocumentTypeDisplay(type)}
          </Badge>
        )
      case "receipt":
        return (
          <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20">
            {getDocumentTypeDisplay(type)}
          </Badge>
        )
      default:
        return <Badge variant="outline">{getDocumentTypeDisplay(type)}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/documents/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/documents/templates/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>Manage documents, templates, and forms for shipping and logistics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="documents" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full items-center gap-2 sm:max-w-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "documents" ? "Search documents..." : "Search templates..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="shipping_label">Shipping Label</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="airway_bill">Airway Bill</SelectItem>
                      <SelectItem value="bill_of_lading">Bill of Lading</SelectItem>
                      <SelectItem value="customs_form">Customs Form</SelectItem>
                      <SelectItem value="packing_list">Packing List</SelectItem>
                      <SelectItem value="receipt">Receipt</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>
              </div>

              <TabsContent value="documents" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Related To</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Downloads</TableHead>
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
                      {filteredDocuments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No documents found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDocuments.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell className="font-medium">
                              <Link href={`/dashboard/documents/${document.id}`} className="hover:underline">
                                {document.name}
                              </Link>
                            </TableCell>
                            <TableCell>{getDocumentTypeBadge(document.type)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="uppercase">{document.format}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/dashboard/${document.relatedId.startsWith("ORD") ? "orders" : "shipments"}/${document.relatedId}`}
                                className="hover:underline"
                              >
                                {document.relatedId}
                              </Link>
                            </TableCell>
                            <TableCell>{document.size}</TableCell>
                            <TableCell>{document.downloadCount}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                                <span className="text-xs text-muted-foreground">{document.createdBy}</span>
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
                                    <Link href={`/dashboard/documents/${document.id}`}>View document</Link>
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
                                  <DropdownMenuItem>Print</DropdownMenuItem>
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

              <TabsContent value="templates" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Default</TableHead>
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
                              <Link href={`/dashboard/documents/templates/${template.id}`} className="hover:underline">
                                {template.name}
                              </Link>
                            </TableCell>
                            <TableCell>{getDocumentTypeBadge(template.type)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="uppercase">{template.format}</span>
                              </div>
                            </TableCell>
                            <TableCell>{template.dimensions}</TableCell>
                            <TableCell>v{template.version}</TableCell>
                            <TableCell>
                              {template.default ? (
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                  Default
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">No</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{new Date(template.lastUpdated).toLocaleDateString()}</span>
                                <span className="text-xs text-muted-foreground">{template.updatedBy}</span>
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
                                    <Link href={`/dashboard/documents/templates/${template.id}`}>View template</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/documents/templates/${template.id}/edit`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit template
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Set as default</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
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
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{activeTab === "documents" ? filteredDocuments.length : filteredTemplates.length}</strong>{" "}
            of <strong>{activeTab === "documents" ? documents.length : documentTemplates.length}</strong>{" "}
            {activeTab === "documents" ? "documents" : "templates"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

