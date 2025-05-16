"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  // Check if user is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  return <DashboardLayout>{children}</DashboardLayout>
}

