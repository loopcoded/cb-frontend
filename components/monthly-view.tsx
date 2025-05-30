//backend route (GET /api/events/monthly
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import axios from "axios"

interface Event {
  day: number
  title: string
  type: string
}

export function MonthlyView() {
  const days = Array.from({ length: 35 }, (_, i) => i + 1)
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/events/monthly")
        setEvents(response.data)
      } catch (error) {
        console.error("Failed to fetch events:", error)
      }
    }

    fetchEvents()
  }, [])

  const getEventBadge = (type: string) => {
    switch (type) {
      case "exam":
        return <Badge variant="destructive" className="text-xs">Exam</Badge>
      case "assignment":
        return <Badge variant="default" className="text-xs">Assignment</Badge>
      case "quiz":
        return <Badge variant="secondary" className="text-xs">Quiz</Badge>
      case "presentation":
        return <Badge className="bg-amber-500 text-xs">Presentation</Badge>
      case "project":
        return <Badge className="bg-indigo-500 text-xs">Project</Badge>
      case "event":
        return <Badge className="bg-green-500 text-xs">Event</Badge>
      case "deadline":
        return <Badge className="bg-purple-500 text-xs">Deadline</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{type}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>May 2025</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">Previous</Badge>
            <Badge variant="outline">Next</Badge>
          </div>
        </div>
        <CardDescription>Monthly view of your academic schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center font-medium mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayEvents = events.filter((e) => e.day === day)
            const isToday = day === 18 // Replace with actual today logic if needed

            return (
              <div
                key={day}
                className={`min-h-[80px] p-1 border rounded-md ${isToday ? "border-primary bg-primary/5" : "border-muted"}`}
              >
                <div className={`text-right text-sm ${isToday ? "font-bold text-primary" : ""}`}>{day}</div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      {getEventBadge(event.type)}
                      <div className="text-xs truncate">{event.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
