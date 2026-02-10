import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"
import { Post, PostFrontmatter } from "@/types/post"

const POSTS_DIRECTORY = path.join(process.cwd(), "content/posts")

/**
 * Get all published posts from the content directory
 * Filters out drafts in production environment
 * @returns Array of posts sorted by date (newest first)
 */
export async function getAllPosts(): Promise<Post[]> {
  // Check if posts directory exists
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    console.warn(`Posts directory not found: ${POSTS_DIRECTORY}`)
    return []
  }

  // Read all MDX files from posts directory
  const fileNames = fs.readdirSync(POSTS_DIRECTORY)
  const mdxFiles = fileNames.filter(
    (fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md")
  )

  // Parse each file into a Post object
  const posts = mdxFiles
    .map((fileName) => {
      const slug = fileName.replace(/\.(mdx|md)$/, "")
      const post = getPostBySlugSync(slug)
      return post
    })
    .filter((post): post is Post => post !== null)

  // Filter out drafts in production
  const filteredPosts =
    process.env.NODE_ENV === "production"
      ? posts.filter((post) => !post.frontmatter.draft)
      : posts

  // Sort by date (newest first)
  const sortedPosts = filteredPosts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime()
    const dateB = new Date(b.frontmatter.date).getTime()
    return dateB - dateA // Descending order
  })

  return sortedPosts
}

/**
 * Get a single post by its slug
 * @param slug - The post slug (filename without extension)
 * @returns Post object or null if not found
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  return getPostBySlugSync(slug)
}

/**
 * Synchronous version of getPostBySlug
 * Used internally by getAllPosts to avoid async issues
 */
function getPostBySlugSync(slug: string): Post | null {
  try {
    // Try both .mdx and .md extensions
    let filePath = path.join(POSTS_DIRECTORY, `${slug}.mdx`)
    if (!fs.existsSync(filePath)) {
      filePath = path.join(POSTS_DIRECTORY, `${slug}.md`)
      if (!fs.existsSync(filePath)) {
        console.warn(`Post not found: ${slug}`)
        return null
      }
    }

    // Read and parse the file
    const fileContents = fs.readFileSync(filePath, "utf8")
    const { data, content } = matter(fileContents)

    // Validate required frontmatter fields
    if (!data.title || !data.date || !data.excerpt) {
      console.error(`Missing required frontmatter in ${slug}:`, {
        title: !!data.title,
        date: !!data.date,
        excerpt: !!data.excerpt,
      })
      return null
    }

    // Parse frontmatter
    const frontmatter: PostFrontmatter = {
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      author: data.author,
      tags: Array.isArray(data.tags) ? data.tags : [],
      featured: data.featured || false,
      image: data.image,
      draft: data.draft || false,
    }

    // Calculate reading time
    const readingTimeResult = calculateReadingTime(content)

    return {
      slug,
      frontmatter,
      content,
      readingTime: readingTimeResult,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

/**
 * Calculate estimated reading time for content
 * @param content - The markdown content
 * @returns Reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const stats = readingTime(content)
  return Math.ceil(stats.minutes)
}

/**
 * Get all posts filtered by a specific tag
 * @param tag - The tag to filter by
 * @returns Array of posts with the specified tag
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) =>
    post.frontmatter.tags.some(
      (postTag) => postTag.toLowerCase() === tag.toLowerCase()
    )
  )
}

/**
 * Get all unique tags from all posts with their counts
 * @returns Map of tag names to post counts
 */
export async function getAllTags(): Promise<Map<string, number>> {
  const allPosts = await getAllPosts()
  const tagCounts = new Map<string, number>()

  allPosts.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => {
      const count = tagCounts.get(tag) || 0
      tagCounts.set(tag, count + 1)
    })
  })

  return tagCounts
}

/**
 * Get featured posts (posts with featured: true in frontmatter)
 * @returns Array of featured posts
 */
export async function getFeaturedPosts(): Promise<Post[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.frontmatter.featured)
}

/**
 * Get recent posts (limited count)
 * @param limit - Maximum number of posts to return
 * @returns Array of recent posts
 */
export async function getRecentPosts(limit: number = 5): Promise<Post[]> {
  const allPosts = await getAllPosts()
  return allPosts.slice(0, limit)
}

/**
 * Get related posts based on shared tags
 * @param currentPost - The current post
 * @param limit - Maximum number of related posts to return
 * @returns Array of related posts
 */
export async function getRelatedPosts(
  currentPost: Post,
  limit: number = 3
): Promise<Post[]> {
  const allPosts = await getAllPosts()

  // Filter out current post
  const otherPosts = allPosts.filter((post) => post.slug !== currentPost.slug)

  // Calculate relevance score based on shared tags
  const postsWithScores = otherPosts.map((post) => {
    const sharedTags = post.frontmatter.tags.filter((tag) =>
      currentPost.frontmatter.tags.includes(tag)
    )
    return {
      post,
      score: sharedTags.length,
    }
  })

  // Sort by score (highest first) and return top results
  return postsWithScores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post)
}
