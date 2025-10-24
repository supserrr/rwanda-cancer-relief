import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthSession, AuthService, UserRole, ROLES } from '@/lib/auth'

/**
 * Custom hook for authentication and role-based access control
 * 
 * Provides:
 * - Session data
 * - User role checking
 * - Automatic redirects based on role
 * - Loading states
 */
export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState(AuthSession.getUser())
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = AuthSession.isAuthenticated()
  const userRole = AuthSession.getUserRole()

  /**
   * Check if user has required role
   */
  const checkRole = (requiredRole: keyof typeof ROLES) => {
    if (!userRole) return false
    return userRole === ROLES[requiredRole]
  }

  /**
   * Redirect to appropriate dashboard based on role
   */
  const redirectToDashboard = () => {
    if (userRole) {
      const dashboardPath = getDashboardPath(userRole)
      router.push(dashboardPath)
    }
  }

  /**
   * Redirect to sign in page
   */
  const redirectToSignIn = () => {
    router.push('/signin')
  }

  /**
   * Sign out user
   */
  const signOut = async () => {
    setIsLoading(true)
    try {
      await AuthService.signOut()
      setUser(null)
      router.push('/signin')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    session: { user },
    user,
    userRole,
    isLoading,
    isAuthenticated,
    checkRole,
    redirectToDashboard,
    redirectToSignIn,
    signOut,
    // Role-specific checks
    isPatient: checkRole('PATIENT'),
    isCounselor: checkRole('COUNSELOR'),
    isAdmin: checkRole('ADMIN')
  }
}

/**
 * Get the appropriate dashboard path for a user role
 */
function getDashboardPath(userRole: UserRole): string {
  switch (userRole) {
    case ROLES.PATIENT:
      return '/dashboard/patient'
    case ROLES.COUNSELOR:
      return '/dashboard/counselor'
    case ROLES.ADMIN:
      return '/dashboard/admin'
    default:
      return '/'
  }
}

/**
 * Hook for protecting routes based on authentication
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading, redirectToSignIn } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToSignIn()
    }
  }, [isAuthenticated, isLoading, redirectToSignIn])

  return { isAuthenticated, isLoading }
}

/**
 * Hook for protecting routes based on role
 */
export function useRequireRole(requiredRole: keyof typeof ROLES) {
  const { isAuthenticated, isLoading, checkRole, redirectToSignIn } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        redirectToSignIn()
      } else if (!checkRole(requiredRole)) {
        // Redirect to appropriate dashboard if user doesn't have required role
        const { redirectToDashboard } = useAuth()
        redirectToDashboard()
      }
    }
  }, [isAuthenticated, isLoading, checkRole, requiredRole, redirectToSignIn])

  return { isAuthenticated, isLoading, hasRequiredRole: checkRole(requiredRole) }
}