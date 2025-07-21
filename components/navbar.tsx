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
import { Bell, BookOpen, Menu, User, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { api, Reminder, ClassSchedule, Announcement } from "@/services/api"

// Updated Navbar component using api service
export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [notifications, setNotifications] = useState<{
    reminders: Reminder[];
    schedules: ClassSchedule[];
    announcements: Announcement[];
    loading: boolean;
    error: string | null;
  }>({
    reminders: [],
    schedules: [],
    announcements: [],
    loading: false,
    error: null,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.section) {
      const fetchNotifications = async () => {
        setNotifications((prev) => ({ ...prev, loading: true }))
        try {
          // Fetch uncompleted reminders
          const reminders = await api.getPendingReminders()
          console.log('Reminders fetched:', reminders)

          // Fetch today's classes
          const today = new Date().toISOString().split('T')[0] // 2025-07-22
          const schedules = await api.getDailySchedules(today)
          console.log('Schedules fetched:', schedules)

          // Fetch urgent announcements
          const announcements = await api.getUrgentAnnouncements()
          console.log('Announcements fetched:', announcements)

          setNotifications({
            reminders,
            schedules,
            announcements,
            loading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to fetch notifications'
          console.error('Fetch notifications error:', error)
          setNotifications((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }))
          toast.error(errorMessage)
        }
      }

      fetchNotifications()
    } else if (isAuthenticated && !user?.section) {
      setNotifications((prev) => ({
        ...prev,
        loading: false,
        error: 'User section not configured',
      }))
      toast.error('User section not configured')
    }
  }, [isAuthenticated, user?.section])

  if (!isMounted) {
    return null
  }

  // Only count uncompleted reminders for the notification badge
  const notificationCount = notifications.reminders.length

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80" forceMount style={{ zIndex: 1000 }}>
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.loading ? (
                    <DropdownMenuItem>Loading...</DropdownMenuItem>
                  ) : notifications.error ? (
                    <DropdownMenuItem className="text-red-500">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {notifications.error}
                    </DropdownMenuItem>
                  ) : notifications.reminders.length === 0 &&
                    notifications.schedules.length === 0 &&
                    notifications.announcements.length === 0 ? (
                    <DropdownMenuItem>No new notifications</DropdownMenuItem>
                  ) : (
                    <>
                      {notifications.reminders.length > 0 && (
                        <>
                          <DropdownMenuLabel>Uncompleted Reminders</DropdownMenuLabel>
                          {notifications.reminders.slice(0, 3).map((reminder) => (
                            <DropdownMenuItem key={reminder._id} asChild>
                              <Link href={`/reminders/${reminder._id}`}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {reminder.title} - {reminder.time}
                                {reminder.date && ` (${new Date(reminder.date).toLocaleDateString()})`}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {notifications.schedules.length > 0 && (
                        <>
                          <DropdownMenuLabel>Today's Classes</DropdownMenuLabel>
                          {notifications.schedules.slice(0, 3).map((schedule) => (
                            <DropdownMenuItem key={schedule._id} asChild>
                              <Link href={`/schedule/${schedule._id}`}>
                                <Calendar className="h-4 w-4 mr-2" />
                                {schedule.subject} - {schedule.startTime} @ {schedule.room}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {notifications.announcements.length > 0 && (
                        <>
                          <DropdownMenuLabel>Urgent Announcements</DropdownMenuLabel>
                          {notifications.announcements.slice(0, 3).map((announcement) => (
                            <DropdownMenuItem key={announcement._id} asChild>
                              <Link href={`/announcements/${announcement._id}`}>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {announcement.title}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      {(notifications.reminders.length > 0 ||
                        notifications.schedules.length > 0 ||
                        notifications.announcements.length > 0) && (
                        <DropdownMenuItem asChild>
                          <Link href="/notifications" className="text-primary font-medium">
                            View All Notifications
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

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
                    <Link
                      href="/notifications"
                      className={`text-sm font-medium ${
                        pathname.startsWith("/notifications") ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Notifications
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