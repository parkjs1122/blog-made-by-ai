"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { PostFrontmatter } from "@/types/post"

export interface FrontmatterFormProps {
  frontmatter: Partial<PostFrontmatter>
  onFrontmatterChange: (frontmatter: Partial<PostFrontmatter>) => void
}

export function FrontmatterForm({
  frontmatter,
  onFrontmatterChange,
}: FrontmatterFormProps) {
  const [tagInput, setTagInput] = React.useState("")

  const handleChange = (field: keyof PostFrontmatter, value: string | boolean | string[]) => {
    onFrontmatterChange({
      ...frontmatter,
      [field]: value,
    })
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      const currentTags = frontmatter.tags || []
      if (!currentTags.includes(tagInput.trim())) {
        handleChange("tags", [...currentTags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = frontmatter.tags || []
    handleChange(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    )
  }

  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/30">
      <h3 className="font-semibold text-lg">Post Metadata</h3>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={frontmatter.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Post title"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={frontmatter.date || ""}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={frontmatter.author || ""}
            onChange={(e) => handleChange("author", e.target.value)}
            placeholder="Author name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Input
          id="excerpt"
          value={frontmatter.excerpt || ""}
          onChange={(e) => handleChange("excerpt", e.target.value)}
          placeholder="Brief description of the post"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Featured Image URL</Label>
        <Input
          id="image"
          value={frontmatter.image || ""}
          onChange={(e) => handleChange("image", e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">
          Tags (press Enter to add)
        </Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add a tag..."
        />
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {frontmatter.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          checked={frontmatter.featured || false}
          onChange={(e) => handleChange("featured", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="featured" className="cursor-pointer">
          Featured post
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="draft"
          checked={frontmatter.draft || false}
          onChange={(e) => handleChange("draft", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="draft" className="cursor-pointer">
          Save as draft
        </Label>
      </div>
    </div>
  )
}
