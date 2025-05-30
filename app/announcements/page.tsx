"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnnouncementCard } from "@/components/announcement-card"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { redirect } from "next/navigation"
import { api, Announcement } from "@/services/api"

export default function AnnouncementsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isAuthenticated, isLoading])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnnouncements()
    }
  }, [isAuthenticated])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getAllAnnouncements()
      setAnnouncements(data)
    } catch (err) {
      setError("Failed to fetch announcements")
      console.error("Error fetching announcements:", err)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return <div className="container py-6">Loading...</div>
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  const canCreateAnnouncement = user?.role === "teacher" || user?.role === "cr"

  // Filter announcements based on search query
  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const urgentAnnouncements = filteredAnnouncements.filter(a => a.urgent)
  const classAnnouncements = filteredAnnouncements.filter(a => 
    a.category === "academic" || a.category === "assignment" || a.category === "exam"
  )
  const eventAnnouncements = filteredAnnouncements.filter(a => a.category === "event")

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        {canCreateAnnouncement && (
          <Button asChild>
            <Link href="/announcements/create">
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search announcements..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
          <Button variant="link" onClick={fetchAnnouncements} className="ml-2 p-0 h-auto">
            Try again
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading announcements...</div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map(announcement => (
                  <AnnouncementCard
                    key={announcement._id}
                    title={announcement.title}
                    content={announcement.content}
                    author={announcement.author}
                    date={announcement.date}
                    urgent={announcement.urgent}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {searchQuery ? "No announcements match your search." : "No announcements found."}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="urgent" className="mt-6">
            <div className="grid gap-4">
              {urgentAnnouncements.length > 0 ? (
                urgentAnnouncements.map(announcement => (
                  <AnnouncementCard
                    key={announcement._id}
                    title={announcement.title}
                    content={announcement.content}
                    author={announcement.author}
                    date={announcement.date}
                    urgent={announcement.urgent}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No urgent announcements found.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <div className="grid gap-4">
              {classAnnouncements.length > 0 ? (
                classAnnouncements.map(announcement => (
                  <AnnouncementCard
                    key={announcement._id}
                    title={announcement.title}
                    content={announcement.content}
                    author={announcement.author}
                    date={announcement.date}
                    urgent={announcement.urgent}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No class-related announcements found.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="grid gap-4">
              {eventAnnouncements.length > 0 ? (
                eventAnnouncements.map(announcement => (
                  <AnnouncementCard
                    key={announcement._id}
                    title={announcement.title}
                    content={announcement.content}
                    author={announcement.author}
                    date={announcement.date}
                    urgent={announcement.urgent}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No event announcements found.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}