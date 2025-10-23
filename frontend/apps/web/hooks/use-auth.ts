'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AuthState, User, SignInCredentials, SignUpCredentials, AuthService, AuthSession, ROLES } from '@/lib/auth'

/**
 * Custom hook for authentication state management
 * 
 * Provides:
 * - Authentication state
 * - Sign in/up/out functions
 * - Role-based access control
 * - Automatic token refresh
 * - Route protection
 */
export function useAuth() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = AuthSession.getToken()
        const user = AuthSession.getUser()
        
        if (token && user) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication',
        })
      }
    }

    initializeAuth()
  }, [])

  // Sign in function
  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const { user, token } = await AuthService.signIn(credentials)
      
      // Store auth data
      AuthSession.setToken(token)
      AuthSession.setUser(user)
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      // Redirect to appropriate dashboard
      const dashboardRoute = user.role === ROLES.COUNSELOR 
        ? '/dashboard/counselor' 
        : '/dashboard/patient'
      router.push(dashboardRoute)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      return { success: false, error: errorMessage }
    }
  }, [router])

  // Sign up function
  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const { user, token } = await AuthService.signUp(credentials)
      
      // Store auth data
      AuthSession.setToken(token)
      AuthSession.setUser(user)
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      // Redirect to onboarding
      router.push('/onboarding/' + user.role)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      return { success: false, error: errorMessage }
    }
  }, [router])

  // Sign out function
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      await AuthService.signOut()
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      
      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if sign out fails on server, clear local state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      router.push('/')
    }
  }, [router])

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const newToken = await AuthService.refreshToken()
      AuthSession.setToken(newToken)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, sign out user
      await signOut()
      return false
    }
  }, [signOut])

  // Check if user has specific role
  const hasRole = useCallback((role: string) => {
    return authState.user?.role === role
  }, [authState.user])

  // Check if user is patient
  const isPatient = useCallback(() => {
    return hasRole(ROLES.PATIENT)
  }, [hasRole])

  // Check if user is counselor
  const isCounselor = useCallback(() => {
    return hasRole(ROLES.COUNSELOR)
  }, [hasRole])

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole(ROLES.ADMIN)
  }, [hasRole])

  // Clear error function
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    signIn,
    signUp,
    signOut,
    refreshToken,
    clearError,
    
    // Role checks
    hasRole,
    isPatient,
    isCounselor,
    isAdmin,
  }
}

/**
 * Hook for protecting routes that require authentication
 */
export function useRequireAuth(redirectTo: string = '/signin') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return { isAuthenticated, isLoading }
}

/**
 * Hook for protecting routes that require specific roles
 */
export function useRequireRole(requiredRole: string, redirectTo: string = '/') {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== requiredRole) {
      router.push(redirectTo)
    }
  }, [user, isAuthenticated, isLoading, requiredRole, router, redirectTo])

  return { user, isAuthenticated, isLoading, hasRequiredRole: user?.role === requiredRole }
}
