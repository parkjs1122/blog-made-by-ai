"use client"

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface PostActionsProps {
  slug: string
}

export function PostActions({ slug }: PostActionsProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isAuthenticated) return null

  const handleEdit = () => {
    router.push(`/editor?slug=${slug}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/delete-post?slug=${slug}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        alert('Post deleted successfully')
        router.push('/')
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Failed to delete post: ${error.message}`)
      }
    } catch (error) {
      alert('An error occurred while deleting the post')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-2 mt-8 pt-8 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
      >
        <Pencil className="h-4 w-4 mr-2" />
        Edit Post
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? 'Deleting...' : 'Delete Post'}
      </Button>
    </div>
  )
}
