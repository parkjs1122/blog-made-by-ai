import Fuse from "fuse.js"
import type { Post, SearchResult } from "@/types/post"

export class PostSearchEngine {
  private fuse: Fuse<Post>

  constructor(posts: Post[]) {
    this.fuse = new Fuse(posts, {
      keys: [
        { name: "frontmatter.title", weight: 0.5 },
        { name: "frontmatter.excerpt", weight: 0.3 },
        { name: "content", weight: 0.2 },
        { name: "frontmatter.tags", weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    })
  }

  search(query: string): SearchResult[] {
    if (!query || query.trim().length < 2) {
      return []
    }

    const results = this.fuse.search(query, { limit: 20 })

    return results.map((result) => ({
      post: result.item,
      matches: (result.matches || []).map((match) => ({
        key: match.key || "",
        value: match.value || "",
        indices: (match.indices || []).map(([start, end]) => [start, end] as [number, number]),
      })),
      score: result.score || 0,
    }))
  }

  updateIndex(posts: Post[]): void {
    this.fuse.setCollection(posts)
  }
}

export function createSearchIndex(posts: Post[]): PostSearchEngine {
  return new PostSearchEngine(posts)
}

/**
 * Highlight search matches in text
 * @param text - The text to highlight
 * @param query - The search query
 * @returns Text with HTML marks around matches
 */
export function highlightMatches(text: string, query: string): string {
  if (!query) return text

  const regex = new RegExp(`(${query})`, "gi")
  return text.replace(regex, "<mark>$1</mark>")
}
