"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { getAdmins, createAdmin } from "@/lib/api"
import { Search, Filter, MoreHorizontal, Download, UserPlus, RefreshCw, CheckCircle, XCircle, User, Mail, Phone, Shield, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Admin {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  gender: string | null
  role: string
  createdAt: string
  updatedAt: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    role: "admin"
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    const accessToken = localStorage.getItem("token") || ""
    try {
      setLoading(true)
      const data = await getAdmins(accessToken)
      setAdmins(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch admins. Please try again later.")
      console.error("Error fetching admins:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    const accessToken = localStorage.getItem("token") || ""
    try {
      await createAdmin(accessToken, newAdmin)
      setIsCreateModalOpen(false)
      setNewAdmin({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        role: "admin"
      })
      fetchAdmins()
    } catch (err) {
      console.error("Error creating admin:", err)
      setError("Failed to create admin. Please try again.")
    }
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.gender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admins...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchAdmins} className="mt-4">
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
        <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new admin account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newAdmin.firstName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newAdmin.lastName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={newAdmin.gender}
                  onValueChange={(value) => setNewAdmin({ ...newAdmin, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newAdmin.role}
                  onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateAdmin}>Create Admin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
          <CardDescription>Manage admin accounts and their access levels.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center gap-2 sm:max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchAdmins}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No admins found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.firstName} {admin.lastName}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.phone}</TableCell>
                        <TableCell>{admin.gender || 'Not specified'}</TableCell>
                        <TableCell>
                          <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                            {admin.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
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
                              <DropdownMenuItem onClick={() => setSelectedAdmin(admin)}>
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Suspend admin</DropdownMenuItem>
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
            Showing <strong>{filteredAdmins.length}</strong> of <strong>{admins.length}</strong> admins
          </div>
        </CardFooter>
      </Card>

      {/* View Admin Details Modal */}
      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="top-0 bg-transparent z-10 pb-4 border-b">
            <DialogTitle className="text-2xl">Admin Details</DialogTitle>
            <DialogDescription>
              View detailed information about the admin
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="rounded-lg border p-4 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Basic Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedAdmin.firstName} {selectedAdmin.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedAdmin.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedAdmin.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Gender:</span>
                      <span className="font-medium">{selectedAdmin.gender || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="rounded-lg border p-4 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Account Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <Badge variant={selectedAdmin.role === 'super_admin' ? 'default' : 'secondary'}>
                        {selectedAdmin.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(selectedAdmin.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">
                        {new Date(selectedAdmin.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
