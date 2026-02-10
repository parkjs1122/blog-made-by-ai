import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPostsByTag, getAllTags } from "@/lib/tags"
import { PostList } from "@/components/blog/post-list"
import { Badge } from "@/components/ui/badge"

interface TagPageProps {
  params: { tag: string }
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return Array.from(tags.keys()).map((tag) => ({
    tag: tag,
  }))
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag)
  const posts = await getPostsByTag(decodedTag)

  if (posts.length === 0) {
    return {
      title: "Tag Not Found",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const title = `Posts tagged with "${decodedTag}"`
  const description = `Browse ${posts.length} post${posts.length > 1 ? "s" : ""} about ${decodedTag}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/tags/${encodeURIComponent(decodedTag)}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const decodedTag = decodeURIComponent(params.tag)
  const posts = await getPostsByTag(decodedTag)
  const allTags = await getAllTags()

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        {/* Tag Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Posts tagged with
            </h1>
            <Badge variant="default" className="text-lg px-3 py-1">
              {decodedTag}
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            {posts.length} post{posts.length > 1 ? "s" : ""} found
          </p>
        </div>

        {/* Posts */}
        <PostList posts={posts} showFeatured={false} />

        {/* All Tags Section */}
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">Browse All Tags</h2>
          <div className="flex flex-wrap gap-3">
            {Array.from(allTags.entries()).map(([tag, count]) => (
              <a key={tag} href={`/tags/${tag}`}>
                <Badge
                  variant={tag === decodedTag ? "default" : "secondary"}
                  className="text-sm px-3 py-1.5 hover:opacity-80 transition-opacity"
                >
                  {tag} ({count})
                </Badge>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
