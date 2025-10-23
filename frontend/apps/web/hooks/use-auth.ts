import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getDashboardPath, hasRole, USER_ROLES } from '@/lib/auth'

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
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user
  const userRole = session?.user?.role

  /**
   * Check if user has required role
   */
  const checkRole = (requiredRole: keyof typeof USER_ROLES) => {
    if (!userRole) return false
    return hasRole(userRole, USER_ROLES[requiredRole])
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
  const signOut = () => {
    router.push('/signin')
  }

  return {
    session,
    user: session?.user,
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
export function useRequireRole(requiredRole: keyof typeof USER_ROLES) {
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