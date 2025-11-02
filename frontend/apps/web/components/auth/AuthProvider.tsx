'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService, AuthSession, User, UserRole, getDashboardRoute, ROLES } from '@/lib/auth';

/**
 * Authentication context interface with complete API
 */
interface AuthContextType {
  // State
  session: { user: User | null };
  user: User | null;
  userRole: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => void;
  checkRole: (requiredRole: keyof typeof ROLES) => boolean;
  redirectToDashboard: () => void;
  redirectToSignIn: () => void;
  
  // Role checks
  isPatient: boolean;
  isCounselor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Main authentication provider component
 * 
 * Provides authentication state and methods to all child components.
 * Handles automatic route protection and redirects.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;
  const userRole = user?.role || 'guest';

  /**
   * Check authentication status from storage
   */
  const checkAuth = () => {
    const token = AuthSession.getToken();
    const userData = AuthSession.getUser();
    
    if (token && userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  /**
   * Check if user has required role
   */
  const checkRole = (requiredRole: keyof typeof ROLES): boolean => {
    if (!userRole) return false;
    return userRole === ROLES[requiredRole];
  };

  /**
   * Redirect to appropriate dashboard based on role
   */
  const redirectToDashboard = () => {
    if (userRole && userRole !== 'guest') {
      const dashboardRoute = getDashboardRoute(userRole);
      router.push(dashboardRoute);
    }
  };

  /**
   * Redirect to sign in page
   */
  const redirectToSignIn = () => {
    router.push('/signin');
  };

  /**
   * Sign in user with credentials
   */
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await AuthService.signIn({ email, password, rememberMe: false });
      
      // Store auth data
      AuthSession.setToken(result.token);
      AuthSession.setUser(result.user);
      
      setUser(result.user);
      
      // Redirect to appropriate dashboard
      const dashboardRoute = getDashboardRoute(result.user.role);
      router.push(dashboardRoute);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup');
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isPublicRoute = ['/', '/about', '/contact', '/counselors', '/get-help'].includes(pathname);

    if (!isAuthenticated) {
      // Redirect unauthenticated users from protected routes
      if (isDashboardRoute) {
        router.push('/signin');
      }
    } else {
      // Redirect authenticated users away from auth pages
      if (isAuthRoute) {
        const dashboardRoute = getDashboardRoute(user!.role);
        router.push(dashboardRoute);
      }
    }
  }, [isAuthenticated, isLoading, pathname, user, router]);

  const value: AuthContextType = {
    session: { user },
    user,
    userRole,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    checkAuth,
    checkRole,
    redirectToDashboard,
    redirectToSignIn,
    isPatient: checkRole('PATIENT'),
    isCounselor: checkRole('COUNSELOR'),
    isAdmin: checkRole('ADMIN'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 * 
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
