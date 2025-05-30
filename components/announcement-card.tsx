import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Share2 } from "lucide-react"

interface AnnouncementCardProps {
  title: string
  content: string
  author: string
  date?: string
  urgent?: boolean
}

function formatDate(dateString?: string): string {
  if (!dateString) {
    return "Date not specified"
  }
  
  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }
    
    // Format as a readable date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return "Invalid date"
  }
}

export function AnnouncementCard({ title, content, author, date, urgent = false }: AnnouncementCardProps) {
  const formattedDate = formatDate(date)
  
  return (
    <Card className={urgent ? "border-l-4 border-l-destructive shadow-sm" : "border-l-4 border-l-primary shadow-sm"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              {author} • {formattedDate}
            </CardDescription>
          </div>
          {urgent && (
            <Badge variant="destructive" className="ml-2">
              Urgent
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="ghost" size="sm">
          <Bell className="mr-2 h-4 w-4" />
          Remind me
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  )
}