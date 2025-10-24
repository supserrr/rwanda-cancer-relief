'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { AuthState, User, SignInCredentials, SignUpCredentials } from '@/lib/auth'
import { useAuth } from '@/hooks/use-auth'

/**
 * Authentication context interface
 */
interface AuthContextType {
  // State
  session: any
  user: any
  userRole: any
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  checkRole: (requiredRole: any) => boolean
  redirectToDashboard: () => void
  redirectToSignIn: () => void
  signOut: () => void
  
  // Role checks
  isPatient: boolean
  isCounselor: boolean
  isAdmin: boolean
}

/**
 * Create authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication provider component
 * 
 * Wraps the app with authentication context and provides
 * authentication state and methods to all child components
 */
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use authentication context
 * 
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Higher-order component for protecting routes
 */
interface WithAuthProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
  requiredRole?: string
}

export function WithAuth({ 
  children, 
  fallback = null, 
  requireAuth = true,
  requiredRole 
}: WithAuthProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>
  }

  // Check role requirement
  if (requiredRole && user?.role !== requiredRole) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Component for conditional rendering based on authentication state
 */
interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
  requireGuest?: boolean
  requiredRole?: string
}

export function AuthGuard({ 
  children, 
  fallback = null, 
  requireAuth = false,
  requireGuest = false,
  requiredRole 
}: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuthContext()

  // Show loading state
  if (isLoading) {
    return null
  }

  // Require authentication
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>
  }

  // Require guest (not authenticated)
  if (requireGuest && isAuthenticated) {
    return <>{fallback}</>
  }

  // Require specific role
  if (requiredRole && user?.role !== requiredRole) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
