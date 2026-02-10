import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getPostBySlug } from '@/lib/posts'

// Authentication middleware
async function verifyAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false

  const payload = await verifyToken(token)
  return payload?.isAdmin === true
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Check authentication
  const isAuthenticated = await verifyAuth()
  if (!isAuthenticated) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      slug: post.slug,
      content: post.content,
      frontmatter: post.frontmatter,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { message: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}
