"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, BookOpen, Menu, User } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ClassBuddy
            </span>
          </Link>
        </div>

        {isAuthenticated ? (
          <>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/schedule"
                className={`text-sm font-medium ${
                  pathname.startsWith("/schedule") ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Schedule
              </Link>
              <Link
                href="/announcements"
                className={`text-sm font-medium ${
                  pathname.startsWith("/announcements") ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Announcements
              </Link>
              <Link
                href="/reminders"
                className={`text-sm font-medium ${
                  pathname.startsWith("/reminders") ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Reminders
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="flex flex-col gap-1">
                    <span className="font-semibold">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                    <span className="text-xs font-medium text-primary capitalize">{user?.role}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-4 mt-8">
                    <Link
                      href="/dashboard"
                      className={`text-sm font-medium ${
                        pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/schedule"
                      className={`text-sm font-medium ${
                        pathname.startsWith("/schedule") ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Schedule
                    </Link>
                    <Link
                      href="/announcements"
                      className={`text-sm font-medium ${
                        pathname.startsWith("/announcements") ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Announcements
                    </Link>
                    <Link
                      href="/reminders"
                      className={`text-sm font-medium ${
                        pathname.startsWith("/reminders") ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Reminders
                    </Link>
                    <Button onClick={logout} variant="outline" className="mt-4">
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/login" className="text-sm font-medium">
                    Login
                  </Link>
                  <Link href="/register" className="text-sm font-medium">
                    Sign Up
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  )
}
