import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import fs from "fs"
import path from "path"
import { getAllTags, getPostsByTag, getTagList } from "@/lib/tags"

// Mock fs module
vi.mock("fs")

const mockPosts = {
  "post1.mdx": `---
title: "JavaScript Tutorial"
date: "2024-02-10"
excerpt: "Learn JavaScript"
tags: ["javascript", "programming", "tutorial"]
draft: false
---
Content here.`,

  "post2.mdx": `---
title: "TypeScript Guide"
date: "2024-02-09"
excerpt: "Learn TypeScript"
tags: ["typescript", "programming"]
draft: false
---
Content here.`,

  "post3.mdx": `---
title: "React Basics"
date: "2024-02-08"
excerpt: "Learn React"
tags: ["react", "javascript", "frontend"]
draft: false
---
Content here.`,

  "post4.mdx": `---
title: "Next.js Tutorial"
date: "2024-02-07"
excerpt: "Learn Next.js"
tags: ["nextjs", "react", "javascript"]
draft: false
---
Content here.`,

  "post5.mdx": `---
title: "CSS Tips"
date: "2024-02-06"
excerpt: "Learn CSS"
tags: ["css", "frontend"]
draft: false
---
Content here.`,
}

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

    expect(tags instanceof Map).toBe(true)
    expect(tags.size).toBeGreaterThan(0)

    // javascript appears in post1, post3, post4 = 3 times
    expect(tags.get("javascript")).toBe(3)

    // programming appears in post1, post2 = 2 times
    expect(tags.get("programming")).toBe(2)

    // react appears in post3, post4 = 2 times
    expect(tags.get("react")).toBe(2)

    // frontend appears in post3, post5 = 2 times
    expect(tags.get("frontend")).toBe(2)

    // typescript, nextjs, css appear 1 time each
    expect(tags.get("typescript")).toBe(1)
    expect(tags.get("nextjs")).toBe(1)
    expect(tags.get("css")).toBe(1)

    // tutorial appears 1 time
    expect(tags.get("tutorial")).toBe(1)
  })

  it("should sort tags by count descending", async () => {
    const tags = await getAllTags()
    const entries = Array.from(tags.entries())

    // First entry should be javascript with count 3
    expect(entries[0][0]).toBe("javascript")
    expect(entries[0][1]).toBe(3)

    // Verify descending order
    for (let i = 0; i < entries.length - 1; i++) {
      expect(entries[i][1]).toBeGreaterThanOrEqual(entries[i + 1][1])
    }
  })

  it("should sort alphabetically when counts are equal", async () => {
    const tags = await getAllTags()
    const entries = Array.from(tags.entries())

    // Tags with count 2: frontend, programming, react
    // Should be sorted alphabetically
    const countTwoTags = entries.filter(([, count]) => count === 2)
    expect(countTwoTags.length).toBe(3)

    const tagNames = countTwoTags.map(([tag]) => tag)
    const sortedNames = [...tagNames].sort()
    expect(tagNames).toEqual(sortedNames)
  })

  it("should return empty map when no posts exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const tags = await getAllTags()

    expect(tags instanceof Map).toBe(true)
    expect(tags.size).toBe(0)
  })

  it("should handle posts with no tags", async () => {
    const mockPostsNoTags = {
      "post-no-tags.mdx": `---
title: "No Tags Post"
date: "2024-02-10"
excerpt: "No tags"
tags: []
draft: false
---
Content.`,
    }

    vi.mocked(fs.readdirSync).mockReturnValue(
      Object.keys(mockPostsNoTags) as unknown as fs.Dirent[]
    )

    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return mockPostsNoTags[fileName as keyof typeof mockPostsNoTags] || ""
    })

    const tags = await getAllTags()

    expect(tags.size).toBe(0)
  })

  it("should not count tags from draft posts in production", async () => {
    const mockPostsWithDraft = {
      "published.mdx": `---
title: "Published"
date: "2024-02-10"
excerpt: "Published"
tags: ["published-tag"]
draft: false
---
Content.`,
      "draft.mdx": `---
title: "Draft"
date: "2024-02-10"
excerpt: "Draft"
tags: ["draft-tag"]
draft: true
---
Content.`,
    }

    vi.mocked(fs.readdirSync).mockReturnValue(
      Object.keys(mockPostsWithDraft) as unknown as fs.Dirent[]
    )

    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      const fileName = path.basename(filePath.toString())
      return mockPostsWithDraft[fileName as keyof typeof mockPostsWithDraft] || ""
    })

    vi.stubEnv("NODE_ENV", "production")

    const tags = await getAllTags()

    expect(tags.has("published-tag")).toBe(true)
    expect(tags.has("draft-tag")).toBe(false)

    vi.unstubAllEnvs()
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
    const posts = await getPostsByTag("javascript")

    expect(posts.length).toBe(3) // post1, post3, post4
    expect(posts.every((post) => post.frontmatter.tags.includes("javascript"))).toBe(
      true
    )
  })

  it("should be case-insensitive", async () => {
    const postsLower = await getPostsByTag("javascript")
    const postsUpper = await getPostsByTag("JavaScript")

    expect(postsLower.length).toBe(postsUpper.length)
  })

  it("should return empty array for non-existent tag", async () => {
    const posts = await getPostsByTag("non-existent")

    expect(posts).toEqual([])
  })

  it("should return posts sorted by date descending", async () => {
    const posts = await getPostsByTag("javascript")

    for (let i = 0; i < posts.length - 1; i++) {
      const currentDate = new Date(posts[i].frontmatter.date).getTime()
      const nextDate = new Date(posts[i + 1].frontmatter.date).getTime()
      expect(currentDate).toBeGreaterThanOrEqual(nextDate)
    }
  })

  it("should filter posts with multiple matching tags correctly", async () => {
    const posts = await getPostsByTag("react")

    expect(posts.length).toBe(2) // post3, post4
    const titles = posts.map((p) => p.frontmatter.title)
    expect(titles).toContain("React Basics")
    expect(titles).toContain("Next.js Tutorial")
  })
})

describe("getTagList", () => {
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

  it("should return array of tag names", async () => {
    const tagList = await getTagList()

    expect(Array.isArray(tagList)).toBe(true)
    expect(tagList.length).toBeGreaterThan(0)
  })

  it("should return tags sorted by popularity", async () => {
    const tagList = await getTagList()

    // First tag should be javascript (appears 3 times)
    expect(tagList[0]).toBe("javascript")
  })

  it("should contain all unique tags", async () => {
    const tagList = await getTagList()

    expect(tagList).toContain("javascript")
    expect(tagList).toContain("programming")
    expect(tagList).toContain("react")
    expect(tagList).toContain("typescript")
    expect(tagList).toContain("nextjs")
    expect(tagList).toContain("frontend")
    expect(tagList).toContain("css")
    expect(tagList).toContain("tutorial")
  })

  it("should return empty array when no posts exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const tagList = await getTagList()

    expect(tagList).toEqual([])
  })

  it("should preserve order from getAllTags", async () => {
    const tags = await getAllTags()
    const tagList = await getTagList()

    const tagsArray = Array.from(tags.keys())
    expect(tagList).toEqual(tagsArray)
  })
})
