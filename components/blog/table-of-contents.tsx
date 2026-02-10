"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { Heading } from "@/types/post"

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("")

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "0% 0% -80% 0%" }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="space-y-2">
      <p className="font-semibold text-sm mb-4">On This Page</p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => {
          const isActive = activeId === heading.slug
          const indent = heading.level === 3 ? "ml-4" : ""

          return (
            <li key={heading.slug} className={indent}>
              <a
                href={`#${heading.slug}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(heading.slug)?.scrollIntoView({
                    behavior: "smooth",
                  })
                }}
                className={cn(
                  "block py-1 transition-colors hover:text-foreground",
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
