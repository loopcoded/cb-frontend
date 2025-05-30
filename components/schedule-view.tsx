"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, BookOpen, AlertCircle } from "lucide-react"
import { EnhancedCalendarView } from "@/components/enhanced-calendar-view"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

// Replace `any` with proper type if available from your backend
interface ClassItem {
  _id: string
  subject: string
  room: string
  date: Date
  startTime: string
  endTime: string
  teacher: string
  icon?: typeof BookOpen
  iconColor?: string
  bgColor?: string
}

export function ScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [allClasses, setAllClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSchedule() {
      try {
        setLoading(true)
        setError(null)

        // Check if user has required auth info
        if (!user) {
          throw new Error("User not authenticated")
        }

        console.log("User info:", user)

        // Get token from localStorage
        const token = localStorage.getItem("classbuddy_token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        console.log("Making request with token:", token.substring(0, 20) + "...")

        // Make the API call with proper headers
        const response = await fetch("https://cb-back-s7yj.onrender.com/api/schedules", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Response status:", response.status)
        console.log("Response headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error response:", errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log("Received data:", data)

        const parsed: ClassItem[] = data.map((cls: any) => ({
          ...cls,
          date: new Date(cls.date),
          icon: BookOpen,
          iconColor: cls.iconColor || "text-primary",
          bgColor: cls.bgColor || "bg-primary/10",
        }))

        setAllClasses(parsed)
      } catch (err) {
        console.error("Error fetching schedules:", err)
        const errorMessage = err instanceof Error ? err.message : "Could not load schedule."
        setError(errorMessage)

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchSchedule()
    }
  }, [user, toast])

  const classesForSelectedDate = allClasses.filter((cls) => cls.date.toDateString() === selectedDate.toDateString())

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })

  const classScheduleDates = allClasses.map((cls) => cls.date)

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please log in to view your schedule</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{formatDate(selectedDate)}'s Schedule</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedDate((prev) => {
                      const newDate = new Date(prev)
                      newDate.setDate(prev.getDate() - 1)
                      return newDate
                    })
                  }
                >
                  Previous Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedDate((prev) => {
                      const newDate = new Date(prev)
                      newDate.setDate(prev.getDate() + 1)
                      return newDate
                    })
                  }
                >
                  Next Day
                </Button>
              </div>
            </div>
            <CardDescription>
              {loading
                ? "Loading schedule..."
                : error
                  ? error
                  : classesForSelectedDate.length > 0
                    ? `You have ${classesForSelectedDate.length} class${
                        classesForSelectedDate.length > 1 ? "es" : ""
                      } scheduled`
                    : "No classes scheduled for this day"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : classesForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {classesForSelectedDate.map((cls) => {
                  const Icon = cls.icon || BookOpen
                  return (
                    <Card
                      key={cls._id}
                      className="border-l-4 border-l-primary shadow-sm hover:shadow transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <div className={`${cls.bgColor} p-2 rounded-md`}>
                              <Icon className={`h-5 w-5 ${cls.iconColor}`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{cls.subject}</CardTitle>
                              <CardDescription>{cls.room}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {cls.startTime} - {cls.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{cls.teacher || "No teacher assigned"}</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            Materials
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-xl font-medium mb-2">No Classes Scheduled</h3>
                <p className="text-muted-foreground max-w-md">
                  There are no classes scheduled for this day. Enjoy your free time or use it for study!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {classesForSelectedDate.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Free Time</CardTitle>
              <CardDescription>You have some free time between classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>10:45 AM - 11:15 AM</span>
                  </div>
                  <Badge variant="outline">30 minutes</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>1PM - 2PM</span>
                  </div>
                  <Badge variant="outline">1 hour</Badge>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Study
                  </Button>
                  <Button variant="outline" size="sm">
                    Lunch Break
                  </Button>
                  <Button variant="outline" size="sm">
                    Library
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select a date to view schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedCalendarView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              classScheduleDates={classScheduleDates}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
