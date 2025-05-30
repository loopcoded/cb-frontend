"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowLeft, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { api, type ClassSchedule } from "@/services/api"

export default function CreateSchedulePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    subject: "",
    room: "",
    startTime: "",
    endTime: "",
    day: "" as ClassSchedule["day"],
    recurrence: "once" as ClassSchedule["recurrence"],
    teacher: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }
      if (user?.role !== "teacher" && user?.role !== "cr") {
        router.push("/dashboard")
        return
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validation
      if (!formData.subject.trim()) {
        toast({
          title: "Error",
          description: "Please enter a subject",
          variant: "destructive",
        })
        return
      }

      if (!formData.room.trim()) {
        toast({
          title: "Error",
          description: "Please enter a room",
          variant: "destructive",
        })
        return
      }

      if (!formData.startTime || !formData.endTime) {
        toast({
          title: "Error",
          description: "Please enter start and end times",
          variant: "destructive",
        })
        return
      }

      if (!formData.day) {
        toast({
          title: "Error",
          description: "Please select a day",
          variant: "destructive",
        })
        return
      }

      if (formData.recurrence === "once" && !date) {
        toast({
          title: "Error",
          description: "Please select a date for one-time schedules",
          variant: "destructive",
        })
        return
      }

      // Check if user has required fields
      if (!user?.year || !user?.department) {
        toast({
          title: "Error",
          description: "User profile is incomplete. Missing year or department information.",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)

      // FIXED: Using API service and including all required fields
      const scheduleData: Omit<ClassSchedule, "_id" | "createdAt" | "updatedAt"> = {
        subject: formData.subject.trim(),
        room: formData.room.trim(),
        date: date || new Date(), // Use selected date or current date
        startTime: formData.startTime,
        endTime: formData.endTime,
        day: formData.day,
        recurrence: formData.recurrence,
        teacher: formData.teacher,
        // FIXED: Adding required fields from backend model
        year: user.year,
        department: user.department,
        createdBy: user.id,
        // Optional: Add section if user has one
        ...(user.section && { section: user.section }),
      }

      console.log("Sending schedule data:", scheduleData)
      const result = await api.createSchedule(scheduleData)
      console.log("Schedule created:", result)

      toast({
        title: "Success",
        description: "Schedule created successfully!",
      })

      router.push("/schedule")
    } catch (error: any) {
      console.error("Error creating schedule:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create schedule",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="container py-6">Loading...</div>
  }

  if (!isAuthenticated || (user?.role !== "teacher" && user?.role !== "cr")) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/schedule">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Schedule</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Class</CardTitle>
          <CardDescription>Schedule a new class or recurring session</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="schedule-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="e.g. Cloud Computing, Data Structures"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room *</Label>
              <Input
                id="room"
                name="room"
                placeholder="e.g. Room 101, Lab 3"
                value={formData.room}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day of Week *</Label>
                <Select value={formData.day} onValueChange={(value) => handleSelectChange("day", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurrence">Recurrence *</Label>
                <Select
                  value={formData.recurrence}
                  onValueChange={(value) => handleSelectChange("recurrence", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.recurrence === "once" && (
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher (optional)</Label>
              <Input
                id="teacher"
                name="teacher"
                placeholder="e.g. Dr. Smith"
                value={formData.teacher}
                onChange={handleChange}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/schedule">Cancel</Link>
          </Button>
          <Button type="submit" form="schedule-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Schedule"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
