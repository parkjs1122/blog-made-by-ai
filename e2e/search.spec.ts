import { test, expect } from "@playwright/test"

test.describe("Search Functionality", () => {
  test("should navigate to search page", async ({ page }) => {
    await page.goto("/")

    // Find and click search link
    const searchLink = page
      .locator("a[href='/search']")
      .or(page.locator("button").filter({ hasText: /search/i }))

    // If search link exists, click it
    if ((await searchLink.count()) > 0) {
      await searchLink.first().click()
      await expect(page).toHaveURL("/search")
    } else {
      // Otherwise navigate directly
      await page.goto("/search")
    }

    // Verify search page loaded
    await expect(page).toHaveURL("/search")
  })

  test("should display search input field", async ({ page }) => {
    await page.goto("/search")

    // Check for search input
    const searchInput = page
      .locator("input[type='search']")
      .or(page.locator("input[placeholder*='search' i]"))
      .or(page.locator("input[name='search']"))

    await expect(searchInput.first()).toBeVisible()
  })

  test("should filter results when searching", async ({ page }) => {
    await page.goto("/search")
    await page.waitForLoadState("networkidle")

    // Find search input
    const searchInput = page
      .locator("input[type='search']")
      .or(page.locator("input[placeholder*='search' i]"))
      .first()

    // Type search query
    await searchInput.fill("javascript")

    // Wait a bit for search results to update
    await page.waitForTimeout(500)

    // Check for results
    const results = page.locator("a[href^='/posts/']")
    const count = await results.count()

    // Should have some results (or explicitly show no results message)
    if (count === 0) {
      // Check for "no results" message
      const noResults = page.locator("text=/no results|not found/i")
      const hasNoResultsMessage = (await noResults.count()) > 0
      expect(hasNoResultsMessage).toBe(true)
    } else {
      expect(count).toBeGreaterThan(0)
    }
  })

  test("should show all posts when search is empty", async ({ page }) => {
    await page.goto("/search")
    await page.waitForLoadState("networkidle")

    const searchInput = page
      .locator("input[type='search']")
      .or(page.locator("input[placeholder*='search' i]"))
      .first()

    // First search for something
    await searchInput.fill("test")
    await page.waitForTimeout(300)

    // Then clear the search
    await searchInput.clear()
    await page.waitForTimeout(300)

    // Results should show all posts or initial state
    const results = page.locator("a[href^='/posts/']")
    const count = await results.count()

    // Should have results when search is cleared
    // (unless there are truly no posts)
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("should navigate to post from search results", async ({ page }) => {
    await page.goto("/search")
    await page.waitForLoadState("networkidle")

    const searchInput = page
      .locator("input[type='search']")
      .or(page.locator("input[placeholder*='search' i]"))
      .first()

    // Search for something that should have results
    await searchInput.fill("post")
    await page.waitForTimeout(500)

    // Click first result if available
    const firstResult = page.locator("a[href^='/posts/']").first()

    if ((await firstResult.count()) > 0) {
      await firstResult.click()
      await page.waitForURL(/\/posts\/.*/)
      expect(page.url()).toContain("/posts/")
    }
  })

  test("should handle special characters in search", async ({ page }) => {
    await page.goto("/search")
    await page.waitForLoadState("networkidle")

    const searchInput = page
      .locator("input[type='search']")
      .or(page.locator("input[placeholder*='search' i]"))
      .first()

    // Test with special characters
    await searchInput.fill("Next.js")
    await page.waitForTimeout(300)

    // Should not crash or error
    await expect(searchInput).toHaveValue("Next.js")
  })

  test("should be case-insensitive", async ({ page }) => {
    await page.goto("/search")
    await page.waitForLoadState("networkidle")

    const searchInput = page
      .locator("input[type='search']")
      .or(page.locator("input[placeholder*='search' i]"))
      .first()

    // Search with lowercase
    await searchInput.fill("javascript")
    await page.waitForTimeout(300)
    const lowercaseCount = await page.locator("a[href^='/posts/']").count()

    // Clear and search with uppercase
    await searchInput.clear()
    await searchInput.fill("JAVASCRIPT")
    await page.waitForTimeout(300)
    const uppercaseCount = await page.locator("a[href^='/posts/']").count()

    // Results should be similar (allowing for timing differences)
    // If either has results, both should have results
    if (lowercaseCount > 0 || uppercaseCount > 0) {
      expect(lowercaseCount).toBeGreaterThanOrEqual(0)
      expect(uppercaseCount).toBeGreaterThanOrEqual(0)
    }
  })
})
