'use client';

import React, { useState, useEffect } from 'react';
import { AnimatedStatCard } from '@workspace/ui/components/animated-stat-card';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { SlidingNumber } from '@workspace/ui/components/animate-ui/primitives/texts/sliding-number';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageCircle,
  UserCheck,
  AlertCircle,
  Activity,
  BarChart3,
  Heart,
  Target,
  Shield
} from 'lucide-react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { AdminApi, type Analytics } from '../../../lib/api/admin';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AdminApi.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-lg font-semibold mb-2">Error loading analytics</h3>
        <p className="text-muted-foreground">Please try again later.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Admin Dashboard"
        description="Overview of platform statistics and system health"
      />

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Total Users"
          value={analytics.users.total}
          description="Registered users"
          icon={Users}
          trend={{ value: analytics.users.newThisMonth, isPositive: true }}
          delay={0.1}
        />
        <AnimatedStatCard
          title="Active Sessions"
          value={analytics.sessions.scheduled}
          description="Currently scheduled"
          icon={Calendar}
          trend={{ value: analytics.sessions.thisMonth, isPositive: true }}
          delay={0.2}
        />
        <AnimatedStatCard
          title="Completed Sessions"
          value={analytics.sessions.completed}
          description={`This month: ${analytics.sessions.thisMonth}`}
          icon={TrendingUp}
          trend={{ value: analytics.sessions.thisMonth, isPositive: true }}
          delay={0.3}
        />
        <AnimatedStatCard
          title="Messages"
          value={analytics.chats.messages}
          description={`${analytics.chats.unread} unread`}
          icon={MessageCircle}
          delay={0.4}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Count</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.patients}</div>
            <p className="text-xs text-muted-foreground">
              Active patients
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Counselor Count</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.counselors}</div>
            <p className="text-xs text-muted-foreground">
              Active counselors
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.resources.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.resources.views} total views
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">Server Status</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">Database</span>
              </div>
              <Badge variant="default">Healthy</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm">Video Service</span>
              </div>
              <Badge variant="secondary">Maintenance</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">AI Assistant</span>
              </div>
              <Badge variant="default">Online</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">Email Service</span>
              </div>
              <Badge variant="default">Operational</Badge>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Recent Activity */}
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">New patient registered</p>
                <p className="text-xs text-muted-foreground">Grace Mukamana joined the platform</p>
              </div>
              <span className="text-xs text-muted-foreground">2h ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Module completed</p>
                <p className="text-xs text-muted-foreground">Paul Nkurunziza finished "Managing Treatment Side Effects"</p>
              </div>
              <span className="text-xs text-muted-foreground">4h ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Session completed</p>
                <p className="text-xs text-muted-foreground">Dr. Marie Claire finished session with Jean Baptiste</p>
              </div>
              <span className="text-xs text-muted-foreground">6h ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Support ticket created</p>
                <p className="text-xs text-muted-foreground">New urgent ticket from patient</p>
              </div>
              <span className="text-xs text-muted-foreground">8h ago</span>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Quick Actions */}
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">View Support</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm">System Logs</span>
            </Button>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}
