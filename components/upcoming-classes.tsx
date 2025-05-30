///api/users/enrolled-classes
"use client"

import { useEffect, useState , ReactElement } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, BookOpen, Beaker, Calculator } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { format, differenceInMinutes, parseISO } from "date-fns"

const iconMap: Record<string, ReactElement> = {
  BookOpen: <BookOpen className="h-5 w-5 text-primary" />,
  Beaker: <Beaker className="h-5 w-5 text-blue-500" />,
  Calculator: <Calculator className="h-5 w-5 text-green-500" />,
}

interface UpcomingClass {
  subject: string
  location: string
  startTime: string
  endTime: string
  professor: string
  icon: keyof typeof iconMap
  color: string
}

export function UpcomingClasses() {
  const [classes, setClasses] = useState<UpcomingClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        setError(null)
        // Check if we're on the client side
        if (typeof window === 'undefined') {
          return
        }
        const token = localStorage.getItem('classbuddy_token');
        if (!token) throw new Error('No token found');
        console.log("Token being sent:", token);

        const res = await axios.get("https://cb-back-s7yj.onrender.com/api/users/enrolled-classes", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
           },
          });
          console.log("API Response:", res.data)
          setClasses(res.data || [])
        } catch (err) {
        console.error("Error fetching upcoming classes", err)
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 400) {
            const message = err.response.data?.message || 'Invalid request'
            setError(`Error: ${message}. Please check your profile setup.`)
          } else if (err.response?.status === 401) {
            setError('Session expired. Please log in again.')
            // Remove invalid token
            localStorage.removeItem('classbuddy_token')
            // Optionally redirect to login
            // window.location.href = '/login'
          } else if (err.response?.status === 404) {
            setError('No enrolled classes endpoint found.')
          } else if (err.response?.status === 500) {
            setError('Server error. Please try again later.')
          } else {
            setError(`Error: ${err.response?.data?.message || 'Failed to fetch classes'}`)
          }
        } else {
          setError('Network error. Please check your connection.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <div className="bg-gray-200 p-2 rounded-md w-9 h-9"></div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No classes scheduled for today.</p>
        <Button variant="outline" asChild>
          <Link href="/schedule">View Full Schedule</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="grid gap-4">
      {classes.map((cls, index) => {
        try {
          const start = parseISO(cls.startTime)
          const end = parseISO(cls.endTime)
          const now = new Date()
          const minutesLeft = differenceInMinutes(start, now)
          const timeRange = `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`

          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <div className={`bg-${cls.color}-100 p-2 rounded-md`}>
                      {iconMap[cls.icon] || iconMap.BookOpen}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cls.subject}</CardTitle>
                      <CardDescription>{cls.location}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={minutesLeft <= 60 && minutesLeft > 0 ? "default" : "outline"}>
                    {minutesLeft <= 0
                      ? differenceInMinutes(end, now) > 0 
                        ? "In Progress" 
                        : "Completed"
                      : `In ${minutesLeft} min`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{timeRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{cls.professor}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        } catch (dateError) {
          console.error("Error parsing date for class:", cls, dateError)
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{cls.subject}</CardTitle>
                <CardDescription>Date parsing error</CardDescription>
              </CardHeader>
            </Card>
          )
        }
      })}

      <div className="flex justify-center mt-2">
        <Button variant="outline" asChild>
          <Link href="/schedule">View Full Schedule</Link>
        </Button>
      </div>
    </div>
  )
}