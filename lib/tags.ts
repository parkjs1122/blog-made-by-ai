import { getAllPosts, getPostsByTag as getPostsByTagFromPosts } from "./posts"

/**
 * Get all unique tags with their post counts
 * @returns Map of tag names to post counts, sorted by count (descending)
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

  // Sort by count (descending) and then alphabetically
  const entries = Array.from(tagCounts.entries())
  const sorted = entries.sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1] // Sort by count descending
    }
    return a[0].localeCompare(b[0]) // Sort alphabetically
  })
  return new Map(sorted)
}

/**
 * Get posts by tag
 * @param tag - The tag to filter by
 */
export async function getPostsByTag(tag: string) {
  return getPostsByTagFromPosts(tag)
}

/**
 * Get all tags as an array
 * @returns Array of tag names sorted by popularity
 */
export async function getTagList(): Promise<string[]> {
  const tags = await getAllTags()
  return Array.from(tags.keys())
}
