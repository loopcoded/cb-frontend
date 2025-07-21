"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trash2, Loader2 } from "lucide-react"
import { api, type Reminder } from "@/services/api"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface RemindersListProps {
  reminders: Reminder[]
  onUpdate: () => void
}

export function RemindersList({ reminders, onUpdate }: RemindersListProps) {
  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r._id === id)
    if (!reminder) return

    try {
      const updatedReminder = await api.updateReminder(id, {
        completed: !reminder.completed
      })
      
      // Notify parent to refresh data
      onUpdate()
      
      toast({
        title: "Success",
        description: `Reminder marked as ${updatedReminder.completed ? 'completed' : 'pending'}`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive"
      })
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      const success = await api.deleteReminder(id)
      if (success) {
        // Notify parent to refresh data
        onUpdate()
        toast({
          title: "Success",
          description: "Reminder deleted successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "No date"
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, "MMM dd, yyyy")
  }

  const formatTime = (time: string) => {
    if (!time) return "No time"
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No active reminders</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <Card key={reminder._id} className={reminder.completed ? "opacity-60" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Checkbox
                checked={reminder.completed}
                onCheckedChange={() => reminder._id && toggleReminder(reminder._id)}
                className="mt-1"
              />
              <div className="flex-1 grid gap-1">
                <div className="flex items-center justify-between">
                  <label className={`font-medium ${reminder.completed ? "line-through text-muted-foreground" : ""}`}>
                    {reminder.title}
                  </label>
                  <Badge variant={getPriorityColor(reminder.priority) as any}>
                    {reminder.priority}
                  </Badge>
                </div>
                {reminder.description && (
                  <p className="text-sm text-muted-foreground">{reminder.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(reminder.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTime(reminder.time)}</span>
                  </div>
                </div>
                {reminder.relatedTo && reminder.relatedTo !== 'Other' && (
                  <Badge variant="outline" className="w-fit mt-2">
                    {reminder.relatedTo}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => reminder._id && deleteReminder(reminder._id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}