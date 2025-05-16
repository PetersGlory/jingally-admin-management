"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Bell, Lock, User, Mail, Phone, Shield, Key } from "lucide-react"
import { getProfile } from "@/lib/api"

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  isVerified: boolean
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    shipmentUpdates: true,
    marketingEmails: false,
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true)
      const accessToken = localStorage.getItem("token") || ""
      const response = await getProfile(accessToken)
      const userData = response.user
      
      setAccountSettings({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
      })
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast.error("Failed to fetch user profile")
    } finally {
      setProfileLoading(false)
    }
  }

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const accessToken = localStorage.getItem("token") || ""
      // TODO: Implement account update API call
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call
      toast.success("Account settings updated successfully")
    } catch (error) {
      toast.error("Failed to update account settings")
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationToggle = async (setting: keyof typeof notificationSettings) => {
    try {
      // TODO: Implement notification settings update logic
      setNotificationSettings((prev) => ({
        ...prev,
        [setting]: !prev[setting],
      }))
      toast.success("Notification settings updated")
    } catch (error) {
      toast.error("Failed to update notification settings")
    }
  }

  const handleSecurityToggle = async (setting: keyof typeof securitySettings) => {
    try {
      // TODO: Implement security settings update logic
      setSecuritySettings((prev) => ({
        ...prev,
        [setting]: !prev[setting],
      }))
      toast.success("Security settings updated")
    } catch (error) {
      toast.error("Failed to update security settings")
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={accountSettings.firstName}
                      onChange={(e) =>
                        setAccountSettings((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={accountSettings.lastName}
                      onChange={(e) =>
                        setAccountSettings((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountSettings.email}
                    onChange={(e) =>
                      setAccountSettings((prev) => ({ ...prev, email: e.target.value }))
                    }
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={accountSettings.phone}
                    onChange={(e) =>
                      setAccountSettings((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about your shipments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via text message
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={() => handleNotificationToggle("smsNotifications")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={() => handleNotificationToggle("pushNotifications")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shipment Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about shipment status changes
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.shipmentUpdates}
                    onCheckedChange={() => handleNotificationToggle("shipmentUpdates")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and offers
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={() => handleNotificationToggle("marketingEmails")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={() => handleSecurityToggle("twoFactorAuth")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={() => handleSecurityToggle("loginNotifications")}
                  />
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
