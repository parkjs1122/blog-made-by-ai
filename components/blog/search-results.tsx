import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SearchResult } from "@/types/post"

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-lg">
          No posts found for &quot;{query}&quot;
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try different keywords or browse all posts
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {results.length} result{results.length > 1 ? "s" : ""} for &quot;{query}&quot;
      </p>
      <div className="grid gap-4">
        {results.map(({ post, score }) => (
          <Link key={post.slug} href={`/posts/${post.slug}`} className="block group">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {post.frontmatter.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-xs mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime} min read
                      </span>
                      {score !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          Relevance: {Math.round((1 - score) * 100)}%
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 mb-3">
                  {post.frontmatter.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.frontmatter.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
