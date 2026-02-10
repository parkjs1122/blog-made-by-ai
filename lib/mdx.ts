import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeShiki from "@shikijs/rehype"
import type { MDXComponents } from "mdx/types"
import { Heading, PostFrontmatter, MDXCompileResult } from "@/types/post"

/**
 * Compile MDX content with plugins and custom components
 * @param source - The MDX source string
 * @param components - Optional custom MDX components
 * @returns Compiled MDX result with content, frontmatter, and headings
 */
export async function compileMDXContent(
  source: string,
  components?: MDXComponents
): Promise<MDXCompileResult> {
  try {
    const { content, frontmatter } = await compileMDX<PostFrontmatter>({
      source,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [
            // GitHub Flavored Markdown support
            remarkGfm,
          ],
          rehypePlugins: [
            // Add IDs to headings
            rehypeSlug,
            // Add anchor links to headings
            [
              rehypeAutolinkHeadings,
              {
                behavior: "wrap",
                properties: {
                  className: ["anchor"],
                },
              },
            ],
            // Syntax highlighting with Shiki
            [
              rehypeShiki,
              {
                themes: {
                  light: "github-light",
                  dark: "github-dark",
                },
              },
            ],
          ],
        },
      },
      components: components || {},
    })

    // Extract headings from source for TOC
    const headings = extractHeadings(source)

    return {
      content,
      frontmatter: frontmatter as PostFrontmatter,
      headings,
    }
  } catch (error) {
    console.error("Error compiling MDX:", error)
    throw error
  }
}

/**
 * Extract headings from markdown content for table of contents
 * @param content - The markdown content
 * @returns Array of headings with level, text, and slug
 */
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []

  // Remove frontmatter
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, "")

  // Match markdown headings (## or ###)
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  let match

  while ((match = headingRegex.exec(contentWithoutFrontmatter)) !== null) {
    const level = match[1].length
    const text = match[2].trim()

    // Generate slug from heading text
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    headings.push({
      level,
      text,
      slug,
    })
  }

  return headings
}

/**
 * Generate a table of contents HTML from headings
 * @param headings - Array of headings
 * @returns HTML string for TOC
 */
export function generateTableOfContents(headings: Heading[]): string {
  if (headings.length === 0) {
    return ""
  }

  let tocHTML = '<nav class="table-of-contents">\n<ul>\n'

  headings.forEach((heading) => {
    const indent = "  ".repeat(heading.level - 2)
    tocHTML += `${indent}<li><a href="#${heading.slug}">${heading.text}</a></li>\n`
  })

  tocHTML += "</ul>\n</nav>"

  return tocHTML
}

/**
 * Get a preview/excerpt from markdown content
 * @param content - The markdown content
 * @param maxLength - Maximum length of the excerpt
 * @returns Excerpt string
 */
export function getExcerpt(content: string, maxLength: number = 160): string {
  // Remove frontmatter
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, "")

  // Remove markdown syntax
  const plainText = contentWithoutFrontmatter
    .replace(/#{1,6}\s+/g, "") // Remove headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
    .replace(/`(.+?)`/g, "$1") // Remove inline code
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .trim()

  // Truncate to maxLength
  if (plainText.length <= maxLength) {
    return plainText
  }

  return plainText.slice(0, maxLength).trim() + "..."
}

/**
 * Count words in markdown content
 * @param content - The markdown content
 * @returns Word count
 */
export function countWords(content: string): number {
  // Remove frontmatter and markdown syntax
  const plainText = content
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .trim()

  return plainText.split(/\s+/).length
}

/**
 * Validate MDX frontmatter
 * @param frontmatter - The frontmatter object
 * @returns Whether the frontmatter is valid
 */
export function validateFrontmatter(frontmatter: unknown): frontmatter is PostFrontmatter {
  return (
    typeof frontmatter === "object" &&
    frontmatter !== null &&
    "title" in frontmatter &&
    "date" in frontmatter &&
    "excerpt" in frontmatter &&
    "tags" in frontmatter &&
    typeof (frontmatter as Record<string, unknown>).title === "string" &&
    typeof (frontmatter as Record<string, unknown>).date === "string" &&
    typeof (frontmatter as Record<string, unknown>).excerpt === "string" &&
    Array.isArray((frontmatter as Record<string, unknown>).tags)
  )
}
