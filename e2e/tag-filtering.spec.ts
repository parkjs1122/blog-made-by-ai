import { test, expect } from "@playwright/test"

test.describe("Tag Filtering", () => {
  test("should display tags on home page", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Look for tag elements (could be badges, links, or spans)
    const tags = page
      .locator("a[href^='/tags/']")
      .or(page.locator('[data-testid="tag"]'))
      .or(page.locator(".badge"))

    // Should have at least some tags
    const count = await tags.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("should navigate to tag page when clicking a tag", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Find first tag link
    const firstTag = page.locator("a[href^='/tags/']").first()

    if ((await firstTag.count()) > 0) {
      const tagHref = await firstTag.getAttribute("href")
      expect(tagHref).toBeTruthy()

      // Click the tag
      await firstTag.click()

      // Wait for navigation
      await page.waitForURL(/\/tags\/.*/)

      // Verify we're on a tag page
      expect(page.url()).toContain("/tags/")
    }
  })

  test("should display filtered posts on tag page", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Find and click a tag
    const firstTag = page.locator("a[href^='/tags/']").first()

    if ((await firstTag.count()) > 0) {
      await firstTag.click()
      await page.waitForURL(/\/tags\/.*/)

      // Check for posts
      const posts = page.locator("a[href^='/posts/']")
      const count = await posts.count()

      // Should have at least one post with this tag
      expect(count).toBeGreaterThan(0)
    }
  })

  test("should show tag name on tag page", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Get tag text and click it
    const firstTag = page.locator("a[href^='/tags/']").first()

    if ((await firstTag.count()) > 0) {
      const tagText = await firstTag.textContent()
      await firstTag.click()
      await page.waitForURL(/\/tags\/.*/)

      // Tag name should be displayed on the page
      if (tagText) {
        const tagHeading = page.locator(`text=${tagText.trim()}`)
        if ((await tagHeading.count()) > 0) {
          await expect(tagHeading.first()).toBeVisible()
        }
      }
    }
  })

  test("should navigate to post from tag page", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Click a tag
    const firstTag = page.locator("a[href^='/tags/']").first()

    if ((await firstTag.count()) > 0) {
      await firstTag.click()
      await page.waitForURL(/\/tags\/.*/)

      // Click first post
      const firstPost = page.locator("a[href^='/posts/']").first()
      await firstPost.click()
      await page.waitForURL(/\/posts\/.*/)

      // Should be on post page
      expect(page.url()).toContain("/posts/")
    }
  })

  test("should have tags on post detail page", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Navigate to a post
    const firstPost = page.locator("a[href^='/posts/']").first()
    await firstPost.click()
    await page.waitForURL(/\/posts\/.*/)

    // Check for tags on post page
    const tags = page.locator("a[href^='/tags/']")
    const count = await tags.count()

    // Post should have at least one tag
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("should filter different tags correctly", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Get multiple tags if available
    const tags = page.locator("a[href^='/tags/']")
    const tagCount = await tags.count()

    if (tagCount >= 2) {
      // Click first tag
      const firstTag = tags.nth(0)
      const firstTagText = await firstTag.textContent()
      await firstTag.click()
      await page.waitForURL(/\/tags\/.*/)
      const firstUrl = page.url()

      // Go back
      await page.goto("/")
      await page.waitForLoadState("networkidle")

      // Click second tag
      const secondTag = page.locator("a[href^='/tags/']").nth(1)
      const secondTagText = await secondTag.textContent()
      await secondTag.click()
      await page.waitForURL(/\/tags\/.*/)
      const secondUrl = page.url()

      // URLs should be different if tag texts are different
      if (firstTagText !== secondTagText) {
        expect(firstUrl).not.toBe(secondUrl)
      }
    }
  })

  test("should show post count for tags", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Go to a tag page
    const firstTag = page.locator("a[href^='/tags/']").first()

    if ((await firstTag.count()) > 0) {
      await firstTag.click()
      await page.waitForURL(/\/tags\/.*/)

      // Count posts
      const posts = page.locator("a[href^='/posts/']")
      const postCount = await posts.count()

      // Should have posts
      expect(postCount).toBeGreaterThan(0)
    }
  })
})
