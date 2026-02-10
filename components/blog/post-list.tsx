import { PostCard } from "./post-card"
import type { Post } from "@/types/post"

interface PostListProps {
  posts: Post[]
  showFeatured?: boolean
}

export function PostList({ posts, showFeatured = false }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-lg">No posts found.</p>
      </div>
    )
  }

  // Separate featured and regular posts
  const featuredPost = showFeatured
    ? posts.find((post) => post.frontmatter.featured)
    : null
  const regularPosts = featuredPost
    ? posts.filter((post) => post.slug !== featuredPost.slug)
    : posts

  return (
    <div className="space-y-8">
      {/* Featured Post */}
      {featuredPost && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Featured Post</h2>
          <PostCard post={featuredPost} featured />
        </div>
      )}

      {/* Regular Posts Grid */}
      {regularPosts.length > 0 && (
        <>
          {featuredPost && (
            <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
