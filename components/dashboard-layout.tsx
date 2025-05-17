"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Package,
  Users,
  // CreditCard,
  // BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  Sun,
  Moon,
  Truck,
  // FileText,
  // Tag,
  MessageSquare,
  ShieldAlert,
  Home,
  Container,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  // {
  //   title: "Users",
  //   href: "/dashboard/users",
  //   icon: <Users className="h-5 w-5" />,
  // },
  {
    title: "Drivers",
    href: "/dashboard/drivers",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    title: "Shipments",
    href: "/dashboard/shipments",
    icon: <Package className="h-5 w-5" />,
  },
  // {
  //   title: "Containers",
  //   href: "/dashboard/shipments/containers",
  //   icon: <Container className="h-5 w-5" />,
  // },
  {
    title: "Tracking",
    href: "/dashboard/tracking",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    title: "Manual Shipments",
    href: "/dashboard/shipments/manual",
    icon: <Package className="h-5 w-5" />,
  },

  // {
  //   title: "Support",
  //   href: "/dashboard/support",
  //   icon: <MessageSquare className="h-5 w-5" />,
  // },
  // {
  //   title: "Security",
  //   href: "/dashboard/security",
  //   icon: <ShieldAlert className="h-5 w-5" />,
  // },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const isMobile = useMobile()
  const { toast } = useToast()

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  // Set initial theme based on system preference
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setTheme(isDark ? "dark" : "light")
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const handleLogout = () => {
    // Clear authentication state
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })

    // Redirect to login page
    window.location.href = "/login"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-6 w-6" />
                <span>Jingally Logistics Limited</span>
              </Link>
              <div className="grid gap-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                      pathname === item.href ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-xl">
          <Package className="h-6 w-6" />
          <span className="hidden md:inline-block">Admin Portal</span>
        </Link>
        <div className="flex-1">
          <form className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              />
            </div>
          </form>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleTheme}>{theme === "light" ? "Dark mode" : "Light mode"}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem> */}
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-background md:block">
          <nav className="grid gap-2 p-4 text-sm font-medium">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                  pathname === item.href ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

