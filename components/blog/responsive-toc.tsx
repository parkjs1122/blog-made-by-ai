"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableOfContents } from "./table-of-contents"
import { cn } from "@/lib/utils"
import type { Heading } from "@/types/post"

interface ResponsiveTocProps {
  headings: Heading[]
  variant?: "sidebar" | "collapsible"
}

export function ResponsiveToc({ headings, variant = "sidebar" }: ResponsiveTocProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  if (headings.length === 0) {
    return null
  }

  // Sidebar variant for desktop
  if (variant === "sidebar") {
    return <TableOfContents headings={headings} />
  }

  // Collapsible variant for tablet
  return (
    <div className="border rounded-lg">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 h-auto"
      >
        <span className="font-semibold text-sm">Table of Contents</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </Button>
      {isOpen && (
        <div className="p-4 pt-0">
          <TableOfContents headings={headings} />
        </div>
      )}
    </div>
  )
}
