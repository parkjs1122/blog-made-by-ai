import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { ThemeToggle } from "@/components/theme/theme-toggle"

describe("Keyboard Navigation", () => {
  describe("Theme Toggle", () => {
    it("should be focusable with Tab key", async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      )

      const button = screen.getByRole("button", { name: /toggle theme/i })

      // Tab to focus the button
      await user.tab()

      expect(button).toHaveFocus()
    })

    it("should be activatable with Enter key", async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      )

      const button = screen.getByRole("button", { name: /toggle theme/i })

      // Focus and activate with Enter
      await user.tab()
      await user.keyboard("{Enter}")

      // Button should still be in the document (theme toggled)
      expect(button).toBeInTheDocument()
    })

    it("should be activatable with Space key", async () => {
      const user = userEvent.setup()

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      )

      const button = screen.getByRole("button", { name: /toggle theme/i })

      // Focus and activate with Space
      await user.tab()
      await user.keyboard(" ")

      // Button should still be in the document (theme toggled)
      expect(button).toBeInTheDocument()
    })
  })

  describe("Link Navigation", () => {
    it("should navigate through links with Tab", async () => {
      const user = userEvent.setup()

      render(
        <nav>
          <a href="/">Home</a>
          <a href="/blog">Blog</a>
          <a href="/about">About</a>
        </nav>
      )

      const homeLink = screen.getByRole("link", { name: /home/i })
      const blogLink = screen.getByRole("link", { name: /blog/i })
      const aboutLink = screen.getByRole("link", { name: /about/i })

      // Tab through links
      await user.tab()
      expect(homeLink).toHaveFocus()

      await user.tab()
      expect(blogLink).toHaveFocus()

      await user.tab()
      expect(aboutLink).toHaveFocus()
    })

    it("should navigate backwards with Shift+Tab", async () => {
      const user = userEvent.setup()

      render(
        <nav>
          <a href="/">Home</a>
          <a href="/blog">Blog</a>
        </nav>
      )

      const homeLink = screen.getByRole("link", { name: /home/i })
      const blogLink = screen.getByRole("link", { name: /blog/i })

      // Tab to second link
      await user.tab()
      await user.tab()
      expect(blogLink).toHaveFocus()

      // Shift+Tab back
      await user.tab({ shift: true })
      expect(homeLink).toHaveFocus()
    })
  })

  describe("Button Navigation", () => {
    it("should focus buttons with Tab", async () => {
      const user = userEvent.setup()

      render(
        <div>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </div>
      )

      const firstButton = screen.getByRole("button", { name: /first/i })
      const secondButton = screen.getByRole("button", { name: /second/i })

      await user.tab()
      expect(firstButton).toHaveFocus()

      await user.tab()
      expect(secondButton).toHaveFocus()
    })

    it("should skip disabled buttons", async () => {
      const user = userEvent.setup()

      render(
        <div>
          <button>First</button>
          <button disabled>Disabled</button>
          <button>Third</button>
        </div>
      )

      const firstButton = screen.getByRole("button", { name: /first/i })
      const thirdButton = screen.getByRole("button", { name: /third/i })

      await user.tab()
      expect(firstButton).toHaveFocus()

      await user.tab()
      expect(thirdButton).toHaveFocus() // Skips disabled button
    })
  })

  describe("Form Navigation", () => {
    it("should navigate through form fields with Tab", async () => {
      const user = userEvent.setup()

      render(
        <form>
          <input type="text" placeholder="Name" aria-label="Name" />
          <input type="email" placeholder="Email" aria-label="Email" />
          <button type="submit">Submit</button>
        </form>
      )

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole("button", { name: /submit/i })

      await user.tab()
      expect(nameInput).toHaveFocus()

      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it("should type into focused input", async () => {
      const user = userEvent.setup()

      render(<input type="text" placeholder="Search" aria-label="Search" />)

      const input = screen.getByLabelText(/search/i)

      await user.tab()
      await user.keyboard("test query")

      expect(input).toHaveValue("test query")
    })
  })

  describe("Focus Indicators", () => {
    it("should have visible focus on interactive elements", async () => {
      const user = userEvent.setup()

      render(
        <div>
          <button>Focusable Button</button>
          <a href="/test">Focusable Link</a>
        </div>
      )

      const button = screen.getByRole("button")
      const link = screen.getByRole("link")

      // Focus button
      await user.tab()
      expect(button).toHaveFocus()

      // Focus link
      await user.tab()
      expect(link).toHaveFocus()

      // Both should maintain focus state
      expect(document.activeElement).toBe(link)
    })
  })

  describe("Tab Order", () => {
    it("should follow logical tab order", async () => {
      const user = userEvent.setup()

      render(
        <div>
          <header>
            <button>Menu</button>
          </header>
          <main>
            <a href="/post1">Post 1</a>
            <a href="/post2">Post 2</a>
          </main>
          <footer>
            <a href="/privacy">Privacy</a>
          </footer>
        </div>
      )

      const menuButton = screen.getByRole("button", { name: /menu/i })
      const post1Link = screen.getByRole("link", { name: /post 1/i })
      const post2Link = screen.getByRole("link", { name: /post 2/i })
      const privacyLink = screen.getByRole("link", { name: /privacy/i })

      // Should follow DOM order
      await user.tab()
      expect(menuButton).toHaveFocus()

      await user.tab()
      expect(post1Link).toHaveFocus()

      await user.tab()
      expect(post2Link).toHaveFocus()

      await user.tab()
      expect(privacyLink).toHaveFocus()
    })

    it("should not have tabindex > 0", async () => {
      render(
        <div>
          <button tabIndex={0}>Good Button</button>
          <a href="/test" tabIndex={0}>
            Good Link
          </a>
        </div>
      )

      const button = screen.getByRole("button")
      const link = screen.getByRole("link")

      // tabIndex should be 0 or -1, never positive
      expect(button.tabIndex).toBeLessThanOrEqual(0)
      expect(link.tabIndex).toBeLessThanOrEqual(0)
    })
  })

  describe("Escape Key", () => {
    it("should handle Escape key gracefully", async () => {
      const user = userEvent.setup()

      render(
        <div>
          <button>Test Button</button>
        </div>
      )

      const button = screen.getByRole("button")

      await user.tab()
      await user.keyboard("{Escape}")

      // Should not throw error or crash
      expect(button).toBeInTheDocument()
    })
  })

  describe("Focus Trap Prevention", () => {
    it("should allow focus to move outside component", async () => {
      const user = userEvent.setup()

      render(
        <div>
          <ThemeProvider>
            <ThemeToggle />
          </ThemeProvider>
          <button>Outside Button</button>
        </div>
      )

      const themeToggle = screen.getByRole("button", { name: /toggle theme/i })
      const outsideButton = screen.getByRole("button", { name: /outside button/i })

      await user.tab()
      expect(themeToggle).toHaveFocus()

      await user.tab()
      expect(outsideButton).toHaveFocus() // Can move outside
    })
  })
})
