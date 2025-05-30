import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BookOpen, GraduationCap, User } from "lucide-react"

interface ProfileCardProps {
  user: {
    name: string
    email: string
    role: string
  } | null
}

export function ProfileCard({ user }: ProfileCardProps) {
  if (!user) return null

  const getInitials = (name: string) => {
    const nameParts = name.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "teacher":
        return <GraduationCap className="h-4 w-4" />
      case "cr":
        return <BookOpen className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "teacher":
        return "Teacher"
      case "cr":
        return "Class Representative"
      default:
        return "Student"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <Badge className="flex items-center gap-1 px-3 py-1 w-fit">
            {getRoleIcon(user.role)}
            <span>{getRoleName(user.role)}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
