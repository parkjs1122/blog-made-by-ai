import { getPostBySlug } from "../lib/posts"
import { compileMDXContent, extractHeadings } from "../lib/mdx"

async function testMDX() {
  console.log("🧪 Testing MDX compilation...\n")

  try {
    // Get a sample post
    const post = await getPostBySlug("welcome")
    if (!post) {
      console.error("❌ Sample post not found")
      return
    }

    console.log(`📄 Testing post: ${post.frontmatter.title}`)

    // Test heading extraction
    console.log("\n1️⃣ Testing heading extraction:")
    const headings = extractHeadings(post.content)
    console.log(`   ✓ Found ${headings.length} headings:`)
    headings.forEach((heading) => {
      const indent = "  ".repeat(heading.level - 2)
      console.log(`   ${indent}- [h${heading.level}] ${heading.text} (#${heading.slug})`)
    })

    // Test MDX compilation
    console.log("\n2️⃣ Testing MDX compilation:")
    const compiled = await compileMDXContent(post.content)
    console.log(`   ✓ Compiled successfully`)
    console.log(`   ✓ Frontmatter: ${compiled.frontmatter.title}`)
    console.log(`   ✓ Headings: ${compiled.headings.length}`)
    console.log(`   ✓ Content type: ${typeof compiled.content}`)

    console.log("\n✅ All MDX tests passed!")
  } catch (error) {
    console.error("\n❌ Test failed:", error)
    process.exit(1)
  }
}

testMDX()
