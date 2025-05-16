"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Plus, Package } from "lucide-react"
import { getContainers, createContainer } from "@/lib/api"

interface Container {
  id: string
  containerNumber: string
  type: string
  capacity: string
  location: string
  notes: string
  createdAt: string
}

export default function ContainersPage() {
//   const { accessToken } = useAuth()
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newContainer, setNewContainer] = useState({
    containerNumber: "",
    type: "",
    capacity: "",
    location: "",
    notes: "",
  })

  useEffect(() => {
    fetchContainers()
  }, [])

  const fetchContainers = async () => {
    try {
      const accessToken = localStorage.getItem("token") || "";

      const data = await getContainers(accessToken)
      setContainers(data)
    } catch (error) {
      toast.error("Failed to fetch containers")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    const accessToken = localStorage.getItem("token") || "";
    try {
      await createContainer(accessToken, newContainer)
      toast.success("Container created successfully")
      setIsModalOpen(false)
      setNewContainer({
        containerNumber: "",
        type: "",
        capacity: "",
        location: "",
        notes: "",
      })
      fetchContainers()
    } catch (error) {
      toast.error("Failed to create container")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Containers</h1>
          <p className="text-muted-foreground">
            Manage your shipping containers and their details
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Container
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Container</DialogTitle>
              <DialogDescription>
                Fill in the details for the new container
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="containerNumber">Container Number</Label>
                <Input
                  id="containerNumber"
                  value={newContainer.containerNumber}
                  onChange={(e) =>
                    setNewContainer((prev) => ({
                      ...prev,
                      containerNumber: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Container Type</Label>
                <Select
                  value={newContainer.type}
                  onValueChange={(value) =>
                    setNewContainer((prev) => ({ ...prev, type: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select container type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20ft">20ft Standard</SelectItem>
                    <SelectItem value="40ft">40ft Standard</SelectItem>
                    <SelectItem value="40ftHC">40ft High Cube</SelectItem>
                    <SelectItem value="45ft">45ft High Cube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (in tons)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newContainer.capacity}
                  onChange={(e) =>
                    setNewContainer((prev) => ({
                      ...prev,
                      capacity: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  value={newContainer.location}
                  onChange={(e) =>
                    setNewContainer((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newContainer.notes}
                  onChange={(e) =>
                    setNewContainer((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Container"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Container List</CardTitle>
          <CardDescription>
            View and manage all your shipping containers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Container Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers.map((container) => (
                <TableRow key={container.id}>
                  <TableCell>{container.containerNumber}</TableCell>
                  <TableCell>{container.type}</TableCell>
                  <TableCell>{container.capacity} tons</TableCell>
                  <TableCell>{container.location}</TableCell>
                  <TableCell>{container.notes}</TableCell>
                  <TableCell>
                    {new Date(container.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {containers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No containers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
