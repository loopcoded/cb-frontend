"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowLeft, CalendarIcon, Clock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { api, type Reminder } from "@/services/api"

export default function CreateReminderPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time: "",
    priority: "medium" as Reminder["priority"],
    relatedTo: "" as Reminder["relatedTo"],
    completed: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }
      if (user?.role !== "cr" && user?.role !== "teacher") {
        router.push("/dashboard")
        return
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      if (!date) {
        toast({
          title: "Error",
          description: "Please select a date",
          variant: "destructive",
        })
        return
      }

      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Please enter a title",
          variant: "destructive",
        })
        return
      }

      if (!formData.relatedTo) {
        toast({
          title: "Error",
          description: "Please select what this reminder is related to",
          variant: "destructive",
        })
        return
      }

      if (!formData.time) {
        toast({
          title: "Error",
          description: "Please select a time",
          variant: "destructive",
        })
        return
      }

      // Check if user has required fields
      if (!user?.section || !user?.year || !user?.department) {
        toast({
          title: "Error",
          description: "User profile is incomplete. Missing section, year, or department information.",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)

      // FIXED: Using API service and including all required fields
      const reminderData: Omit<Reminder, "_id" | "createdAt" | "updatedAt"> = {
        title: formData.title.trim(),
        date: date,
        description: formData.description,
        time: formData.time,
        priority: formData.priority,
        relatedTo: formData.relatedTo,
        completed: formData.completed,
        // FIXED: Adding required fields from backend model
        section: user.section,
        year: user.year,
        department: user.department,
        createdBy: user.id,
      }

      console.log("Sending reminder data:", reminderData)
      const result = await api.createReminder(reminderData)
      console.log("Reminder created:", result)

      toast({
        title: "Success",
        description: "Reminder created successfully!",
      })

      router.push("/reminders")
    } catch (error: any) {
      console.error("Error creating reminder:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create reminder",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="container py-6">Loading...</div>
  }

  if (!isAuthenticated || (user?.role !== "cr" && user?.role !== "teacher")) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reminders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Reminder</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>New Reminder</CardTitle>
          <CardDescription>Create a new reminder for your class</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="reminder-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Assignment Due, Exam Preparation"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add details about this reminder"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <div className="flex">
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Clock className="mr-2 h-4 w-4" />
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      className="border-0 p-0 focus-visible:ring-0"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relatedTo">Related to *</Label>
              <Select
                value={formData.relatedTo}
                onValueChange={(value) => handleSelectChange("relatedTo", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                  <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                  <SelectItem value="DataBase Management System">DataBase Management System</SelectItem>
                  <SelectItem value="Advanced Data Structure">Advanced Data Structure</SelectItem>
                  <SelectItem value="Service Oriented Architecture">Service Oriented Architecture</SelectItem>
                  <SelectItem value="Object Oriented Programming">Object Oriented Programming</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/reminders">Cancel</Link>
          </Button>
          <Button type="submit" form="reminder-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Reminder"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
