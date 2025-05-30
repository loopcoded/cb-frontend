"use client"

import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProfileCard } from "@/components/profile-card"
import { useAuth } from "@/context/auth-context"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, Calendar, MessageSquare, Clock, MapPin, User } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/services/api"

interface UserStats {
  totalAnnouncements: number
  totalReminders: number
  totalSchedules: number
  classesAttended?: number
  totalClasses?: number
  attendanceRate?: number
  assignmentsCompleted?: number
  assignmentsPending?: number
  discussionsParticipated?: number
  lastActive?: string
}

interface EnrolledClass {
  _id?: string
  subject: string
  location: string
  startTime: string
  endTime: string
  professor: string
  icon?: string
  color?: string
}

interface UpcomingDeadline {
  _id?: string
  title: string
  subject: string
  dueDate: string
  priority: "high" | "medium" | "low"
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isAuthenticated, isLoading])

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchProfileData()
    }
  }, [user, isAuthenticated])

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  const fetchProfileData = async () => {
    try {
      setLoading(true)

      const [statsData, classesData, deadlinesData] = await Promise.all([
        api.getUserStats().catch((err) => {
          console.error("Stats error:", err)
          return null
        }),
        api.getEnrolledClasses().catch((err) => {
          console.error("Classes error:", err)
          return []
        }),
        api.getUpcomingAssignments().catch((err) => {
          console.error("Deadlines error:", err)
          return []
        }),
      ])

      if (statsData) {
        setStats(statsData)
      }

      setEnrolledClasses(classesData)
      setUpcomingDeadlines(deadlinesData)
    } catch (error) {
      console.error("Error fetching profile data:", error)
      toast.error("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return timeString
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `${diffDays} days`

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDeadlineBadgeVariant = (priority: string, daysLeft: number) => {
    if (daysLeft <= 1) return "destructive"
    if (priority === "high" || daysLeft <= 3) return "default"
    return "outline"
  }

  const getSubjectColor = (subject: string) => {
    const colorMap: Record<string, string> = {
      "cloud computing": "bg-blue-100 text-blue-800",
      "computer networks": "bg-green-100 text-green-800",
      "database management system": "bg-purple-100 text-purple-800",
      "advanced data structure": "bg-orange-100 text-orange-800",
      "service oriented architecture": "bg-yellow-100 text-yellow-800",
      "object oriented programming": "bg-indigo-100 text-indigo-800",
    }

    const lowerSubject = subject.toLowerCase()
    for (const [key, color] of Object.entries(colorMap)) {
      if (lowerSubject.includes(key)) {
        return color
      }
    }
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading profile data...</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <ProfileCard user={user} />

            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
                <CardDescription>Your recent activity on ClassBuddy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Attended {stats?.classesAttended || 0} of {stats?.totalClasses || enrolledClasses.length}{" "}
                        classes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats?.attendanceRate ? `${stats.attendanceRate}% attendance rate` : "No attendance data"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Completed {stats?.assignmentsCompleted || 0} assignments</p>
                      <p className="text-sm text-muted-foreground">
                        {stats?.assignmentsPending
                          ? `${stats.assignmentsPending} assignments pending`
                          : upcomingDeadlines.length > 0
                            ? `${upcomingDeadlines.length} assignments pending`
                            : "No pending assignments"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Participated in {stats?.discussionsParticipated || 0} discussions</p>
                      <p className="text-sm text-muted-foreground">Last active {stats?.lastActive || "Recently"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{stats?.totalAnnouncements || 0}</p>
                      <p className="text-xs text-muted-foreground">Announcements</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{stats?.totalReminders || 0}</p>
                      <p className="text-xs text-muted-foreground">Reminders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{stats?.totalSchedules || 0}</p>
                      <p className="text-xs text-muted-foreground">Schedules</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Classes</CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </CardHeader>
              <CardContent>
                {enrolledClasses.length > 0 ? (
                  <div className="space-y-3">
                    {enrolledClasses.map((cls, index) => (
                      <div key={cls._id || index} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <BookOpen className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-sm">{cls.subject}</h4>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{cls.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{cls.professor}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-xs ${getSubjectColor(cls.subject)}`}>
                            {cls.subject
                              .split(" ")
                              .map((word) => word.charAt(0))
                              .join("")
                              .toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No classes scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Your nearest assignment deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingDeadlines.slice(0, 5).map((deadline, index) => {
                      const daysLeft = Math.ceil(
                        (new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                      )
                      return (
                        <div
                          key={deadline._id || index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{deadline.title}</p>
                            <p className="text-xs text-muted-foreground">{deadline.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              Due:{" "}
                              {new Date(deadline.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={getDeadlineBadgeVariant(deadline.priority, daysLeft)}>
                              {formatDate(deadline.dueDate)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {deadline.priority}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
