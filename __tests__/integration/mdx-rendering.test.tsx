import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import matter from "gray-matter"

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Custom MDX components (replicated from post-content.tsx for testing)
const MDXComponents = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, alt } = props
    if (!src) return null

    return (
      <span className="block my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ""}
          width={800}
          height={400}
          className="rounded-lg"
          loading="lazy"
        />
      </span>
    )
  },
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const { href, children } = props
    if (!href) return <>{children}</>

    if (href.startsWith("http")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4"
        >
          {children}
        </a>
      )
    }

    return (
      <a href={href} className="text-primary underline underline-offset-4">
        {children}
      </a>
    )
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    return (
      <div className="relative group">
        <pre {...props} className="overflow-x-auto rounded-lg border bg-muted p-4">
          {props.children}
        </pre>
      </div>
    )
  },
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => {
    return (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse" {...props} />
      </div>
    )
  },
}

describe("MDX Rendering Integration", () => {
  const sampleMDX = `---
title: "Sample Post"
date: "2024-02-10"
excerpt: "This is a sample post"
author: "Test Author"
tags: ["test", "mdx"]
featured: true
draft: false
---

# Sample Post

This is a sample MDX post with various elements.

## Links

[Internal Link](/posts/another-post)
[External Link](https://example.com)

## Images

![Sample Image](https://example.com/image.jpg)

## Code

\`\`\`javascript
const hello = "world"
console.log(hello)
\`\`\`

## Table

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`

  describe("MDX Frontmatter Parsing", () => {
    it("should parse frontmatter correctly", () => {
      const { data, content } = matter(sampleMDX)

      expect(data.title).toBe("Sample Post")
      expect(data.date).toBe("2024-02-10")
      expect(data.excerpt).toBe("This is a sample post")
      expect(data.author).toBe("Test Author")
      expect(data.tags).toEqual(["test", "mdx"])
      expect(data.featured).toBe(true)
      expect(data.draft).toBe(false)
    })

    it("should separate content from frontmatter", () => {
      const { content } = matter(sampleMDX)

      expect(content).toContain("# Sample Post")
      expect(content).toContain("This is a sample MDX post")
      expect(content).not.toContain("title:")
      expect(content).not.toContain("excerpt:")
    })

    it("should handle missing frontmatter fields", () => {
      const minimalMDX = `---
title: "Minimal Post"
date: "2024-02-10"
---

Content here.`

      const { data } = matter(minimalMDX)

      expect(data.title).toBe("Minimal Post")
      expect(data.excerpt).toBeUndefined()
      expect(data.tags).toBeUndefined()
    })

    it("should handle MDX without frontmatter", () => {
      const noFrontmatter = "# Just Content\n\nNo frontmatter here."

      const { data, content } = matter(noFrontmatter)

      expect(data).toEqual({})
      expect(content).toContain("# Just Content")
    })
  })

  describe("Custom MDX Components", () => {
    it("should render custom image component", () => {
      const ImageComponent = MDXComponents.img

      render(
        <ImageComponent
          src="https://example.com/image.jpg"
          alt="Test Image"
        />
      )

      const img = screen.getByAltText("Test Image")
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute("src", "https://example.com/image.jpg")
      expect(img).toHaveClass("rounded-lg")
    })

    it("should handle image with no alt text", () => {
      const ImageComponent = MDXComponents.img

      const { container } = render(<ImageComponent src="https://example.com/image.jpg" />)

      const img = container.querySelector("img")
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute("alt", "")
      expect(img).toHaveAttribute("src", "https://example.com/image.jpg")
    })

    it("should return null for image with no src", () => {
      const ImageComponent = MDXComponents.img

      const { container } = render(<ImageComponent alt="No source" />)

      expect(container.firstChild).toBeNull()
    })

    it("should render external links with target blank", () => {
      const LinkComponent = MDXComponents.a

      render(
        <LinkComponent href="https://example.com">External Link</LinkComponent>
      )

      const link = screen.getByText("External Link")
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute("href", "https://example.com")
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })

    it("should render internal links without target blank", () => {
      const LinkComponent = MDXComponents.a

      render(
        <LinkComponent href="/posts/test">Internal Link</LinkComponent>
      )

      const link = screen.getByText("Internal Link")
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute("href", "/posts/test")
      expect(link).not.toHaveAttribute("target")
    })

    it("should handle link with no href", () => {
      const LinkComponent = MDXComponents.a

      render(<LinkComponent>No Link</LinkComponent>)

      const text = screen.getByText("No Link")
      expect(text).toBeInTheDocument()
      expect(text.tagName).not.toBe("A")
    })

    it("should render custom pre component with wrapper", () => {
      const PreComponent = MDXComponents.pre

      render(
        <PreComponent>
          <code>const hello = "world"</code>
        </PreComponent>
      )

      const pre = screen.getByText(/const hello/).parentElement
      expect(pre?.tagName).toBe("PRE")
      expect(pre).toHaveClass("overflow-x-auto", "rounded-lg", "border")

      // Check for wrapper div
      const wrapper = pre?.parentElement
      expect(wrapper?.tagName).toBe("DIV")
      expect(wrapper).toHaveClass("relative", "group")
    })

    it("should render custom table component with wrapper", () => {
      const TableComponent = MDXComponents.table

      render(
        <TableComponent>
          <thead>
            <tr>
              <th>Header</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </TableComponent>
      )

      const table = screen.getByRole("table")
      expect(table).toBeInTheDocument()
      expect(table).toHaveClass("w-full", "border-collapse")

      // Check for wrapper div
      const wrapper = table.parentElement
      expect(wrapper?.tagName).toBe("DIV")
      expect(wrapper).toHaveClass("my-6", "overflow-x-auto")
    })
  })

  describe("MDX Content Structure", () => {
    it("should extract headings from content", () => {
      const { content } = matter(sampleMDX)

      expect(content).toContain("# Sample Post")
      expect(content).toContain("## Links")
      expect(content).toContain("## Images")
      expect(content).toContain("## Code")
      expect(content).toContain("## Table")
    })

    it("should extract links from content", () => {
      const { content } = matter(sampleMDX)

      expect(content).toContain("[Internal Link](/posts/another-post)")
      expect(content).toContain("[External Link](https://example.com)")
    })

    it("should extract images from content", () => {
      const { content } = matter(sampleMDX)

      expect(content).toContain("![Sample Image](https://example.com/image.jpg)")
    })

    it("should extract code blocks from content", () => {
      const { content } = matter(sampleMDX)

      expect(content).toContain("```javascript")
      expect(content).toContain('const hello = "world"')
      expect(content).toContain("console.log(hello)")
    })

    it("should extract tables from content", () => {
      const { content } = matter(sampleMDX)

      expect(content).toContain("| Header 1 | Header 2 |")
      expect(content).toContain("| Cell 1   | Cell 2   |")
    })
  })

  describe("MDX Processing", () => {
    it("should handle different content types", () => {
      const complexMDX = `---
title: "Complex Post"
---

# Heading

Regular paragraph text.

**Bold text** and *italic text*.

- List item 1
- List item 2

> Blockquote text

---

Horizontal rule above.
`

      const { data, content } = matter(complexMDX)

      expect(data.title).toBe("Complex Post")
      expect(content).toContain("# Heading")
      expect(content).toContain("**Bold text**")
      expect(content).toContain("*italic text*")
      expect(content).toContain("- List item")
      expect(content).toContain("> Blockquote")
    })

    it("should preserve special characters", () => {
      const specialMDX = `---
title: "Special Characters"
---

Special characters: < > & " ' \` ~ !
`

      const { content } = matter(specialMDX)

      expect(content).toContain("< > & \" ' ` ~ !")
    })

    it("should handle multiple paragraphs", () => {
      const multiParagraph = `---
title: "Multi Paragraph"
---

First paragraph.

Second paragraph.

Third paragraph.
`

      const { content } = matter(multiParagraph)

      const paragraphs = content.split("\n\n").filter(Boolean)
      expect(paragraphs.length).toBeGreaterThanOrEqual(3)
    })
  })
})
