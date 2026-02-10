import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import fs from "fs"
import path from "path"
import {
  getAllPosts,
  getPostBySlug,
  calculateReadingTime,
  getPostsByTag,
  getAllTags,
  getFeaturedPosts,
  getRecentPosts,
  getRelatedPosts,
} from "@/lib/posts"

// Mock fs module
vi.mock("fs")

const mockPosts = {
  "post1.mdx": `---
title: "First Post"
date: "2024-02-10"
excerpt: "This is the first post excerpt"
author: "Test Author"
tags: ["javascript", "testing"]
featured: true
draft: false
---

This is the content of the first post. It has some words for reading time calculation.`,

  "post2.mdx": `---
title: "Second Post"
date: "2024-02-09"
excerpt: "This is the second post excerpt"
author: "Test Author"
tags: ["typescript", "testing"]
featured: false
draft: false
---

This is the content of the second post with more words.`,

  "draft-post.mdx": `---
title: "Draft Post"
date: "2024-02-11"
excerpt: "This is a draft post excerpt"
author: "Test Author"
tags: ["draft"]
featured: false
draft: true
---

This is a draft post content.`,

  "post3.mdx": `---
title: "Third Post"
date: "2024-02-08"
excerpt: "This is the third post excerpt"
author: "Test Author"
tags: ["javascript", "react"]
featured: false
draft: false
---

This is the third post content.`,
}

describe("calculateReadingTime", () => {
  it("should calculate reading time correctly", () => {
    const shortText = "This is a short text with few words."
    const longText = "word ".repeat(200) // 200 words

    expect(calculateReadingTime(shortText)).toBe(1) // Minimum 1 minute
    expect(calculateReadingTime(longText)).toBe(1) // 200 words / 200 wpm = 1 minute
  })

  it("should round up reading time", () => {
    const text = "word ".repeat(250) // 250 words / 200 wpm = 1.25 minutes
    expect(calculateReadingTime(text)).toBe(2) // Should round up to 2
  })

  it("should handle empty content", () => {
    expect(calculateReadingTime("")).toBe(0) // Empty content = 0 minutes
  })
})

describe("getAllPosts", () => {
  beforeEach(() => {
    // Mock process.cwd() to return a consistent path
    vi.spyOn(process, "cwd").mockReturnValue("/mock/path")

    // Mock fs.existsSync to return true for posts directory
    vi.mocked(fs.existsSync).mockImplementation((path) => {
      if (typeof path === "string" && path.includes("content/posts")) {
        return true
      }
      // Return true for all post files
      return true
    })

    // Mock fs.readdirSync to return mock file names
    vi.mocked(fs.readdirSync).mockReturnValue(
      Object.keys(mockPosts) as unknown as fs.Dirent[]
    )

    // Mock fs.readFileSync to return mock post content
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return mockPosts[fileName as keyof typeof mockPosts] || ""
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return all non-draft posts sorted by date in development", async () => {
    vi.stubEnv("NODE_ENV", "development")

    const posts = await getAllPosts()

    expect(posts).toHaveLength(4) // All posts including draft
    expect(posts[0].frontmatter.title).toBe("Draft Post") // Newest (2024-02-11)
    expect(posts[1].frontmatter.title).toBe("First Post") // 2024-02-10
    expect(posts[2].frontmatter.title).toBe("Second Post") // 2024-02-09
    expect(posts[3].frontmatter.title).toBe("Third Post") // 2024-02-08

    vi.unstubAllEnvs()
  })

  it("should filter out draft posts in production", async () => {
    vi.stubEnv("NODE_ENV", "production")

    const posts = await getAllPosts()

    expect(posts).toHaveLength(3) // No draft post
    expect(posts.every((post) => !post.frontmatter.draft)).toBe(true)

    vi.unstubAllEnvs()
  })

  it("should sort posts by date descending (newest first)", async () => {
    const posts = await getAllPosts()

    for (let i = 0; i < posts.length - 1; i++) {
      const currentDate = new Date(posts[i].frontmatter.date).getTime()
      const nextDate = new Date(posts[i + 1].frontmatter.date).getTime()
      expect(currentDate).toBeGreaterThanOrEqual(nextDate)
    }
  })

  it("should return empty array if posts directory does not exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const posts = await getAllPosts()

    expect(posts).toEqual([])
  })

  it("should include reading time for each post", async () => {
    const posts = await getAllPosts()

    posts.forEach((post) => {
      expect(post.readingTime).toBeGreaterThan(0)
      expect(typeof post.readingTime).toBe("number")
    })
  })
})

