import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Protected routes that require authentication
const protectedRoutes = ['/editor', '/api/save-post', '/api/delete-post', '/api/post']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    // Redirect to login for page routes, return 401 for API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token
  const payload = await verifyToken(token)

  if (!payload || !payload.isAdmin) {
    // Invalid token - redirect or return error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/editor/:path*', '/api/save-post/:path*', '/api/delete-post/:path*', '/api/post/:path*']
}
