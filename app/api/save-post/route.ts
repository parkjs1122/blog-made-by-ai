import { NextResponse } from "next/server"
import { writeFile, readdir, unlink } from "fs/promises"
import { join } from "path"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import type { PostFrontmatter } from "@/types/post"

// Authentication middleware
async function verifyAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false

  const payload = await verifyToken(token)
  return payload?.isAdmin === true
}

export async function POST(request: Request) {
  // Check authentication
  const isAuthenticated = await verifyAuth()
  if (!isAuthenticated) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { content, frontmatter, originalSlug } = body as {
      content: string
      frontmatter: PostFrontmatter
      originalSlug?: string // If editing existing post
    }

    // Validate required fields
    if (!frontmatter.title || !frontmatter.date || !frontmatter.excerpt) {
      return NextResponse.json(
        { message: "Missing required fields: title, date, or excerpt" },
        { status: 400 }
      )
    }

    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      )
    }

    const postsDir = join(process.cwd(), "content", "posts")

    // If updating existing post, delete the old file
    if (originalSlug) {
      const existingFiles = await readdir(postsDir)
      const oldFile = existingFiles.find(
        file => file === `${originalSlug}.mdx` || file === `${originalSlug}.md`
      )

      if (oldFile) {
        await unlink(join(postsDir, oldFile))
      }
    }

    // Generate filename from title (slugify)
    let slug = frontmatter.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    // Add timestamp for uniqueness (only for new posts)
    if (!originalSlug) {
      const timestamp = Date.now()
      slug = slug ? `${slug}-${timestamp}` : `post-${frontmatter.date}-${timestamp}`
    } else {
      // For editing, use original slug if current slug is empty
      if (!slug) {
        slug = originalSlug
      }
    }

    const filename = `${slug}.mdx`

    // Build frontmatter YAML
    const frontmatterYaml = [
      "---",
      `title: "${frontmatter.title.replace(/"/g, '\\"')}"`,
      `date: "${frontmatter.date}"`,
      `excerpt: "${frontmatter.excerpt.replace(/"/g, '\\"')}"`,
      frontmatter.author ? `author: "${frontmatter.author.replace(/"/g, '\\"')}"` : null,
      `tags: [${frontmatter.tags.map((t) => `"${t}"`).join(", ")}]`,
      frontmatter.featured ? `featured: ${frontmatter.featured}` : null,
      frontmatter.image ? `image: "${frontmatter.image}"` : null,
      frontmatter.draft ? `draft: ${frontmatter.draft}` : null,
      "---",
    ]
      .filter(Boolean)
      .join("\n")

    // Combine frontmatter and content
    const fileContent = `${frontmatterYaml}\n\n${content}\n`

    // Write to file
    const filePath = join(postsDir, filename)
    await writeFile(filePath, fileContent, "utf-8")

    return NextResponse.json(
      {
        message: originalSlug ? 'Post updated successfully' : 'Post saved successfully',
        filename,
        slug,
        path: filePath,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error saving post:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to save post",
      },
      { status: 500 }
    )
  }
}
