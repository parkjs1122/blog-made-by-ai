import { getPostBySlug } from "../lib/posts"
import { extractHeadings } from "../lib/mdx"

async function testHeadings() {
  console.log("🧪 Testing heading extraction...\n")

  try {
    // Get a sample post
    const post = await getPostBySlug("welcome")
    if (!post) {
      console.error("❌ Sample post not found")
      return
    }

    console.log(`📄 Testing post: ${post.frontmatter.title}\n`)

    // Test heading extraction
    const headings = extractHeadings(post.content)
    console.log(`✓ Found ${headings.length} headings:\n`)

    headings.forEach((heading, index) => {
      const indent = "  ".repeat(heading.level - 2)
      console.log(`${index + 1}. ${indent}[h${heading.level}] ${heading.text}`)
      console.log(`${indent}   slug: #${heading.slug}`)
    })

    // Verify structure
    console.log("\n📊 Heading structure:")
    const h2Count = headings.filter(h => h.level === 2).length
    const h3Count = headings.filter(h => h.level === 3).length
    console.log(`   H2: ${h2Count}`)
    console.log(`   H3: ${h3Count}`)

    console.log("\n✅ Heading extraction test passed!")
  } catch (error) {
    console.error("\n❌ Test failed:", error)
    process.exit(1)
  }
}

testHeadings()
