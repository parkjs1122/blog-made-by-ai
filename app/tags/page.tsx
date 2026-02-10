import type { Metadata } from "next"
import Link from "next/link"
import { getAllTags } from "@/lib/tags"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse posts by tags",
}

export default async function TagsPage() {
  const tags = await getAllTags()

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Browse by Tags
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore {tags.size} topics
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from(tags.entries()).map(([tag, count]) => (
            <Link key={tag} href={`/tags/${tag}`}>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{tag}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {count} post{count > 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
