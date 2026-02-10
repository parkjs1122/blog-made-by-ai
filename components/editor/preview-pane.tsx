"use client"

import * as React from "react"
import { MDXRemote } from "next-mdx-remote"
import { serialize } from "next-mdx-remote/serialize"
import type { MDXRemoteSerializeResult } from "next-mdx-remote"
import { cn } from "@/lib/utils"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

export interface PreviewPaneProps {
  content: string
  className?: string
}

export function PreviewPane({ content, className }: PreviewPaneProps) {
  const [mdxSource, setMdxSource] = React.useState<MDXRemoteSerializeResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function compileContent() {
      if (!content || !content.trim()) {
        setMdxSource(null)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "wrap",
                  properties: {
                    className: ["anchor"],
                  },
                },
              ],
            ],
          },
        })

        if (!cancelled) {
          setMdxSource(result)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to compile markdown")
          setIsLoading(false)
        }
      }
    }

    const timeoutId = setTimeout(compileContent, 300)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [content])

  return (
    <div
      className={cn(
        "flex-1 overflow-auto p-4 rounded-md border bg-background",
        className
      )}
    >
      {isLoading && (
        <p className="text-sm text-muted-foreground">Compiling preview...</p>
      )}

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          <p className="font-semibold">Compilation Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!isLoading && !error && mdxSource && (
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <MDXRemote {...mdxSource} />
        </article>
      )}

      {!isLoading && !error && !mdxSource && (
        <p className="text-sm text-muted-foreground">
          Start typing to see the preview...
        </p>
      )}
    </div>
  )
}
