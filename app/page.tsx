import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Bell, MessageSquare, Users } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ClassBuddy - Your Academic Companion
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                A centralized platform to manage class schedules, share real-time announcements, and set academic
                reminders.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/login">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Smart Scheduling</h3>
                <p className="text-muted-foreground">
                  Keep track of your class timetables, view daily, weekly, and monthly schedules.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Real-time Announcements</h3>
                <p className="text-muted-foreground">
                  Stay updated with important class announcements and never miss critical information.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Academic Reminders</h3>
                <p className="text-muted-foreground">
                  Set and manage reminders for assignments, exams, and other academic deadlines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Who Can Use ClassBuddy?</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                ClassBuddy is designed for the entire academic community.
              </p>
            </div>
            <div className="grid w-full max-w-3xl gap-6 md:grid-cols-3 md:gap-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <Users className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Students</h3>
                <p className="text-sm text-muted-foreground">
                  Access schedules, view announcements, and set personal reminders.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <BookOpen className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Teachers</h3>
                <p className="text-sm text-muted-foreground">
                  Create schedules, post announcements, and manage class activities.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <Users className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Class Representatives</h3>
                <p className="text-sm text-muted-foreground">
                  Assist in schedule management, create announcements, and set reminders for the class.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
