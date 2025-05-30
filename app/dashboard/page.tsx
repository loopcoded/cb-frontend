"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CalendarDays, Bell, MessageSquare, Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { AnnouncementCard } from "@/components/announcement-card"
import { UpcomingClasses } from "@/components/upcoming-classes"
import { RemindersList } from "@/components/reminders-list"
import { redirect } from "next/navigation"
import { api, ClassSchedule, Announcement, Reminder } from "@/services/api"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    classesToday: 0,
    announcements: 0,
    reminders: 0,
    urgentAnnouncements: 0,
  })

  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([])
  const [todaySchedules, setTodaySchedules] = useState<ClassSchedule[]>([])
  const [recentReminders, setRecentReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isAuthenticated, isLoading])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch all data concurrently
      const [announcements, schedules, reminders] = await Promise.all([
        api.getAllAnnouncements(),
        api.getAllSchedules(),
        api.getAllReminders()
      ])

      // Get today's date and day name
      const today = new Date()
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const todayName = dayNames[today.getDay()]
      const todayDateString = today.toISOString().split('T')[0] // YYYY-MM-DD format

      // Filter today's classes - check both day and date
      const todayClasses = schedules.filter(schedule => {
        // Check if it's a recurring schedule for today's day
        if (schedule.recurrence === 'weekly' && schedule.day === todayName) {
          return true
        }
        
        // Check if it's a one-time schedule for today's date
        if (schedule.recurrence === 'once' || schedule.recurrence === 'none') {
          const scheduleDate = new Date(schedule.date).toISOString().split('T')[0]
          return scheduleDate === todayDateString
        }
        
        // For daily recurrence
        if (schedule.recurrence === 'daily') {
          return true
        }
        
        return false
      })

      // Sort announcements by creation date (most recent first)
      const sortedAnnouncements = announcements
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0).getTime()
          const dateB = new Date(b.createdAt || b.date || 0).getTime()
          return dateB - dateA
        })
        .slice(0, 3)

      // Sort reminders by creation date (most recent first)
      const sortedReminders = reminders
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || 0).getTime()
          const dateB = new Date(b.createdAt || b.date || 0).getTime()
          return dateB - dateA
        })
        .slice(0, 3)

      // Sort today's classes by start time
      const sortedTodayClasses = todayClasses
        .sort((a, b) => {
          const timeA = a.startTime.split(':').map(Number)
          const timeB = b.startTime.split(':').map(Number)
          const minutesA = timeA[0] * 60 + timeA[1]
          const minutesB = timeB[0] * 60 + timeB[1]
          return minutesA - minutesB
        })
        .slice(0, 3)

      setDashboardData({
        classesToday: todayClasses.length,
        announcements: announcements.length,
        reminders: reminders.length,
        urgentAnnouncements: announcements.filter(a => a.urgent).length,
      })

      setRecentAnnouncements(sortedAnnouncements)
      setTodaySchedules(sortedTodayClasses)
      setRecentReminders(sortedReminders)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getNextClass = () => {
    if (todaySchedules.length === 0) return "No classes scheduled for today"
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const upcomingClass = todaySchedules.find(schedule => {
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number)
      const startTime = startHour * 60 + startMinute
      return startTime > currentTime
    })
    
    if (upcomingClass) {
      return `${upcomingClass.subject} at ${upcomingClass.startTime} in ${upcomingClass.room}`
    }
    
    // If no upcoming classes, show the first class of tomorrow or next day
    return "No more classes today"
  }

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Welcome back, {user?.firstName || user?.name?.split(' ')[0] || "User"}!
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your classes today.</p>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Classes</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.classesToday} Classes</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.classesToday > 0 ? `Next: ${getNextClass()}` : "No classes today"}
            </p>
            <div className="mt-4">
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/schedule">View Schedule</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.announcements} Total</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.urgentAnnouncements > 0 
                ? `${dashboardData.urgentAnnouncements} urgent announcement${dashboardData.urgentAnnouncements > 1 ? 's' : ''}`
                : "No urgent announcements"
              }
            </p>
            <div className="mt-4">
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/announcements">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reminders</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.reminders} Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.reminders > 0 ? "Don't forget to check them" : "All caught up!"}
            </p>
            <div className="mt-4">
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/reminders">Manage Reminders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons for Teachers and CRs */}
      {(user?.role === "teacher" || user?.role === "cr") && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {user?.role === "teacher" && (
              <Button asChild>
                <Link href="/schedule/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Schedule
                </Link>
              </Button>
            )}
            {(user?.role === "cr" || user?.role === "teacher") && (
              <>
                <Button asChild>
                  <Link href="/announcements/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Announcement
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/reminders/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Reminder
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabbed Content */}
      <Tabs defaultValue="upcoming" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
          <TabsTrigger value="announcements">Recent Announcements</TabsTrigger>
          <TabsTrigger value="reminders">Active Reminders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {todaySchedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No classes scheduled for today
                </div>
              ) : (
                <div className="space-y-4">
                  {todaySchedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">{schedule.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {schedule.teacher && `${schedule.teacher} • `}
                          Room {schedule.room}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{schedule.startTime} - {schedule.endTime}</p>
                        <p className="text-sm text-muted-foreground">{schedule.day}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* You can also use the UpcomingClasses component here if it exists */}
              {/* <UpcomingClasses /> */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="announcements" className="mt-6">
          <div className="space-y-4">
            {recentAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent announcements
              </div>
            ) : (
              recentAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement._id}
                  title={announcement.title}
                  content={announcement.content}
                  author={announcement.author || "Unknown"}
                  date={announcement.date || announcement.createdAt?.toString()}
                  urgent={announcement.urgent}
                />
              ))
            )}
          </div>
          {recentAnnouncements.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/announcements">View All Announcements</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reminders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReminders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active reminders
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReminders.map((reminder) => (
                    <div
                      key={reminder._id}
                      className={`p-4 border rounded-lg ${
                        reminder.priority === 'high' 
                          ? 'border-red-200 bg-red-50' 
                          : reminder.priority === 'medium'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{reminder.title}</h3>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Priority: {reminder.priority}</span>
                            <span>Subject: {reminder.relatedTo}</span>
                            {reminder.time && <span>Time: {reminder.time}</span>}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {reminder.date && (
                            <p className="text-muted-foreground">
                              {new Date(reminder.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* You can also use the RemindersList component here if it handles recent reminders */}
              {/* <RemindersList /> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}