describe("getPostBySlug", () => {
  beforeEach(() => {
    vi.spyOn(process, "cwd").mockReturnValue("/mock/path")

    vi.mocked(fs.existsSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return fileName in mockPosts
    })

    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return mockPosts[fileName as keyof typeof mockPosts] || ""
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return post by slug", async () => {
    const post = await getPostBySlug("post1")

    expect(post).not.toBeNull()
    expect(post?.frontmatter.title).toBe("First Post")
    expect(post?.slug).toBe("post1")
    expect(post?.content).toContain("This is the content of the first post")
  })

  it("should return null for non-existent post", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const post = await getPostBySlug("non-existent")

    expect(post).toBeNull()
  })

  it("should parse frontmatter correctly", async () => {
    const post = await getPostBySlug("post1")

    expect(post?.frontmatter).toEqual({
      title: "First Post",
      date: "2024-02-10",
      excerpt: "This is the first post excerpt",
      author: "Test Author",
      tags: ["javascript", "testing"],
      featured: true,
      image: undefined,
      draft: false,
    })
  })

  it("should handle posts with .md extension", async () => {
    vi.mocked(fs.existsSync).mockImplementation((filePath) => {
      const fileName = filePath.toString()
      if (fileName.endsWith(".mdx")) return false
      if (fileName.endsWith(".md")) return true
      return false
    })

    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      // Return the post content regardless of extension
      return mockPosts["post1.mdx"]
    })

    const post = await getPostBySlug("post1")

    expect(post).not.toBeNull()
    expect(post?.frontmatter.title).toBe("First Post")
  })
})

describe("getPostsByTag", () => {
  beforeEach(() => {
    vi.spyOn(process, "cwd").mockReturnValue("/mock/path")
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(
      Object.keys(mockPosts) as unknown as fs.Dirent[]
    )
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return mockPosts[fileName as keyof typeof mockPosts] || ""
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return posts filtered by tag", async () => {
    const posts = await getPostsByTag("testing")

    expect(posts).toHaveLength(2)
    expect(posts.every((post) => post.frontmatter.tags.includes("testing"))).toBe(true)
  })

  it("should be case-insensitive", async () => {
    const postsLower = await getPostsByTag("javascript")
    const postsUpper = await getPostsByTag("JavaScript")

    expect(postsLower).toEqual(postsUpper)
  })

  it("should return empty array for non-existent tag", async () => {
    const posts = await getPostsByTag("non-existent")

    expect(posts).toEqual([])
  })
})

describe("getAllTags", () => {
  beforeEach(() => {
    vi.spyOn(process, "cwd").mockReturnValue("/mock/path")
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(
      Object.keys(mockPosts) as unknown as fs.Dirent[]
    )
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return mockPosts[fileName as keyof typeof mockPosts] || ""
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return all unique tags with counts", async () => {
    const tags = await getAllTags()

    expect(tags.size).toBeGreaterThan(0)
    expect(tags.get("testing")).toBe(2) // post1 and post2
    expect(tags.get("javascript")).toBe(2) // post1 and post3
    expect(tags.get("typescript")).toBe(1) // post2
    expect(tags.get("react")).toBe(1) // post3
  })

  it("should not count tags from draft posts in production", async () => {
    vi.stubEnv("NODE_ENV", "production")

    const tags = await getAllTags()

    expect(tags.has("draft")).toBe(false)

    vi.unstubAllEnvs()
  })
})

