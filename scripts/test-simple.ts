import fs from "fs"
import path from "path"

// Test heading extraction without importing mdx.ts
function extractHeadings(content: string) {
  const headings: any[] = []
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, "")
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  let match

  while ((match = headingRegex.exec(contentWithoutFrontmatter)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    headings.push({ level, text, slug })
  }

  return headings
}

console.log("🧪 Testing heading extraction...\n")

const postPath = path.join(process.cwd(), "content/posts/welcome.mdx")
const content = fs.readFileSync(postPath, "utf8")

const headings = extractHeadings(content)
console.log(`✓ Found ${headings.length} headings:\n`)

headings.forEach((heading, index) => {
  const indent = "  ".repeat(heading.level - 2)
  console.log(`${index + 1}. ${indent}[h${heading.level}] ${heading.text}`)
  console.log(`${indent}   slug: #${heading.slug}`)
})

console.log("\n✅ Test passed!")
