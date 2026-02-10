import { NextResponse } from 'next/server'
import { unlink, readdir } from 'fs/promises'
import { join } from 'path'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

// Authentication middleware
async function verifyAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false

  const payload = await verifyToken(token)
  return payload?.isAdmin === true
}

export async function DELETE(request: Request) {
  // Check authentication
  const isAuthenticated = await verifyAuth()
  if (!isAuthenticated) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug is required' },
        { status: 400 }
      )
    }

    const postsDir = join(process.cwd(), 'content', 'posts')

    // Find the file (could be .mdx or .md)
    const files = await readdir(postsDir)
    const targetFile = files.find(
      file => file === `${slug}.mdx` || file === `${slug}.md`
    )

    if (!targetFile) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      )
    }

    const filePath = join(postsDir, targetFile)
    await unlink(filePath)

    return NextResponse.json(
      { message: 'Post deleted successfully', slug },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to delete post',
      },
      { status: 500 }
    )
  }
}
