import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Authentication middleware for protecting routes
 * 
 * This middleware handles:
 * - Route protection based on authentication status
 * - Role-based access control (patient, counselor, admin)
 * - Redirect logic for unauthenticated users
 * - Redirect logic for authenticated users trying to access auth pages
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get authentication status from cookies or headers
  // In a real app, this would check JWT tokens or session data
  const isAuthenticated = request.cookies.get('auth-token')?.value
  const userRole = request.cookies.get('user-role')?.value || 'guest'
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/counselors',
    '/get-help',
    '/api/chat'
  ]
  
  // Auth routes (signin, signup)
  const authRoutes = [
    '/signin',
    '/signup',
    '/signup/patient',
    '/signup/counselor'
  ]
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/onboarding'
  ]
  
  // Admin routes that require admin role
  const adminRoutes = [
    '/admin'
  ]
  
  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Check if current path is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if current path is admin route
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userRole === 'counselor' 
      ? '/dashboard/counselor' 
      : '/dashboard/patient'
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }
  
  // Redirect unauthenticated users from protected routes
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }
  
  // Redirect non-admin users from admin routes
  if (isAdminRoute && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Allow access to public routes and authenticated access to protected routes
  return NextResponse.next()
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
