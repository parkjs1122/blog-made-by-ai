import { describe, it, expect, beforeEach } from "vitest"
import { PostSearchEngine, createSearchIndex, highlightMatches } from "@/lib/search"
import type { Post } from "@/types/post"

const mockPosts: Post[] = [
  {
    slug: "javascript-basics",
    frontmatter: {
      title: "JavaScript Basics for Beginners",
      date: "2024-02-10",
      excerpt: "Learn the fundamentals of JavaScript programming",
      author: "Test Author",
      tags: ["javascript", "programming", "tutorial"],
      featured: false,
      draft: false,
    },
    content: "JavaScript is a versatile programming language used for web development. Variables, functions, and objects are core concepts.",
    readingTime: 5,
  },
  {
    slug: "typescript-guide",
    frontmatter: {
      title: "TypeScript Complete Guide",
      date: "2024-02-09",
      excerpt: "A comprehensive guide to TypeScript and type safety",
      author: "Test Author",
      tags: ["typescript", "javascript", "programming"],
      featured: true,
      draft: false,
    },
    content: "TypeScript extends JavaScript with static typing. Interfaces, types, and generics help catch errors early.",
    readingTime: 8,
  },
  {
    slug: "react-hooks",
    frontmatter: {
      title: "React Hooks Tutorial",
      date: "2024-02-08",
      excerpt: "Master React Hooks for modern component development",
      author: "Test Author",
      tags: ["react", "javascript", "hooks"],
      featured: false,
      draft: false,
    },
    content: "React Hooks like useState and useEffect enable functional components with state and lifecycle features.",
    readingTime: 6,
  },
  {
    slug: "nextjs-routing",
    frontmatter: {
      title: "Next.js Routing Explained",
      date: "2024-02-07",
      excerpt: "Understanding file-based routing in Next.js applications",
      author: "Test Author",
      tags: ["nextjs", "react", "routing"],
      featured: false,
      draft: false,
    },
    content: "Next.js uses file-based routing with dynamic routes and catch-all segments for flexible navigation.",
    readingTime: 7,
  },
]

describe("PostSearchEngine", () => {
  let searchEngine: PostSearchEngine

  beforeEach(() => {
    searchEngine = new PostSearchEngine(mockPosts)
  })

  it("should create search engine with posts", () => {
    expect(searchEngine).toBeDefined()
    expect(searchEngine).toBeInstanceOf(PostSearchEngine)
  })

  it("should find posts matching title", () => {
    const results = searchEngine.search("JavaScript")

    expect(results.length).toBeGreaterThan(0)
    const titles = results.map((r) => r.post.frontmatter.title)
    expect(titles).toContain("JavaScript Basics for Beginners")
  })

  it("should find posts matching content", () => {
    const results = searchEngine.search("hooks")

    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.post.slug === "react-hooks")).toBe(true)
  })

  it("should find posts matching excerpt", () => {
    const results = searchEngine.search("type safety")

    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.post.slug === "typescript-guide")).toBe(true)
  })

  it("should find posts matching tags", () => {
    const results = searchEngine.search("routing")

    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.post.slug === "nextjs-routing")).toBe(true)
  })

  it("should return empty array for queries shorter than 2 characters", () => {
    expect(searchEngine.search("j")).toEqual([])
    expect(searchEngine.search("")).toEqual([])
  })

  it("should return empty array for whitespace-only queries", () => {
    expect(searchEngine.search("   ")).toEqual([])
  })

  it("should handle case-insensitive search", () => {
    const resultsLower = searchEngine.search("javascript")
    const resultsUpper = searchEngine.search("JAVASCRIPT")
    const resultsMixed = searchEngine.search("JavaScript")

    expect(resultsLower.length).toBe(resultsUpper.length)
    expect(resultsLower.length).toBe(resultsMixed.length)
  })

  it("should include match information in results", () => {
    const results = searchEngine.search("React")

    expect(results.length).toBeGreaterThan(0)
    const firstResult = results[0]

    expect(firstResult).toHaveProperty("post")
    expect(firstResult).toHaveProperty("matches")
    expect(firstResult).toHaveProperty("score")
  })

  it("should include score in results", () => {
    const results = searchEngine.search("JavaScript")

    results.forEach((result) => {
      expect(typeof result.score).toBe("number")
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(1)
    })
  })

  it("should return results sorted by relevance", () => {
    const results = searchEngine.search("JavaScript")

    // Scores should be in ascending order (lower score = better match in Fuse.js)
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i + 1].score)
    }
  })

  it("should prioritize title matches over content matches", () => {
    const results = searchEngine.search("TypeScript")

    // The post with TypeScript in title should rank higher
    const titleMatchIndex = results.findIndex(
      (r) => r.post.frontmatter.title.includes("TypeScript")
    )
    expect(titleMatchIndex).toBeGreaterThanOrEqual(0)

    // Should be among the top results
    expect(titleMatchIndex).toBeLessThan(3)
  })

  it("should handle partial word matches", () => {
    const results = searchEngine.search("prog")

    expect(results.length).toBeGreaterThan(0)
    expect(
      results.some((r) =>
        r.post.content.toLowerCase().includes("programming") ||
        r.post.frontmatter.tags.includes("programming")
      )
    ).toBe(true)
  })

  it("should limit results to 20", () => {
    // Create search engine with many posts
    const manyPosts = Array.from({ length: 50 }, (_, i) => ({
      slug: `post-${i}`,
      frontmatter: {
        title: `Post ${i} about JavaScript`,
        date: "2024-02-10",
        excerpt: "JavaScript excerpt",
        author: "Test Author",
        tags: ["javascript"],
        featured: false,
        draft: false,
      },
      content: "JavaScript content",
      readingTime: 5,
    }))

    const largeSearchEngine = new PostSearchEngine(manyPosts)
    const results = largeSearchEngine.search("JavaScript")

    expect(results.length).toBeLessThanOrEqual(20)
  })

  it("should handle special characters in search query", () => {
    const results = searchEngine.search("Next.js")

    expect(results.length).toBeGreaterThan(0)
  })

  it("should return no results for non-matching query", () => {
    const results = searchEngine.search("quantum physics")

    expect(results).toEqual([])
  })
})

