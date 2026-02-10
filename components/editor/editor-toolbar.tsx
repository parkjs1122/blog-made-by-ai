"use client"

import * as React from "react"
import {
  Bold,
  Italic,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  List,
  ListOrdered,
  Quote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export interface EditorToolbarProps {
  onInsert: (before: string, after?: string) => void
}

export function EditorToolbar({ onInsert }: EditorToolbarProps) {
  const buttons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => onInsert("**", "**"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => onInsert("*", "*"),
    },
    {
      icon: Heading2,
      label: "Heading",
      action: () => onInsert("## "),
    },
    {
      icon: Code,
      label: "Code",
      action: () => onInsert("`", "`"),
    },
    {
      type: "separator" as const,
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => onInsert("[", "](url)"),
    },
    {
      icon: ImageIcon,
      label: "Image",
      action: () => onInsert("![", "](url)"),
    },
    {
      type: "separator" as const,
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => onInsert("- "),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => onInsert("1. "),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => onInsert("> "),
    },
  ]

  return (
    <div className="flex items-center gap-1 p-2 border rounded-md mb-4 bg-muted/30">
      {buttons.map((button, index) => {
        if (button.type === "separator") {
          return <Separator key={`sep-${index}`} orientation="vertical" className="h-6 mx-1" />
        }

        const Icon = button.icon!
        return (
          <Button
            key={button.label}
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.label}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{button.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
