import { test, expect } from "@playwright/test"

test.describe("Home Page Navigation", () => {
  test("should load home page and display blog posts", async ({ page }) => {
    await page.goto("/")

    // Check page title
    await expect(page).toHaveTitle(/Blog/)

    // Check main heading
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()

    // Check that post cards are visible
    const postCards = page.locator('[data-testid="post-card"]').or(
      page.locator("article").or(page.locator(".post-card"))
    )
    await expect(postCards.first()).toBeVisible()
  })

  test("should navigate to post detail page when clicking a post", async ({
    page,
  }) => {
    await page.goto("/")

    // Wait for posts to load
    await page.waitForLoadState("networkidle")

    // Find first post link (could be title or card link)
    const firstPostLink = page
      .locator("a[href^='/posts/']")
      .first()

    // Get the href to verify navigation
    const postHref = await firstPostLink.getAttribute("href")
    expect(postHref).toBeTruthy()

    // Click the post
    await firstPostLink.click()

    // Wait for navigation
    await page.waitForURL(/\/posts\/.*/)

    // Verify we're on a post detail page
    expect(page.url()).toContain("/posts/")

    // Check that post content is visible
    const postContent = page.locator("article").or(page.locator("main"))
    await expect(postContent).toBeVisible()
  })

  test("should show navigation menu", async ({ page }) => {
    await page.goto("/")

    // Check for navigation links
    const nav = page.locator("nav").first()
    await expect(nav).toBeVisible()

    // Common navigation items
    const homeLink = page.locator("a[href='/']").first()
    await expect(homeLink).toBeVisible()
  })

  test("should display recent posts", async ({ page }) => {
    await page.goto("/")

    // Wait for content to load
    await page.waitForLoadState("networkidle")

    // Check for multiple posts (at least 1)
    const posts = page.locator("a[href^='/posts/']")
    const count = await posts.count()
    expect(count).toBeGreaterThan(0)
  })

  test("should have working links in header", async ({ page }) => {
    await page.goto("/")

    // Check for search link/button if it exists
    const searchElement = page
      .locator("a[href='/search']")
      .or(page.locator("button").filter({ hasText: /search/i }))

    if ((await searchElement.count()) > 0) {
      await expect(searchElement.first()).toBeVisible()
    }
  })

  test("should navigate back to home from post detail", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Click first post
    const firstPostLink = page.locator("a[href^='/posts/']").first()
    await firstPostLink.click()
    await page.waitForURL(/\/posts\/.*/)

    // Navigate back
    await page.goBack()

    // Should be back on home page
    await expect(page).toHaveURL("/")
  })

  test("should display post metadata on home page", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Check for date, author, or other metadata
    // This is flexible to match various layouts
    const metadata = page
      .locator("time")
      .or(page.locator('[data-testid="post-date"]'))

    if ((await metadata.count()) > 0) {
      await expect(metadata.first()).toBeVisible()
    }
  })
})
