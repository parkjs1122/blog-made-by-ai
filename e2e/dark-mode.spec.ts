import { test, expect } from "@playwright/test"

test.describe("Dark Mode", () => {
  test("should have theme toggle button", async ({ page }) => {
    await page.goto("/")

    // Look for theme toggle button
    const themeToggle = page
      .locator("button[aria-label*='theme' i]")
      .or(page.locator("button[aria-label*='dark' i]"))
      .or(page.locator("button[aria-label*='light' i]"))

    await expect(themeToggle.first()).toBeVisible()
  })

  test("should toggle theme when clicking button", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Get initial theme
    const htmlElement = page.locator("html")
    const initialClass = await htmlElement.getAttribute("class")

    // Click theme toggle
    const themeToggle = page
      .locator("button[aria-label*='theme' i]")
      .or(page.locator("button[aria-label*='dark' i]"))
      .or(page.locator("button[aria-label*='light' i]"))

    await themeToggle.first().click()

    // Wait for theme change
    await page.waitForTimeout(500)

    // Check that class changed
    const newClass = await htmlElement.getAttribute("class")

    // Classes should be different (either dark added or removed)
    expect(initialClass).not.toBe(newClass)
  })

  test("should persist theme preference after reload", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Set to dark mode
    const themeToggle = page
      .locator("button[aria-label*='theme' i]")
      .or(page.locator("button[aria-label*='dark' i]"))
      .or(page.locator("button[aria-label*='light' i]"))

    await themeToggle.first().click()
    await page.waitForTimeout(300)

    // Get theme after toggle
    const htmlElement = page.locator("html")
    const themeAfterToggle = await htmlElement.getAttribute("class")

    // Reload page
    await page.reload()
    await page.waitForLoadState("networkidle")

    // Check theme is still the same
    const themeAfterReload = await htmlElement.getAttribute("class")

    // Theme should persist
    expect(themeAfterReload).toBe(themeAfterToggle)
  })

  test("should have localStorage entry for theme", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Toggle theme
    const themeToggle = page
      .locator("button[aria-label*='theme' i]")
      .or(page.locator("button[aria-label*='dark' i]"))
      .or(page.locator("button[aria-label*='light' i]"))

    await themeToggle.first().click()
    await page.waitForTimeout(300)

    // Check localStorage
    const theme = await page.evaluate(() => localStorage.getItem("theme"))

    // Should have theme stored (could be "dark", "light", or system)
    expect(theme).toBeTruthy()
  })

  test("should update theme class on html element", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const htmlElement = page.locator("html")

    // Toggle to dark
    const themeToggle = page
      .locator("button[aria-label*='theme' i]")
      .or(page.locator("button[aria-label*='dark' i]"))
      .or(page.locator("button[aria-label*='light' i]"))

    await themeToggle.first().click()
    await page.waitForTimeout(300)

    const classAfterToggle = await htmlElement.getAttribute("class")

    // Should have either 'dark' or 'light' class
    const hasDarkOrLight =
      classAfterToggle?.includes("dark") || classAfterToggle?.includes("light")
    expect(hasDarkOrLight).toBe(true)
  })

  test("should work across different pages", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Set theme
    const themeToggle = page
      .locator("button[aria-label*='theme' i]")
      .or(page.locator("button[aria-label*='dark' i]"))
      .or(page.locator("button[aria-label*='light' i]"))

    await themeToggle.first().click()
    await page.waitForTimeout(300)

    const htmlElement = page.locator("html")
    const themeOnHome = await htmlElement.getAttribute("class")

    // Navigate to another page
    const searchLink = page.locator("a[href='/search']")
    if ((await searchLink.count()) > 0) {
      await searchLink.first().click()
      await page.waitForURL("/search")
      await page.waitForLoadState("networkidle")

      // Check theme on search page
      const themeOnSearch = await htmlElement.getAttribute("class")

      // Theme should be consistent
      expect(themeOnSearch).toBe(themeOnHome)
    }
  })

  test("should toggle between light and dark correctly", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const htmlElement = page.locator("html")
    const themeToggle = page
      .locator("button[aria-label*='theme' i]")
      .or(page.locator("button[aria-label*='dark' i]"))
      .or(page.locator("button[aria-label*='light' i]"))

    // Toggle multiple times
    for (let i = 0; i < 3; i++) {
      const beforeToggle = await htmlElement.getAttribute("class")
      await themeToggle.first().click()
      await page.waitForTimeout(300)
      const afterToggle = await htmlElement.getAttribute("class")

      // Class should change each time
      expect(beforeToggle).not.toBe(afterToggle)
    }
  })

  test("should have theme icons in toggle button", async ({ page }) => {
    await page.goto("/")

    const themeToggle = page
      .locator("button[aria-label*='theme' i]")
      .or(page.locator("button[aria-label*='dark' i]"))
      .or(page.locator("button[aria-label*='light' i]"))

    // Check for SVG icons inside button
    const icons = themeToggle.first().locator("svg")
    const iconCount = await icons.count()

    // Should have at least one icon (sun or moon)
    expect(iconCount).toBeGreaterThan(0)
  })
})
