"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { MarkdownEditor } from "@/components/editor/markdown-editor"
import { FrontmatterForm } from "@/components/editor/frontmatter-form"
import { Button } from "@/components/ui/button"
import { Save, Eye } from "lucide-react"
import type { PostFrontmatter } from "@/types/post"

const DRAFT_KEY = "editor-draft"

export default function EditorPage() {
  return (
    <React.Suspense fallback={<div className="container py-10 flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <EditorContent />
    </React.Suspense>
  )
}

function EditorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const editSlug = searchParams.get('slug')

  const [content, setContent] = React.useState("")
  const [frontmatter, setFrontmatter] = React.useState<Partial<PostFrontmatter>>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    excerpt: "",
    tags: [],
    featured: false,
    draft: true,
  })
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoadingPost, setIsLoadingPost] = React.useState(false)

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Load existing post if editing
  React.useEffect(() => {
    if (editSlug && isAuthenticated) {
      loadPost(editSlug)
    } else if (!editSlug) {
      // Load draft from localStorage for new posts
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft)
          setContent(parsed.content || "")
          setFrontmatter(parsed.frontmatter || {
            title: "",
            date: new Date().toISOString().split("T")[0],
            excerpt: "",
            tags: [],
            featured: false,
            draft: true,
          })
        } catch (err) {
          console.error("Failed to load draft:", err)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSlug, isAuthenticated])

  const loadPost = async (slug: string) => {
    setIsLoadingPost(true)
    try {
      const response = await fetch(`/api/post/${slug}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const post = await response.json()
        setContent(post.content)
        setFrontmatter(post.frontmatter)
      } else {
        alert('Failed to load post')
        router.push('/editor')
      }
    } catch (error) {
      console.error('Error loading post:', error)
      alert('Error loading post')
    } finally {
      setIsLoadingPost(false)
    }
  }

  // Auto-save to localStorage (only for new posts)
  React.useEffect(() => {
    if (editSlug) return // Don't auto-save when editing existing post

    const intervalId = setInterval(() => {
      const draft = {
        content,
        frontmatter,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }, 30000)

    return () => clearInterval(intervalId)
  }, [content, frontmatter, editSlug])

  // Save before unload (only for new posts)
  React.useEffect(() => {
    if (editSlug) return

    const handleBeforeUnload = () => {
      const draft = {
        content,
        frontmatter,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [content, frontmatter, editSlug])

  const handleSave = async () => {
    // Validate required fields
    if (!frontmatter.title?.trim()) {
      alert("Please enter a title")
      return
    }
    if (!frontmatter.date) {
      alert("Please select a date")
      return
    }
    if (!frontmatter.excerpt?.trim()) {
      alert("Please enter an excerpt")
      return
    }
    if (!content.trim()) {
      alert("Please enter some content")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/save-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          content,
          frontmatter: {
            ...frontmatter,
            tags: frontmatter.tags || [],
          },
          originalSlug: editSlug, // Pass original slug if editing
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save post")
      }

      const result = await response.json()

      // Clear draft from localStorage on successful save (new posts only)
      if (!editSlug) {
        localStorage.removeItem(DRAFT_KEY)
      }

      // Show success message
      alert(`Post ${editSlug ? 'updated' : 'saved'} successfully: ${result.filename}`)

      // Redirect to the post
      router.push(`/posts/${result.slug}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save post")
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading while checking auth
  if (authLoading || isLoadingPost) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  // Don't render editor if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container py-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {editSlug ? 'Edit Post' : 'Markdown Editor'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {editSlug ? 'Update your blog post' : 'Write and preview your blog posts'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/", "_blank")}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : editSlug ? "Update Post" : "Save Post"}
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="lg:col-span-2 flex flex-col overflow-hidden">
          <MarkdownEditor
            content={content}
            onContentChange={setContent}
            className="flex-1"
          />
        </div>

        <div className="overflow-auto">
          <FrontmatterForm
            frontmatter={frontmatter}
            onFrontmatterChange={setFrontmatter}
          />
        </div>
      </div>
    </div>
  )
}