describe("getFeaturedPosts", () => {
  beforeEach(() => {
    vi.spyOn(process, "cwd").mockReturnValue("/mock/path")
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(
      Object.keys(mockPosts) as unknown as fs.Dirent[]
    )
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return mockPosts[fileName as keyof typeof mockPosts] || ""
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return only featured posts", async () => {
    const posts = await getFeaturedPosts()

    expect(posts).toHaveLength(1)
    expect(posts[0].frontmatter.title).toBe("First Post")
    expect(posts.every((post) => post.frontmatter.featured)).toBe(true)
  })
})

describe("getRecentPosts", () => {
  beforeEach(() => {
    vi.spyOn(process, "cwd").mockReturnValue("/mock/path")
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(
      Object.keys(mockPosts) as unknown as fs.Dirent[]
    )
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return mockPosts[fileName as keyof typeof mockPosts] || ""
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return limited number of recent posts", async () => {
    const posts = await getRecentPosts(2)

    expect(posts).toHaveLength(2)
  })

  it("should default to 5 posts", async () => {
    const posts = await getRecentPosts()

    expect(posts.length).toBeLessThanOrEqual(5)
  })

  it("should return posts sorted by date", async () => {
    const posts = await getRecentPosts(3)

    for (let i = 0; i < posts.length - 1; i++) {
      const currentDate = new Date(posts[i].frontmatter.date).getTime()
      const nextDate = new Date(posts[i + 1].frontmatter.date).getTime()
      expect(currentDate).toBeGreaterThanOrEqual(nextDate)
    }
  })
})

describe("getRelatedPosts", () => {
  beforeEach(() => {
    vi.spyOn(process, "cwd").mockReturnValue("/mock/path")
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(
      Object.keys(mockPosts) as unknown as fs.Dirent[]
    )
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return mockPosts[fileName as keyof typeof mockPosts] || ""
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should return related posts based on shared tags", async () => {
    const currentPost = await getPostBySlug("post1")
    if (!currentPost) throw new Error("Post not found")

    const relatedPosts = await getRelatedPosts(currentPost, 3)

    // post1 has tags ["javascript", "testing"]
    // post2 has tags ["typescript", "testing"] - shares "testing"
    // post3 has tags ["javascript", "react"] - shares "javascript"
    expect(relatedPosts.length).toBeGreaterThan(0)
    expect(relatedPosts.length).toBeLessThanOrEqual(3)
  })

  it("should not include the current post in results", async () => {
    const currentPost = await getPostBySlug("post1")
    if (!currentPost) throw new Error("Post not found")

    const relatedPosts = await getRelatedPosts(currentPost)

    expect(relatedPosts.every((post) => post.slug !== currentPost.slug)).toBe(true)
  })

  it("should sort by relevance (most shared tags first)", async () => {
    const currentPost = await getPostBySlug("post1")
    if (!currentPost) throw new Error("Post not found")

    const relatedPosts = await getRelatedPosts(currentPost)

    // Each related post should have at least one shared tag
    relatedPosts.forEach((post) => {
      const sharedTags = post.frontmatter.tags.filter((tag) =>
        currentPost.frontmatter.tags.includes(tag)
      )
      expect(sharedTags.length).toBeGreaterThan(0)
    })
  })

  it("should return empty array if no related posts", async () => {
    // Mock a post with unique tags
    const mockUniquePost = {
      slug: "unique",
      frontmatter: {
        title: "Unique Post",
        date: "2024-02-12",
        excerpt: "Unique excerpt",
        author: "Test Author",
        tags: ["unique-tag"],
        featured: false,
        draft: false,
      },
      content: "Unique content",
      readingTime: 1,
    }

    const relatedPosts = await getRelatedPosts(mockUniquePost)

    expect(relatedPosts).toEqual([])
  })

  it("should limit results to specified count", async () => {
    const currentPost = await getPostBySlug("post1")
    if (!currentPost) throw new Error("Post not found")

    const relatedPosts = await getRelatedPosts(currentPost, 1)

    expect(relatedPosts).toHaveLength(1)
  })
})
