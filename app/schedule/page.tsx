"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { redirect } from "next/navigation"
import { ScheduleView } from "@/components/schedule-view"

export default function SchedulePage() {
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login")
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return <div className="container py-6">Loading...</div>
  }

  const canCreateSchedule = user?.role === "teacher" || user?.role === "cr"

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
        {canCreateSchedule && (
          <Button asChild>
            <Link href="/schedule/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Link>
          </Button>
        )}
      </div>

      <ScheduleView />
    </div>
  )
}