describe("PostSearchEngine.updateIndex", () => {
  it("should update search index with new posts", () => {
    const searchEngine = new PostSearchEngine([mockPosts[0]])

    // Should not find Next.js post initially
    let results = searchEngine.search("Next.js routing")
    expect(results.length).toBe(0)

    // Update index with all posts
    searchEngine.updateIndex(mockPosts)

    // Should now find Next.js post
    results = searchEngine.search("Next.js routing")
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.post.slug === "nextjs-routing")).toBe(true)
  })

  it("should handle empty posts array", () => {
    const searchEngine = new PostSearchEngine(mockPosts)

    searchEngine.updateIndex([])

    const results = searchEngine.search("JavaScript")
    expect(results).toEqual([])
  })
})

describe("createSearchIndex", () => {
  it("should create a PostSearchEngine instance", () => {
    const searchEngine = createSearchIndex(mockPosts)

    expect(searchEngine).toBeInstanceOf(PostSearchEngine)
  })

  it("should create functional search engine", () => {
    const searchEngine = createSearchIndex(mockPosts)
    const results = searchEngine.search("React")

    expect(results.length).toBeGreaterThan(0)
  })

  it("should handle empty posts array", () => {
    const searchEngine = createSearchIndex([])

    expect(searchEngine).toBeInstanceOf(PostSearchEngine)
    expect(searchEngine.search("test")).toEqual([])
  })
})

describe("highlightMatches", () => {
  it("should wrap matches in <mark> tags", () => {
    const text = "JavaScript is a programming language"
    const result = highlightMatches(text, "JavaScript")

    expect(result).toBe("<mark>JavaScript</mark> is a programming language")
  })

  it("should be case-insensitive", () => {
    const text = "JavaScript is great"
    const result = highlightMatches(text, "javascript")

    expect(result).toContain("<mark>")
    expect(result).toContain("</mark>")
  })

  it("should highlight multiple matches", () => {
    const text = "JavaScript and JavaScript"
    const result = highlightMatches(text, "JavaScript")

    const markCount = (result.match(/<mark>/g) || []).length
    expect(markCount).toBe(2)
  })

  it("should return original text when query is empty", () => {
    const text = "JavaScript is great"
    const result = highlightMatches(text, "")

    expect(result).toBe(text)
  })

  it("should handle partial word matches", () => {
    const text = "JavaScript programming"
    const result = highlightMatches(text, "prog")

    expect(result).toContain("<mark>prog</mark>")
  })

  it("should escape regex special characters", () => {
    const text = "Next.js is awesome"

    // This should not throw an error
    expect(() => {
      highlightMatches(text, "Next.js")
    }).not.toThrow()
  })

  it("should preserve text structure", () => {
    const text = "JavaScript\nTypeScript"
    const result = highlightMatches(text, "Script")

    expect(result).toContain("\n")
  })

  it("should handle no matches", () => {
    const text = "JavaScript is great"
    const result = highlightMatches(text, "Python")

    expect(result).toBe(text)
    expect(result).not.toContain("<mark>")
  })
})
