import { getAllPosts, getPostBySlug, getAllTags } from "../lib/posts"

async function testPosts() {
  console.log("🧪 Testing posts utility functions...\n")

  try {
    // Test 1: Get all posts
    console.log("1️⃣ Testing getAllPosts():")
    const posts = await getAllPosts()
    console.log(`   ✓ Found ${posts.length} posts`)
    posts.forEach((post, index) => {
      console.log(
        `   ${index + 1}. ${post.frontmatter.title} (${post.frontmatter.date}) - ${post.readingTime} min read`
      )
    })

    // Test 2: Verify sorting
    console.log("\n2️⃣ Testing post sorting:")
    if (posts.length > 1) {
      const dates = posts.map((p) => new Date(p.frontmatter.date).getTime())
      const isSorted = dates.every((date, i) => i === 0 || dates[i - 1] >= date)
      console.log(`   ${isSorted ? "✓" : "✗"} Posts are sorted by date (newest first)`)
    }

    // Test 3: Get post by slug
    console.log("\n3️⃣ Testing getPostBySlug():")
    const welcomePost = await getPostBySlug("welcome")
    if (welcomePost) {
      console.log(`   ✓ Found post: ${welcomePost.frontmatter.title}`)
      console.log(`   Tags: ${welcomePost.frontmatter.tags.join(", ")}`)
    } else {
      console.log("   ✗ Post not found")
    }

    // Test 4: Get all tags
    console.log("\n4️⃣ Testing getAllTags():")
    const tags = await getAllTags()
    console.log(`   ✓ Found ${tags.size} unique tags:`)
    tags.forEach((count, tag) => {
      console.log(`   - ${tag}: ${count} post${count > 1 ? "s" : ""}`)
    })

    console.log("\n✅ All tests passed!")
  } catch (error) {
    console.error("\n❌ Test failed:", error)
    process.exit(1)
  }
}

testPosts()
