"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Plus, Clock, AlertCircle, CheckCircle2, Calendar } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { redirect } from "next/navigation"
import { api, type Reminder } from "@/services/api"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

interface RemindersListProps {
  reminders: Reminder[]
  onToggleComplete: (id: string, completed: boolean) => void
  isLoading?: boolean
}

function RemindersList({ reminders, onToggleComplete, isLoading }: RemindersListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No reminders found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <Card key={reminder._id} className={reminder.completed ? "opacity-60" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Checkbox
                  checked={reminder.completed}
                  onCheckedChange={(checked) => 
                    onToggleComplete(reminder._id!, checked as boolean)
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${reminder.completed ? 'line-through' : ''}`}>
                      {reminder.title}
                    </h3>
                    <Badge 
                      variant={
                        reminder.priority === 'high' ? 'destructive' : 
                        reminder.priority === 'medium' ? 'default' : 
                        'secondary'
                      }
                    >
                      {reminder.priority}
                    </Badge>
                  </div>
                  
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {reminder.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {reminder.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(reminder.date), "MMM dd, yyyy")}
                      </div>
                    )}
                    {reminder.time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {reminder.time}
                      </div>
                    )}
                    {reminder.relatedTo && (
                      <Badge variant="outline" className="text-xs">
                        {reminder.relatedTo}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function RemindersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    if (isAuthenticated) {
      fetchReminders()
    }
  }, [isAuthenticated])

  const fetchReminders = async () => {
    try {
      setIsLoading(true)
      const data = await api.getAllReminders()
      setReminders(data)
    } catch (error) {
      console.error("Error fetching reminders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reminders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await api.updateReminder(id, { completed })
      setReminders(reminders.map(reminder => 
        reminder._id === id ? { ...reminder, completed } : reminder
      ))
      toast({
        title: "Success",
        description: `Reminder marked as ${completed ? 'completed' : 'active'}`,
      })
    } catch (error) {
      console.error("Error updating reminder:", error)
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      })
    }
  }

  if (authLoading) {
    return <div className="container py-6">Loading...</div>
  }

  const canCreateReminder = user?.role === "cr" || user?.role === "teacher"

  const activeReminders = reminders.filter(r => !r.completed)
  const completedReminders = reminders.filter(r => r.completed)
  const upcomingReminders = reminders.filter(r => 
    !r.completed && r.date && new Date(r.date) > new Date()
  )

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
        {canCreateReminder && (
          <Button asChild>
            <Link href="/reminders/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Active ({activeReminders.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming ({upcomingReminders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed ({completedReminders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Reminders</CardTitle>
              <CardDescription>Reminders that need your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <RemindersList 
                reminders={activeReminders} 
                onToggleComplete={handleToggleComplete}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription>Reminders scheduled for the future</CardDescription>
            </CardHeader>
            <CardContent>
              <RemindersList 
                reminders={upcomingReminders} 
                onToggleComplete={handleToggleComplete}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Reminders</CardTitle>
              <CardDescription>Reminders you've marked as done</CardDescription>
            </CardHeader>
            <CardContent>
              <RemindersList 
                reminders={completedReminders} 
                onToggleComplete={handleToggleComplete}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}