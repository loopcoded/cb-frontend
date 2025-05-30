"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { api, type Announcement } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

export default function CreateAnnouncementPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "" as Announcement["category"],
    author: "",
    date: new Date().toISOString().split("T")[0],
    audience: "all" as Announcement["audience"],
    urgent: false,
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
    if (user) {
      setFormData((prev) => ({ ...prev, author: user.name || user.email || "Unknown" }))
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, urgent: checked }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validation
      if (!formData.category) {
        toast({
          title: "Error",
          description: "Please select a category.",
          variant: "destructive",
        })
        return
      }

      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Please enter a title.",
          variant: "destructive",
        })
        return
      }

      if (!formData.content.trim()) {
        toast({
          title: "Error",
          description: "Please enter content.",
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

      // FIXED: Now including all required fields that match the backend model
      const announcementData: Omit<Announcement, "_id" | "createdAt" | "updatedAt"> = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        audience: formData.audience,
        category: formData.category,
        urgent: formData.urgent,
        author: formData.author,
        date: formData.date,
        // FIXED: Adding required fields from backend model
        section: user.section,
        year: user.year,
        department: user.department,
        createdBy: user.id,
      }

      const result = await api.createAnnouncement(announcementData)
      console.log("Announcement created:", result)

      toast({
        title: "Success",
        description: "Announcement created successfully!",
      })

      router.push("/announcements")
    } catch (error: any) {
      console.error("Error creating announcement:", error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
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
          <Link href="/announcements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Announcement</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>New Announcement</CardTitle>
          <CardDescription>
            Create a new announcement for your section
            {user?.section && (
              <span className="block text-sm mt-1 text-muted-foreground">
                This will be visible to your section only
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="announcement-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter announcement title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter announcement details"
                rows={5}
                value={formData.content}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={handleSelectChange("category")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Select value={formData.audience} onValueChange={handleSelectChange("audience")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="urgent" checked={formData.urgent} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="urgent">Mark as urgent</Label>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/announcements">Cancel</Link>
          </Button>
          <Button type="submit" form="announcement-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Announcement"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
