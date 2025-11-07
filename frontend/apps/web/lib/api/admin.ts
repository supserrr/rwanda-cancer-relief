/**
 * Admin API service
 * 
 * Handles all admin-related API calls using Supabase
 * Requires admin role
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Admin user interface
 */
export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  role: 'patient' | 'counselor' | 'admin';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

/**
 * Analytics data
 */
export interface Analytics {
  users: {
    total: number;
    patients: number;
    counselors: number;
    admins: number;
    newThisMonth: number;
    activeThisMonth: number;
  };
  sessions: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    thisMonth: number;
  };
  resources: {
    total: number;
    public: number;
    private: number;
    views: number;
    downloads: number;
  };
  chats: {
    total: number;
    active: number;
    messages: number;
    unread: number;
  };
  notifications: {
    total: number;
    unread: number;
    byType: Record<string, number>;
  };
}

/**
 * Update user role input
 */
export interface UpdateUserRoleInput {
  role: 'patient' | 'counselor' | 'admin';
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

/**
 * User query parameters
 */
export interface UserQueryParams {
  role?: 'patient' | 'counselor' | 'admin';
  search?: string;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * List users response
 */
export interface ListUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Admin API service
 */
export class AdminApi {
  /**
   * Get analytics data using Supabase
   */
  static async getAnalytics(params?: AnalyticsQueryParams): Promise<Analytics> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    // Get user counts
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: patients } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient');

    const { count: counselors } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'counselor');

    const { count: admins } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    // Get session counts
    const { count: totalSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    const { count: scheduledSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled');

    const { count: completedSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: cancelledSessions } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled');

    // Get resource counts
    const { count: totalResources } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });

    const { count: publicResources } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true);

    // Get chat counts
    const { count: totalChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true });

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    const { count: unreadMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    // Get notification counts
    const { count: totalNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return {
      users: {
        total: totalUsers || 0,
        patients: patients || 0,
        counselors: counselors || 0,
        admins: admins || 0,
        newThisMonth: 0, // Would need date filtering
        activeThisMonth: 0, // Would need date filtering
      },
      sessions: {
        total: totalSessions || 0,
        scheduled: scheduledSessions || 0,
        completed: completedSessions || 0,
        cancelled: cancelledSessions || 0,
        thisMonth: 0, // Would need date filtering
      },
      resources: {
        total: totalResources || 0,
        public: publicResources || 0,
        private: (totalResources || 0) - (publicResources || 0),
        views: 0, // Would need aggregation
        downloads: 0, // Would need aggregation
      },
      chats: {
        total: totalChats || 0,
        active: totalChats || 0,
        messages: totalMessages || 0,
        unread: unreadMessages || 0,
      },
      notifications: {
        total: totalNotifications || 0,
        unread: unreadNotifications || 0,
        byType: {}, // Would need grouping
      },
    };
  }

  /**
   * Get user by ID using Supabase Edge Function
   * Uses the admin Edge Function with service role key
   */
  static async getUser(userId: string): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.functions.invoke('admin', {
      method: 'POST',
      body: { action: 'getUser', userId },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to get user');
    }

    // The Edge Function returns { success: true, data: { ... } }
    if (!data || !data.success || !data.data) {
      throw new Error(data?.error?.message || 'Failed to get user');
    }

    const user = data.data;
    return {
      id: user.id,
      email: user.email || '',
      fullName: user.fullName || user.full_name,
      role: (user.role as AdminUser['role']) || 'patient',
      isVerified: user.isVerified || user.is_verified || false,
      createdAt: user.createdAt || user.created_at,
      lastLogin: user.lastLogin || user.last_login || undefined,
    };
  }

  /**
   * List users using Supabase Edge Function
   * Uses the admin Edge Function with service role key
   */
  static async listUsers(params?: UserQueryParams): Promise<ListUsersResponse> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.functions.invoke('admin', {
      method: 'POST',
      body: {
        action: 'listUsers',
        limit: params?.limit,
        offset: params?.offset,
        role: params?.role,
        isVerified: params?.isVerified,
        search: params?.search,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to list users');
    }

    // The Edge Function returns { success: true, data: { users: [...], total, count, limit, offset } }
    if (!data || !data.success || !data.data) {
      throw new Error(data?.error?.message || 'Failed to list users');
    }

    const response = data.data;
    return {
      users: (response.users || []).map((u: any) => ({
        id: u.id,
        email: u.email || '',
        fullName: u.fullName || u.full_name,
        role: (u.role as AdminUser['role']) || 'patient',
        isVerified: u.isVerified || u.is_verified || false,
        createdAt: u.createdAt || u.created_at,
        lastLogin: u.lastLogin || u.last_login || undefined,
      })),
      total: response.total || response.count || 0,
      limit: response.limit || params?.limit || 50,
      offset: response.offset || params?.offset || 0,
    };
  }

  /**
   * Update user role using Supabase Edge Function
   * Uses the admin Edge Function with service role key
   */
  static async updateUserRole(
    userId: string,
    data: UpdateUserRoleInput
  ): Promise<AdminUser> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data: result, error } = await supabase.functions.invoke('admin', {
      method: 'POST',
      body: { action: 'updateUserRole', userId, role: data.role },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error || !result) {
      throw new Error(error?.message || result?.error?.message || 'Failed to update user role');
    }

    // The Edge Function returns { success: true, data: { ... } }
    if (!result.success || !result.data) {
      throw new Error(result?.error?.message || 'Failed to update user role');
    }

    const user = result.data;
    return {
      id: user.id,
      email: user.email || '',
      fullName: user.fullName || user.full_name,
      role: (user.role as AdminUser['role']) || 'patient',
      isVerified: user.isVerified || user.is_verified || false,
      createdAt: user.createdAt || user.created_at,
      lastLogin: user.lastLogin || user.last_login || undefined,
    };
  }

  /**
   * Delete user using Supabase Edge Function
   * Uses the admin Edge Function with service role key
   */
  static async deleteUser(userId: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.functions.invoke('admin', {
      method: 'POST',
      body: { action: 'deleteUser', userId },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to delete user');
    }

    // The Edge Function returns { success: true, data: null }
    if (!data || !data.success) {
      throw new Error(data?.error?.message || 'Failed to delete user');
    }
  }
}

