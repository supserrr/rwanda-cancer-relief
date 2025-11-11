'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { 
  Search, 
  Plus, 
  Trash2, 
  Eye,
  Filter,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  AdminApi,
  type AdminUser,
  type UserSummary,
} from '../../../../lib/api/admin';
import { createClient as createSupabaseClient } from '../../../../lib/supabase/client';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';

const firstDefined = <T,>(...values: Array<T | null | undefined>): T | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'patient' | 'counselor' | 'admin' | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useRef(false);
  const realtimeRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabaseUrlRef = useRef<string | undefined>(undefined);
  if (supabaseUrlRef.current === undefined) {
    const fromEnv =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      (typeof window !== 'undefined' ? window.process?.env?.NEXT_PUBLIC_SUPABASE_URL : undefined);
    supabaseUrlRef.current = fromEnv ? fromEnv.replace(/\/+$/, '') : undefined;
  }

  const toAbsoluteAvatarSrc = useCallback((value: string | undefined): string | undefined => {
    if (!value) {
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
      return trimmed;
    }

    const supabaseUrl = supabaseUrlRef.current;
    if (!supabaseUrl) {
      return trimmed;
    }

    const normalizedPath = trimmed.replace(/^\/+/, '');
    if (normalizedPath.startsWith('storage/v1/object/public/')) {
      return `${supabaseUrl}/${normalizedPath}`;
    }

    return `${supabaseUrl}/storage/v1/object/public/${normalizedPath}`;
  }, []);

  const resolveAvatarUrl = useCallback(
    (user?: AdminUser | null) => {
      if (!user) {
        return undefined;
      }

      let candidate = user.avatarUrl;

      const metadataAvatarUrl =
        user.metadata && typeof user.metadata['avatar_url'] === 'string'
          ? (user.metadata['avatar_url'] as string)
          : user.metadata && typeof user.metadata['avatarUrl'] === 'string'
            ? (user.metadata['avatarUrl'] as string)
            : undefined;

      const metadataAvatar =
        user.metadata && typeof user.metadata['avatar'] === 'string'
          ? (user.metadata['avatar'] as string)
          : undefined;

      const metadataProfileAvatar =
        user.metadata && typeof user.metadata['profile'] === 'object' && user.metadata['profile'] !== null
          ? (() => {
              const profileRecord = user.metadata!['profile'] as Record<string, unknown>;
              if (typeof profileRecord['avatarUrl'] === 'string') {
                return profileRecord['avatarUrl'] as string;
              }
              if (typeof profileRecord['avatar_url'] === 'string') {
                return profileRecord['avatar_url'] as string;
              }
              return undefined;
            })()
          : undefined;

      if (!candidate) {
        candidate = metadataAvatarUrl || metadataAvatar || metadataProfileAvatar || undefined;
      }

      return toAbsoluteAvatarSrc(candidate);
    },
    [toAbsoluteAvatarSrc],
  );

  const coerceStringValue = useCallback((value: unknown): string | undefined => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    return undefined;
  }, []);

  const coerceStringArrayValue = useCallback(
    (value: unknown): string[] | undefined => {
      if (!value) {
        return undefined;
      }
      if (Array.isArray(value)) {
        const normalized = value
          .map((item) => {
            if (typeof item === 'string') {
              return item.trim();
            }
            if (item && typeof item === 'object') {
              const record = item as Record<string, unknown>;
              return coerceStringValue(
                record.label ?? record.name ?? record.value ?? record.title ?? record.text,
              );
            }
            return undefined;
          })
          .filter((item): item is string => Boolean(item));
        if (normalized.length === 0) {
          return undefined;
        }
        const seen = new Set<string>();
        const result: string[] = [];
        normalized.forEach((entry) => {
          const trimmed = entry.trim();
          if (trimmed.length > 0 && !seen.has(trimmed)) {
            seen.add(trimmed);
            result.push(trimmed);
          }
        });
        return result.length > 0 ? result : undefined;
      }
      const single = coerceStringValue(value);
      return single ? [single] : undefined;
    },
    [coerceStringValue],
  );

  const coerceBooleanValue = useCallback((value: unknown): boolean | undefined => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no', 'n', 'off'].includes(normalized)) {
        return false;
      }
      return undefined;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (value === 1) {
        return true;
      }
      if (value === 0) {
        return false;
      }
      return undefined;
    }
    return undefined;
  }, []);

  const getRecordString = useCallback(
    (record: Record<string, unknown> | undefined, ...keys: string[]): string | undefined => {
      if (!record) {
        return undefined;
      }
      for (const key of keys) {
        const value = coerceStringValue(record[key]);
        if (value) {
          return value;
        }
      }
      return undefined;
    },
    [coerceStringValue],
  );

  const getRecordStringArray = useCallback(
    (record: Record<string, unknown> | undefined, ...keys: string[]): string[] | undefined => {
      if (!record) {
        return undefined;
      }
      for (const key of keys) {
        const value = coerceStringArrayValue(record[key]);
        if (value && value.length > 0) {
          return value;
        }
      }
      return undefined;
    },
    [coerceStringArrayValue],
  );

  const getRecordBoolean = useCallback(
    (record: Record<string, unknown> | undefined, ...keys: string[]): boolean | undefined => {
      if (!record) {
        return undefined;
      }
      for (const key of keys) {
        const value = coerceBooleanValue(record[key]);
        if (value !== undefined) {
          return value;
        }
      }
      return undefined;
    },
    [coerceBooleanValue],
  );

  const getMetadataString = useCallback(
    (user: AdminUser | null | undefined, ...keys: string[]): string | undefined => {
      return getRecordString(user?.metadata as Record<string, unknown> | undefined, ...keys);
    },
    [getRecordString],
  );

  const getMetadataStringArray = useCallback(
    (user: AdminUser | null | undefined, ...keys: string[]): string[] | undefined => {
      return getRecordStringArray(user?.metadata as Record<string, unknown> | undefined, ...keys);
    },
    [getRecordStringArray],
  );

  const getMetadataBoolean = useCallback(
    (user: AdminUser | null | undefined, ...keys: string[]): boolean | undefined => {
      return getRecordBoolean(user?.metadata as Record<string, unknown> | undefined, ...keys);
    },
    [getRecordBoolean],
  );

  const mergeStringArrays = useCallback(
    (...values: Array<unknown>): string[] => {
      const seen = new Set<string>();
      const result: string[] = [];
      values.forEach((value) => {
        const arr = coerceStringArrayValue(value);
        if (arr) {
          arr.forEach((entry) => {
            const trimmed = entry.trim();
            if (trimmed.length > 0 && !seen.has(trimmed)) {
              seen.add(trimmed);
              result.push(trimmed);
            }
          });
        }
      });
      return result;
    },
    [coerceStringArrayValue],
  );

  const renderBadgeList = useCallback(
    (values?: string[] | null) => {
      const normalized = coerceStringArrayValue(values);
      if (!normalized || normalized.length === 0) {
        return <p className="text-xs text-muted-foreground">Not provided</p>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {normalized.map((value) => (
            <Badge key={value} variant="secondary" className="text-xs">
              {value}
            </Badge>
          ))}
        </div>
      );
    },
    [coerceStringArrayValue],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadDashboardData = useCallback(
    async (options?: { showLoading?: boolean }) => {
      const showLoading = options?.showLoading ?? false;

      if (showLoading && isMountedRef.current) {
        setLoading(true);
        setSummaryLoading(true);
      }

      try {
        const [summaryResponse, response] = await Promise.all([
          AdminApi.getUserSummary(),
          AdminApi.listUsers(),
        ]);

        if (!isMountedRef.current) {
          return;
        }

        const derived = response.users.reduce(
          (acc, user) => {
            acc.total += 1;
            if (user.role === 'patient') {
              acc.patients += 1;
            } else if (user.role === 'counselor') {
              acc.counselors += 1;
            } else if (user.role === 'admin') {
              acc.admins += 1;
            }
            if (user.isVerified) {
              acc.verified += 1;
            }
            return acc;
          },
          { total: 0, patients: 0, counselors: 0, admins: 0, verified: 0 },
        );
        const derivedUnverified = Math.max(0, derived.total - derived.verified);

        const mergedSummary: UserSummary = {
          totals: {
            total: Math.max(summaryResponse?.totals.total ?? 0, derived.total),
            patients: Math.max(summaryResponse?.totals.patients ?? 0, derived.patients),
            counselors: Math.max(summaryResponse?.totals.counselors ?? 0, derived.counselors),
            admins: Math.max(summaryResponse?.totals.admins ?? 0, derived.admins),
            newThisMonth: summaryResponse?.totals.newThisMonth ?? 0,
            activeLast30Days: summaryResponse?.totals.activeLast30Days ?? 0,
          },
          verification: {
            verified: Math.max(summaryResponse?.verification.verified ?? 0, derived.verified),
            unverified: Math.max(summaryResponse?.verification.unverified ?? 0, derivedUnverified),
          },
        };

        setSummary(mergedSummary);
        setUsers(response.users);
      } catch (error) {
        if (isMountedRef.current) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
        }
      } finally {
        if (showLoading && isMountedRef.current) {
        setLoading(false);
        setSummaryLoading(false);
      }
      }
    },
    [],
  );

  // Load all users
  useEffect(() => {
    void loadDashboardData({ showLoading: true });
  }, [loadDashboardData]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client was not created; real-time updates disabled.');
      return;
    }

    const scheduleRefresh = () => {
      if (realtimeRefreshTimeoutRef.current) {
        clearTimeout(realtimeRefreshTimeoutRef.current);
      }
      realtimeRefreshTimeoutRef.current = setTimeout(() => {
        realtimeRefreshTimeoutRef.current = null;
        void loadDashboardData();
      }, 250);
    };

    const channel = supabase
      .channel('admin-users-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        scheduleRefresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'counselor_profiles' },
        scheduleRefresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_metrics_overview' },
        scheduleRefresh,
      );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        scheduleRefresh();
      }
    });

    return () => {
      if (realtimeRefreshTimeoutRef.current) {
        clearTimeout(realtimeRefreshTimeoutRef.current);
        realtimeRefreshTimeoutRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [loadDashboardData]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.fullName || user.email || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && isUserActive(user)) ||
        (selectedStatus === 'inactive' && !isUserActive(user));

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const handleViewUser = (userId: string) => {
    const baseUser = users.find((user) => user.id === userId);
    if (!baseUser) {
      toast.error('Unable to locate user details.');
      return;
    }
    setSelectedUser(baseUser);
    setViewModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this account? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await AdminApi.deleteUser(userId);
      setUsers((previous) => previous.filter((user) => user.id !== userId));
      void loadDashboardData();
      toast.success('User deleted successfully.');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddUser = () => {
    console.log('Add new user');
  };

  const getRoleColor = (role: 'patient' | 'counselor' | 'admin') => {
    switch (role) {
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      case 'counselor':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (user: AdminUser) => {
    return isUserActive(user)
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (user: AdminUser) => {
    return isUserActive(user) ? 'Active' : 'Inactive';
  };

  const totalUsers = summary?.totals.total ?? users.length;
  const verifiedCount = summary?.verification.verified ?? 0;
  const unverifiedCount = summary?.verification.unverified ?? 0;

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="User Management"
        description="Manage all users, patients, counselors, and administrators"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.totals.total ?? users.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patients</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.totals.patients ?? 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Counselors</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.totals.counselors ?? 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.totals.admins ?? 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-600" />
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.verification.verified ?? 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-primary" />
          </div>
        </AnimatedCard>
        <AnimatedCard delay={0.5}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unverified</p>
              <p className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.verification.unverified ?? 0}
              </p>
            </div>
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
        </AnimatedCard>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10"
          />
        </div>
        
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'patient' | 'counselor' | 'admin' | 'all')}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="patient">Patients</SelectItem>
            <SelectItem value="counselor">Counselors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as 'all' | 'active' | 'inactive')}>
          <SelectTrigger className="w-full sm:w-48 bg-primary/5 border-primary/20 focus:border-primary/40 focus:bg-primary/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner variant="bars" size={36} className="text-primary" />
        </div>
      ) : (
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                let avatarSrc = resolveAvatarUrl(user);
                const displayName = user.fullName || user.email || 'User';
                const initials = displayName
                  .split(' ')
                  .map((segment) => segment.trim().charAt(0))
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                <TableRow key={`${user.id}-${user.role}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {avatarSrc ? (
                          <AvatarImage src={avatarSrc} alt={displayName} />
                        ) : null}
                        <AvatarFallback>
                          {initials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user)}>
                      {getStatusText(user)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : 'No activity'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewUser(user.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </AnimatedCard>
      )}

      {/* Results Summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {totalUsers} users
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            Bulk Actions
          </Button>
          <Button size="sm" onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
      <DialogContent className="max-w-3xl sm:max-w-4xl max-h-[90vh] overflow-hidden px-4 sm:px-6">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>Review account metadata and recent activity.</DialogDescription>
          </DialogHeader>
        <div className="mt-4">
          {selectedUser ? (
            (() => {
              const viewAvatarSrc = resolveAvatarUrl(selectedUser);
              const counselorProfile = selectedUser.counselorProfile;
              const counselorMetadata = counselorProfile?.metadata as Record<string, unknown> | undefined;
              const metadataItems = [
                ...Object.entries(selectedUser.metadata ?? {}).map(([key, rawValue]) => ({
                  key,
                  value: formatMetadataValue(rawValue),
                })),
                ...(counselorMetadata
                  ? Object.entries(counselorMetadata).map(([key, rawValue]) => ({
                      key: `counselor.${key}`,
                      value: formatMetadataValue(rawValue),
                    }))
                  : []),
              ].filter((entry) => entry.value.length > 0);
              const documents = selectedUser.documents ?? [];
              const phoneValue = firstDefined(
                coerceStringValue(selectedUser.phoneNumber),
                getRecordString(counselorMetadata, 'contactPhone', 'phoneNumber', 'phone'),
                getMetadataString(selectedUser, 'phoneNumber', 'phone_number', 'contactPhone', 'contact_phone', 'phone'),
              );
              const practiceValue = firstDefined(
                coerceStringValue(selectedUser.practiceName),
                coerceStringValue(counselorProfile?.practiceName),
                getRecordString(counselorMetadata, 'practiceName', 'practice_name'),
                getMetadataString(selectedUser, 'practiceName', 'practice_name'),
              );
              const locationValue = firstDefined(
                coerceStringValue(selectedUser.location),
                coerceStringValue(selectedUser.practiceLocation),
                coerceStringValue(counselorProfile?.practiceLocation),
                getRecordString(counselorMetadata, 'practiceLocation', 'location', 'city', 'region', 'country'),
                getMetadataString(selectedUser, 'location', 'practiceLocation', 'practice_location', 'city', 'region', 'country'),
              );
              const locationLabel = coerceStringValue(locationValue ?? practiceValue) ?? 'Not provided';
              const availabilityValue = firstDefined(
                coerceStringValue(selectedUser.availabilityStatus),
                coerceStringValue(selectedUser.availability),
                coerceStringValue(counselorProfile?.availabilityStatus),
                getRecordString(counselorMetadata, 'availabilityStatus', 'availability'),
                getMetadataString(selectedUser, 'availabilityStatus', 'availability_status', 'availability'),
              );
              const acceptingNewPatientsValue = firstDefined(
                coerceBooleanValue(selectedUser.acceptingNewPatients),
                coerceBooleanValue(counselorProfile?.acceptingNewPatients),
                getRecordBoolean(counselorMetadata, 'acceptingNewPatients', 'accepting_new_patients'),
                getMetadataBoolean(selectedUser, 'acceptingNewPatients', 'accepting_new_patients'),
              );
              const telehealthValue = firstDefined(
                coerceBooleanValue(selectedUser.telehealthOffered),
                coerceBooleanValue(counselorProfile?.telehealthOffered),
                getRecordBoolean(counselorMetadata, 'telehealthOffered', 'telehealth'),
                getMetadataBoolean(selectedUser, 'telehealthOffered', 'telehealth_offered', 'telehealth'),
              );
              const languages = mergeStringArrays(
                selectedUser.languages,
                counselorProfile?.languages,
                getRecordStringArray(counselorMetadata, 'languages', 'languagePreferences', 'language_preferences'),
                getMetadataStringArray(selectedUser, 'languages', 'languagePreferences', 'language_preferences'),
                getMetadataString(selectedUser, 'preferredLanguage', 'language', 'preferred_language'),
              );
              const serviceRegions = mergeStringArrays(
                selectedUser.serviceRegions,
                counselorProfile?.serviceRegions,
                getRecordStringArray(counselorMetadata, 'serviceRegions', 'service_regions'),
                getMetadataStringArray(selectedUser, 'serviceRegions', 'service_regions'),
              );
              const supportedTimezones = mergeStringArrays(
                selectedUser.supportedTimezones,
                counselorProfile?.supportedTimezones,
                getRecordStringArray(counselorMetadata, 'supportedTimezones', 'supported_timezones'),
                getMetadataStringArray(selectedUser, 'supportedTimezones', 'supported_timezones'),
                getMetadataString(selectedUser, 'timezone'),
              );
              const sessionModalities = mergeStringArrays(
                selectedUser.sessionModalities,
                counselorProfile?.sessionModalities,
                getRecordStringArray(counselorMetadata, 'sessionModalities', 'session_modalities'),
                getMetadataStringArray(selectedUser, 'sessionModalities', 'session_modalities'),
              );
              const specializations = mergeStringArrays(
                selectedUser.specializations,
                counselorProfile?.specializations,
                getRecordStringArray(counselorMetadata, 'specializations'),
                getMetadataStringArray(selectedUser, 'specializations'),
              );
              const consultationTypes = mergeStringArrays(
                selectedUser.consultationTypes,
                getRecordStringArray(counselorMetadata, 'consultationTypes', 'consultation_types'),
                getMetadataStringArray(selectedUser, 'consultationTypes', 'consultation_types'),
              );
              const professionalHighlights = mergeStringArrays(
                selectedUser.professionalHighlights,
                counselorProfile?.professionalHighlights,
                getRecordStringArray(counselorMetadata, 'professionalHighlights', 'professional_highlights'),
                getMetadataStringArray(selectedUser, 'professionalHighlights', 'professional_highlights'),
              );
              const bioValue = firstDefined(
                coerceStringValue(selectedUser.bio),
                getRecordString(counselorMetadata, 'bio'),
                getMetadataString(selectedUser, 'bio'),
              );
              const approachValue = firstDefined(
                coerceStringValue(selectedUser.approachSummary),
                getRecordString(counselorMetadata, 'approachSummary', 'approach_summary'),
                getMetadataString(selectedUser, 'approachSummary', 'approach_summary'),
              );
              const specialtyValue = firstDefined(
                coerceStringValue(selectedUser.specialty),
                getRecordString(counselorMetadata, 'specialty'),
                getMetadataString(selectedUser, 'specialty'),
              );
              const preferredLanguageValue = firstDefined(
                coerceStringValue(selectedUser.preferredLanguage),
                getMetadataString(selectedUser, 'preferredLanguage', 'preferred_language', 'language'),
              );
              const ageValue = selectedUser.age;
              const genderValue = firstDefined(
                coerceStringValue(selectedUser.gender),
                getMetadataString(selectedUser, 'gender'),
              );
              const cancerTypeValue = firstDefined(
                coerceStringValue(selectedUser.cancerType),
                getMetadataString(selectedUser, 'cancerType'),
              );
              const diagnosisDateValue = firstDefined(
                coerceStringValue(selectedUser.diagnosisDate),
                getMetadataString(selectedUser, 'diagnosisDate'),
              );
              const currentTreatmentValue = firstDefined(
                coerceStringValue(selectedUser.currentTreatment),
                getMetadataString(selectedUser, 'currentTreatment'),
              );
              const treatmentStageValue = firstDefined(
                coerceStringValue(selectedUser.treatmentStage),
                getMetadataString(selectedUser, 'treatmentStage', 'treatment_stage'),
              );
              const supportNeedsValue = firstDefined(
                coerceStringValue(selectedUser.supportNeeds),
                getMetadataString(selectedUser, 'supportNeeds'),
              );
              const familySupportValue = firstDefined(
                coerceStringValue(selectedUser.familySupport),
                getMetadataString(selectedUser, 'familySupport'),
              );
              const consultationTypeValue = firstDefined(
                coerceStringValue(selectedUser.consultationType),
                getMetadataString(selectedUser, 'consultationType'),
              );
              const specialRequestsValue = firstDefined(
                coerceStringValue(selectedUser.specialRequests),
                getMetadataString(selectedUser, 'specialRequests'),
              );
              const isCounselor = selectedUser.role === 'counselor';
              const isPatient = selectedUser.role === 'patient';
              const phoneLabel = phoneValue ?? 'Not provided';
              const practiceLabel = practiceValue ?? (isCounselor ? 'Not provided' : 'Not applicable');
              const availabilityLabel = availabilityValue ?? (isCounselor ? 'Unknown' : 'Not applicable');
              const acceptingNewPatientsLabel =
                acceptingNewPatientsValue === undefined
                  ? isCounselor
                    ? 'Unknown'
                    : 'Not applicable'
                  : acceptingNewPatientsValue
                    ? 'Yes'
                    : 'No';
              const telehealthLabel =
                telehealthValue === undefined
                  ? isCounselor
                    ? 'Unknown'
                    : 'Not applicable'
                  : telehealthValue
                    ? 'Yes'
                    : 'No';
              const languagesNode = renderBadgeList(languages.length > 0 ? languages : undefined);
              const serviceRegionsNode = isCounselor
                ? renderBadgeList(serviceRegions.length > 0 ? serviceRegions : undefined)
                : <p className="text-xs text-muted-foreground">Not applicable</p>;
              const supportedTimezonesNode = isCounselor
                ? renderBadgeList(supportedTimezones.length > 0 ? supportedTimezones : undefined)
                : <p className="text-xs text-muted-foreground">Not applicable</p>;
              const sessionModalitiesNode = isCounselor
                ? renderBadgeList(sessionModalities.length > 0 ? sessionModalities : undefined)
                : <p className="text-xs text-muted-foreground">Not applicable</p>;
              const hasProfessionalDetails = Boolean(
                specializations.length > 0 ||
                  consultationTypes.length > 0 ||
                  professionalHighlights.length > 0 ||
                  specialtyValue ||
                  approachValue ||
                  bioValue,
              );
              const formatDateLabel = (value?: string) => {
                if (!value) {
                  return 'Not provided';
                }
                const parsed = new Date(value);
                if (Number.isNaN(parsed.getTime())) {
                  return value;
                }
                return parsed.toLocaleDateString(undefined, { dateStyle: 'medium' });
              };
              const preferredLanguageLabel = preferredLanguageValue ?? (languages.length > 0 ? languages[0] : undefined);
              const genderLabel = genderValue ?? 'Not provided';
              const cancerTypeLabel = cancerTypeValue ?? 'Not provided';
              const currentTreatmentLabel = currentTreatmentValue ?? 'Not provided';
              const treatmentStageLabel = treatmentStageValue ?? 'Not provided';
              const supportNeedsLabel = supportNeedsValue ?? 'Not provided';
              const familySupportLabel = familySupportValue ?? 'Not provided';
              const consultationTypeLabel = consultationTypeValue ?? 'Not provided';
              const specialRequestsLabel = specialRequestsValue ?? 'Not provided';
              const diagnosisDateLabel = formatDateLabel(diagnosisDateValue);

               return (
                 <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1 sm:pr-3">
                   <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                       <Avatar className="h-14 w-14">
                         {viewAvatarSrc ? <AvatarImage src={viewAvatarSrc} alt={selectedUser.fullName || selectedUser.email} /> : null}
                  <AvatarFallback>
                    {(selectedUser.fullName || selectedUser.email || 'U')
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">
                    {selectedUser.fullName || 'Not provided'}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
                     <div className="flex flex-wrap gap-2">
                       <Badge className={getRoleColor(selectedUser.role)}>{selectedUser.role}</Badge>
                       <Badge className={getStatusColor(selectedUser)}>
                         {getStatusText(selectedUser)}
                       </Badge>
                       <Badge variant={selectedUser.isVerified ? 'secondary' : 'outline'}>
                         {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                       </Badge>
                     </div>
                   </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <InfoItem label="Created" value={new Date(selectedUser.createdAt).toLocaleString()} />
                <InfoItem
                  label="Last login"
                       value={selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                     />
                     <InfoItem label="Phone" value={phoneLabel} />
                     <InfoItem label="Location" value={locationLabel} />
                     <InfoItem label="Practice" value={practiceLabel} />
                     <InfoItem label="Availability" value={availabilityLabel} />
                     <InfoItem label="Accepting new patients" value={acceptingNewPatientsLabel} />
                     <InfoItem label="Telehealth" value={telehealthLabel} />
                     {specialtyValue ? <InfoItem label="Specialty" value={specialtyValue} /> : null}
              </div>

                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                     <div className="space-y-2">
                       <h4 className="text-sm font-medium">Languages</h4>
                       {languagesNode}
            </div>
                     <div className="space-y-2">
                       <h4 className="text-sm font-medium">Service Regions</h4>
                       {serviceRegionsNode}
                     </div>
                     <div className="space-y-2">
                       <h4 className="text-sm font-medium">Supported Timezones</h4>
                       {supportedTimezonesNode}
                     </div>
                     <div className="space-y-2">
                       <h4 className="text-sm font-medium">Session Modalities</h4>
                       {sessionModalitiesNode}
                     </div>
                   </div>

                   {hasProfessionalDetails ? (
                     <div className="space-y-3">
                       <h4 className="text-sm font-semibold">Professional Summary</h4>
                       {bioValue ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Bio</p>
                           <p className="text-sm text-foreground whitespace-pre-line">{bioValue}</p>
                         </div>
                       ) : null}
                       {approachValue ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Approach</p>
                           <p className="text-sm text-foreground whitespace-pre-line">{approachValue}</p>
                         </div>
                       ) : null}
                       {specializations.length > 0 ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Specializations</p>
                           {renderBadgeList(specializations)}
                         </div>
                       ) : null}
                       {consultationTypes.length > 0 ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Consultation Types</p>
                           {renderBadgeList(consultationTypes)}
                         </div>
                       ) : null}
                       {professionalHighlights.length > 0 ? (
                         <div>
                           <p className="text-xs uppercase tracking-wide text-muted-foreground">Professional Highlights</p>
                           {renderBadgeList(professionalHighlights)}
                         </div>
                       ) : null}
                     </div>
                   ) : null}

                  {isPatient ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Patient Summary</h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoItem label="Preferred Language" value={preferredLanguageLabel ?? 'Not provided'} />
                        <InfoItem label="Age" value={ageValue !== undefined ? String(ageValue) : 'Not provided'} />
                        <InfoItem label="Gender" value={genderLabel} />
                        <InfoItem label="Cancer Type" value={cancerTypeLabel} />
                        <InfoItem label="Diagnosis Date" value={diagnosisDateLabel} />
                        <InfoItem label="Current Treatment" value={currentTreatmentLabel} />
                        <InfoItem label="Treatment Stage" value={treatmentStageLabel} />
                        <InfoItem label="Consultation Preference" value={consultationTypeLabel} />
                        <InfoItem label="Support Needs" value={supportNeedsLabel} />
                        <InfoItem label="Family Support" value={familySupportLabel} />
                        <InfoItem label="Special Requests" value={specialRequestsLabel} />
                      </div>
                    </div>
                  ) : null}

                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Documents</h4>
                      <div className="space-y-2">
                        {documents.map((document) => {
                          const documentUrl =
                            toAbsoluteAvatarSrc(document.url ?? document.storagePath ?? '') ??
                            document.url ??
                            document.storagePath ??
                            undefined;
                          return (
                            <div key={`${document.type}-${document.url}`} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium capitalize">
                                  {document.label || document.type || 'Document'}
                                </p>
                                {document.storagePath ? (
                                  <p className="text-xs text-muted-foreground break-all">{document.storagePath}</p>
                                ) : null}
                              </div>
                              {documentUrl ? (
                                <Button asChild size="sm" variant="outline">
                                  <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {metadataItems.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Metadata</h4>
                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
                        {metadataItems.map(({ key, value }) => (
                          <MetadataItem key={key} label={formatKeyLabel(key)} value={value} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })()
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No user selected.
            </div>
          )}
        </div>
          <DialogFooter className="justify-end">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function isUserActive(user: AdminUser) {
  if (!user.lastLogin) {
    return false;
  }
  const lastLoginDate = new Date(user.lastLogin);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return lastLoginDate >= thirtyDaysAgo;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground break-words">{value}</p>
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground whitespace-pre-wrap break-words">{value}</p>
    </div>
  );
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const formatted = value
      .map((item) => formatMetadataValue(item))
      .filter((item) => item.length > 0)
      .join(', ');
    return formatted;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '';
    }
  }
  return '';
}

function formatKeyLabel(rawKey: string): string {
  return rawKey
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
