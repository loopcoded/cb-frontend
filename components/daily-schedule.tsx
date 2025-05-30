"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, BookOpen, MapPin, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { api, type ClassSchedule } from "@/services/api"
import { format } from "date-fns"

interface FreeTime {
  startTime: string
  endTime: string
  duration: string
}

interface DailyScheduleData {
  date: string
  classes: ClassSchedule[]
  freeTime: FreeTime[]
}

export function DailySchedule() {
  const [scheduleData, setScheduleData] = useState<DailyScheduleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const getSubjectIcon = (subject: string) => {
    return BookOpen // default icon for now
  }

  const getSubjectColors = (subject: string) => {
    const subjectLower = subject.toLowerCase()
    if (subjectLower.includes('cloud computing') || subjectLower.includes('data structures')) {
      return { iconColor: "text-primary", bgColor: "bg-primary/10" }
    }
    if (subjectLower.includes('computer networks') || subjectLower.includes('database')) {
      return { iconColor: "text-blue-500", bgColor: "bg-blue-500/10" }
    }
    if (subjectLower.includes('programming') || subjectLower.includes('oops')) {
      return { iconColor: "text-green-500", bgColor: "bg-green-500/10" }
    }
    return { iconColor: "text-primary", bgColor: "bg-primary/10" }
  }

  const calculateFreeTime = (classes: ClassSchedule[]): FreeTime[] => {
    if (classes.length === 0) return []
    
    // Sort classes by start time
    const sortedClasses = [...classes].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    )
    
    const freeSlots: FreeTime[] = []
    
    for (let i = 0; i < sortedClasses.length - 1; i++) {
      const currentEnd = sortedClasses[i].endTime
      const nextStart = sortedClasses[i + 1].startTime
      
      if (currentEnd < nextStart) {
        const duration = calculateDuration(currentEnd, nextStart)
        if (duration >= 30) { // Only show breaks of 30+ minutes
          freeSlots.push({
            startTime: currentEnd,
            endTime: nextStart,
            duration: formatDuration(duration)
          })
        }
      }
    }
    
    return freeSlots
  }

  const calculateDuration = (start: string, end: string): number => {
    const [startHours, startMinutes] = start.split(':').map(Number)
    const [endHours, endMinutes] = end.split(':').map(Number)
    
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes
    
    return endTotalMinutes - startTotalMinutes
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const fetchSchedule = async (date: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const classes = await api.getDailySchedules(date)
      const freeTime = calculateFreeTime(classes)
      
      setScheduleData({
        date,
        classes,
        freeTime
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule(selectedDate)
  }, [selectedDate])

  const navigateDay = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate)
    const newDate = new Date(currentDate)
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1)
    } else {
      newDate.setDate(currentDate.getDate() + 1)
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0])
  }

  const formatTime = (time: string) => {
    if (!time) return "No time"
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'EEEE, MMMM dd, yyyy')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchSchedule(selectedDate)}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!scheduleData) {
    return <div>No schedule data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Daily Schedule</h2>
          <p className="text-sm text-muted-foreground">{formatDate(scheduleData.date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDay('prev')}>
            Previous Day
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateDay('next')}>
            Next Day
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {scheduleData.classes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No classes scheduled for this day</p>
            </CardContent>
          </Card>
        ) : (
          scheduleData.classes.map((cls) => {
            const Icon = getSubjectIcon(cls.subject)
            const colors = getSubjectColors(cls.subject)
            
            return (
              <Card key={cls._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <div className={`${colors.bgColor} p-2 rounded-md`}>
                        <Icon className={`h-5 w-5 ${colors.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cls.subject}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {cls.room}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
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
          })
        )}
      </div>

      {scheduleData.freeTime.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Free Time</h3>
          {scheduleData.freeTime.map((freeTime, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Free Time</CardTitle>
                <CardDescription>You have some free time between classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatTime(freeTime.startTime)} - {formatTime(freeTime.endTime)}
                      </span>
                    </div>
                    <Badge variant="outline">{freeTime.duration}</Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">Study</Button>
                    <Button variant="outline" size="sm">Lunch Break</Button>
                    <Button variant="outline" size="sm">Library</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}