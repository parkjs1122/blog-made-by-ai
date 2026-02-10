import { getAllPosts } from "@/lib/posts"
import { PostList } from "@/components/blog/post-list"

export default async function Home() {
  const posts = await getAllPosts()

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome to My Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Thoughts, tutorials, and insights on web development
          </p>
        </div>
        <PostList posts={posts} showFeatured />
      </div>
    </div>
  )
}
