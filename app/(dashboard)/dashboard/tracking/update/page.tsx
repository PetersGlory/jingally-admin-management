"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowLeft, MapPin, Package, Truck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function UpdateTrackingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trackingId = searchParams.get("id")

  const [trackingNumber, setTrackingNumber] = useState(trackingId ? "TRK-12345-ABC" : "")
  const [status, setStatus] = useState("in_transit")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate form
    if (!trackingNumber) {
      setError("Tracking number is required")
      setIsLoading(false)
      return
    }

    if (!location) {
      setError("Location is required")
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard/tracking?success=true")
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {trackingId ? "Update Tracking Status" : "Add Tracking Update"}
        </h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{trackingId ? "Update Tracking Status" : "Add Tracking Update"}</CardTitle>
          <CardDescription>
            {trackingId
              ? "Update the status and location of an existing shipment."
              : "Add a new tracking update for a shipment."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                disabled={!!trackingId}
                required
              />
            </div>

            {trackingId && (
              <div className="rounded-md border p-4">
                <div className="flex items-start gap-4">
                  <Package className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium">Shipment Information</p>
                    <p className="text-sm text-muted-foreground">Customer: John Doe</p>
                    <p className="text-sm text-muted-foreground">Origin: New York, NY</p>
                    <p className="text-sm text-muted-foreground">Destination: Los Angeles, CA</p>
                    <p className="text-sm text-muted-foreground">Current Status: In Transit</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="exception">Exception</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter current location"
                  className="pl-8"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this update"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>Saving...</>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  {trackingId ? "Update Status" : "Add Update"}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

