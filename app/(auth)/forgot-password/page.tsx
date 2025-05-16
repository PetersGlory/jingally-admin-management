"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, CheckCircle, Package } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!email) {
      setError("Please enter your email address")
      setIsLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Simulate API call
    try {
      // In a real app, this would be an API call to your password reset endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="mb-8 flex items-center gap-2 text-2xl font-bold">
        <Package className="h-8 w-8 text-primary" />
        <span>Jingally Logistics Limited</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to login</span>
              </Link>
            </Button>
            <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          </div>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-4">
            <Alert className="border-green-500 bg-green-500/10 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Password reset link sent! Check your email for instructions.</AlertDescription>
            </Alert>
            <div className="text-center">
              <Button asChild variant="outline" className="mt-2">
                <Link href="/login">Return to login</Link>
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-10"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}

