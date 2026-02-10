"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { EditorToolbar } from "./editor-toolbar"
import { PreviewPane } from "./preview-pane"

export interface MarkdownEditorProps {
  content: string
  onContentChange: (content: string) => void
  className?: string
}

export function MarkdownEditor({
  content,
  onContentChange,
  className,
}: MarkdownEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleInsertText = React.useCallback(
    (before: string, after: string = "") => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = content.substring(start, end)
      const newText =
        content.substring(0, start) +
        before +
        selectedText +
        after +
        content.substring(end)

      onContentChange(newText)

      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + before.length + selectedText.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    },
    [content, onContentChange]
  )

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <EditorToolbar onInsert={handleInsertText} />

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Editor Pane */}
        <div className="flex-1 flex flex-col">
          <div className="text-sm font-medium mb-2 text-muted-foreground">
            Editor
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className={cn(
              "flex-1 w-full p-4 rounded-md border bg-background",
              "font-mono text-sm resize-none",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "placeholder:text-muted-foreground"
            )}
            placeholder="Write your post content in Markdown..."
            spellCheck={false}
          />
        </div>

        {/* Preview Pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="text-sm font-medium mb-2 text-muted-foreground">
            Preview
          </div>
          <PreviewPane content={content} />
        </div>
      </div>
    </div>
  )
}
