import { Suspense } from "react"
import type { Metadata } from "next"
import { getAllPosts } from "@/lib/posts"
import { SearchClient } from "@/components/blog/search-client"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: "Search",
  description: "Search blog posts",
  openGraph: {
    title: "Search",
    description: "Search blog posts",
    url: `${baseUrl}/search`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Search",
    description: "Search blog posts",
  },
}

export default async function SearchPage() {
  const posts = await getAllPosts()

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Search</h1>
        <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
          <SearchClient posts={posts} />
        </Suspense>
      </div>
    </div>
  )
}
