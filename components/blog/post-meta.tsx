import { Calendar, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface PostMetaProps {
  date: string
  readingTime: number
  tags: string[]
  author?: string
}

export function PostMeta({ date, readingTime, tags, author }: PostMetaProps) {
  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {author && (
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {author}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {readingTime} min read
        </span>
      </div>

      {tags.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`}>
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
