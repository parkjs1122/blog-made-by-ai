import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/types/post"

interface PostCardProps {
  post: Post
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const { slug, frontmatter, readingTime } = post

  return (
    <Link href={`/posts/${slug}`} className="block group">
      <Card className={`h-full transition-all hover:shadow-lg ${featured ? "md:col-span-2" : ""}`}>
        {/* Featured Image */}
        {frontmatter.image && (
          <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
            <Image
              src={frontmatter.image}
              alt={frontmatter.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=="
            />
          </div>
        )}

        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {frontmatter.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {frontmatter.featured && (
              <Badge variant="default" className="text-xs">
                Featured
              </Badge>
            )}
          </div>
          <CardTitle className="group-hover:text-primary transition-colors">
            {frontmatter.title}
          </CardTitle>
          <CardDescription className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(frontmatter.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} min read
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">
            {frontmatter.excerpt}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
