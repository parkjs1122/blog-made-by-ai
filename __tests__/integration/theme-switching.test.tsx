import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { ThemeToggle } from "@/components/theme/theme-toggle"

describe("Theme Switching Integration", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset document classes
    document.documentElement.className = ""
  })

  it("should render ThemeToggle within ThemeProvider", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole("button", { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it("should render theme icons", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole("button", { name: /toggle theme/i })

    // Both sun and moon icons should be present (CSS controls visibility)
    const icons = button.querySelectorAll("svg")
    expect(icons.length).toBeGreaterThanOrEqual(2)
  })

  it("should have accessible label", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole("button", { name: /toggle theme/i })
    expect(button).toHaveAttribute("aria-label", "Toggle theme")
  })

  it("should have screen reader text", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const srText = screen.getByText(/toggle theme/i)
    expect(srText).toHaveClass("sr-only")
  })

  it("should be clickable", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole("button", { name: /toggle theme/i })

    // Should not throw error when clicked
    expect(() => {
      fireEvent.click(button)
    }).not.toThrow()
  })

  it("should integrate with ThemeProvider", () => {
    const { container } = render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <ThemeToggle />
        <div data-testid="content">Test Content</div>
      </ThemeProvider>
    )

    // Verify ThemeToggle is rendered inside ThemeProvider
    expect(container.querySelector("button")).toBeInTheDocument()
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("should render with different theme provider settings", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole("button", { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it("should work with multiple instances", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
        <ThemeToggle />
      </ThemeProvider>
    )

    const buttons = screen.getAllByRole("button", { name: /toggle theme/i })
    expect(buttons).toHaveLength(2)
  })

  it("should have correct button variant", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole("button", { name: /toggle theme/i })

    // Button should have ghost variant classes
    expect(button.className).toContain("hover:bg-accent")
    expect(button.className).toContain("hover:text-accent-foreground")
  })

  it("should have icon size classes", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole("button", { name: /toggle theme/i })
    const icons = button.querySelectorAll("svg")

    icons.forEach((icon) => {
      const classValue = icon.getAttribute("class") || ""
      expect(classValue).toContain("h-5")
      expect(classValue).toContain("w-5")
    })
  })
})
