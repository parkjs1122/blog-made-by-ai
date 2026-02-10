import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { axe, toHaveNoViolations } from "jest-axe"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { ThemeToggle } from "@/components/theme/theme-toggle"

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations)

describe("WCAG Accessibility Audit", () => {
  describe("Theme Components", () => {
    it("ThemeToggle should have no accessibility violations", async () => {
      const { container } = render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("ThemeProvider should have no accessibility violations", async () => {
      const { container } = render(
        <ThemeProvider>
          <div>
            <h1>Test Heading</h1>
            <p>Test content</p>
            <button>Test Button</button>
          </div>
        </ThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe("Common UI Patterns", () => {
    it("should have accessible headings hierarchy", async () => {
      const { container } = render(
        <div>
          <h1>Main Heading</h1>
          <h2>Subheading</h2>
          <h3>Sub-subheading</h3>
          <p>Content</p>
        </div>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have accessible links", async () => {
      const { container } = render(
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have accessible buttons", async () => {
      const { container } = render(
        <div>
          <button aria-label="Click me">Click</button>
          <button>Submit</button>
          <button disabled>Disabled</button>
        </div>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have accessible forms", async () => {
      const { container } = render(
        <form>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" />

          <button type="submit">Submit</button>
        </form>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have accessible images with alt text", async () => {
      const { container } = render(
        <div>
          <img src="/test.jpg" alt="Test image description" />
          <img src="/decorative.jpg" alt="" role="presentation" />
        </div>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have sufficient color contrast", async () => {
      const { container } = render(
        <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>
          <p>This text has sufficient contrast</p>
        </div>
      )

      const results = await axe(container, {
        rules: {
          "color-contrast": { enabled: true },
        },
      })
      expect(results).toHaveNoViolations()
    })
  })

  describe("Navigation and Landmarks", () => {
    it("should have accessible navigation", async () => {
      const { container } = render(
        <nav aria-label="Main navigation">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
          </ul>
        </nav>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have accessible main content area", async () => {
      const { container } = render(
        <main>
          <h1>Page Title</h1>
          <article>
            <h2>Article Title</h2>
            <p>Article content</p>
          </article>
        </main>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have accessible footer", async () => {
      const { container } = render(
        <footer>
          <p>&copy; 2024 My Blog</p>
          <nav aria-label="Footer navigation">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </nav>
        </footer>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe("Interactive Elements", () => {
    it("should have accessible search input", async () => {
      const { container } = render(
        <div role="search">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Search posts..."
            aria-label="Search posts"
          />
        </div>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have accessible tag badges", async () => {
      const { container } = render(
        <div>
          <a href="/tags/javascript" className="badge">
            JavaScript
          </a>
          <a href="/tags/react" className="badge">
            React
          </a>
        </div>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have accessible post cards", async () => {
      const { container } = render(
        <article>
          <h2>
            <a href="/posts/test-post">Test Post Title</a>
          </h2>
          <p>Post excerpt</p>
          <time dateTime="2024-02-10">February 10, 2024</time>
        </article>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe("ARIA and Semantic HTML", () => {
    it("should use semantic HTML elements", async () => {
      const { container } = render(
        <div>
          <header>
            <h1>Site Title</h1>
          </header>
          <nav>
            <a href="/">Home</a>
          </nav>
          <main>
            <article>Content</article>
          </main>
          <aside>Sidebar</aside>
          <footer>Footer</footer>
        </div>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have proper ARIA labels for icons", async () => {
      const { container } = render(
        <button aria-label="Close dialog">
          <svg aria-hidden="true">
            <path d="M0 0" />
          </svg>
        </button>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("should have accessible skip links", async () => {
      const { container } = render(
        <div>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <main id="main-content">
            <h1>Main Content</h1>
          </main>
        </div>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
