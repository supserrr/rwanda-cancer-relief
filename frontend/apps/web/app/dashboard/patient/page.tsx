'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedStatCard } from '@workspace/ui/components/animated-stat-card';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { SlidingNumber } from '@workspace/ui/components/animate-ui/primitives/texts/sliding-number';
import { 
  TrendingUp, 
  Calendar, 
  MessageCircle, 
  BookOpen,
  Clock,
  CheckCircle,
  Play,
  Heart,
  Target,
  Users
} from 'lucide-react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useSessions } from '../../../hooks/useSessions';
import { useChat } from '../../../hooks/useChat';
import { useResources } from '../../../hooks/useResources';
import { AdminApi, type AdminUser } from '../../../lib/api/admin';
import { QuickBookingModal } from '@workspace/ui/components/quick-booking-modal';
import { toast } from 'sonner';

export default function PatientDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const [counselors, setCounselors] = useState<AdminUser[]>([]);
  const [counselorsLoading, setCounselorsLoading] = useState(true);

  // Load upcoming sessions
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
  } = useSessions({
    patientId: user?.id,
    status: 'scheduled',
  });

  // Load chats for recent messages
  const {
    chats,
    messages,
    loading: chatsLoading,
    error: chatsError,
  } = useChat({
    participantId: user?.id,
  });

  // Load recommended resources (public resources, limited)
  const {
    resources,
    loading: resourcesLoading,
    error: resourcesError,
  } = useResources({
    isPublic: true,
    limit: 3,
    sortBy: 'views',
    sortOrder: 'desc',
  });

  // Load counselors for quick booking
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        setCounselorsLoading(true);
        const response = await AdminApi.listUsers({ role: 'counselor' });
        setCounselors(response.users);
      } catch (error) {
        console.error('Error fetching counselors:', error);
        toast.error('Failed to load counselors');
      } finally {
        setCounselorsLoading(false);
      }
    };

    if (user?.id) {
      fetchCounselors();
    }
  }, [user?.id]);

  // Filter upcoming sessions
  const upcomingSessions = useMemo(() => {
    return sessions.filter(session => 
      session.status === 'scheduled' &&
      new Date(session.date) > new Date()
    ).slice(0, 3); // Show only next 3
  }, [sessions]);

  // Get recent messages from all chats
  const recentMessages = useMemo(() => {
    // Get messages from all chats, sorted by most recent
    const allMessages = chats.flatMap(chat => {
      // Find messages for this chat
      const chatMessages = messages.filter(msg => msg.chatId === chat.id);
      return chatMessages;
    }).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 3); // Show only 3 most recent

    return allMessages;
  }, [chats, messages]);

  // Get recommended resources
  const recommendedResources = useMemo(() => {
    return resources.slice(0, 3);
  }, [resources]);

  const handleQuickBooking = () => {
    setIsQuickBookingOpen(true);
  };

  const handleConfirmQuickBooking = (bookingData: any) => {
    // Quick booking is handled by the QuickBookingModal component
    setIsQuickBookingOpen(false);
    toast.success('Session booking initiated!');
  };

  const handleCloseQuickBooking = () => {
    setIsQuickBookingOpen(false);
  };

  const handleMessageClick = (message: any) => {
    // Navigate to chat page with the chat ID
    if (message.chatId) {
      router.push(`/dashboard/patient/chat?chatId=${message.chatId}`);
    } else {
      // Fallback: just navigate to chat page
      router.push('/dashboard/patient/chat');
    }
  };

  // Get counselor name from message
  const getCounselorName = (message: any) => {
    // Try to find counselor from chat
    const chat = chats.find(c => c.id === message.chatId);
    if (chat) {
      const counselorId = chat.participants.find(id => id !== user?.id);
      const counselor = counselors.find(c => c.id === counselorId);
      return counselor?.fullName || counselor?.email || 'Counselor';
    }
    return 'Counselor';
  };

  // Calculate module progress (placeholder - would come from patient metadata)
  const moduleProgress = 75; // This would come from user metadata or a separate API

  // Loading state
  if (authLoading || sessionsLoading || chatsLoading || resourcesLoading || counselorsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Here's an overview of your progress and upcoming activities"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Module Progress"
          value={moduleProgress}
          description="Your overall progress"
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
          delay={0.1}
        />
        <AnimatedStatCard
          title="Upcoming Sessions"
          value={upcomingSessions.length}
          description="Next session in 2 days"
          icon={Calendar}
          delay={0.2}
        />
        <AnimatedStatCard
          title="Messages"
          value={chats.filter(chat => chat.unreadCount > 0).length}
          description={`${chats.reduce((sum, chat) => sum + chat.unreadCount, 0)} unread`}
          icon={MessageCircle}
          delay={0.3}
        />
        <AnimatedStatCard
          title="Resources"
          value={resources.length}
          description="Available resources"
          icon={BookOpen}
          trend={{ value: 25, isPositive: true }}
          delay={0.4}
        />
      </div>

      <AnimatedGrid className="grid gap-6 lg:grid-cols-2" staggerDelay={0.2}>
        {/* Module Progress */}
        <AnimatedCard delay={0.5}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Module Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Progress</span>
                <span className="text-sm text-muted-foreground">
                  <SlidingNumber 
                    number={moduleProgress}
                    fromNumber={0}
                    transition={{ stiffness: 200, damping: 20, mass: 0.4 }}
                  />%
                </span>
              </div>
              <Progress value={moduleProgress} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Recognizing Anxiety Symptoms</span>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Breathing Exercises</span>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Mindfulness Practice</span>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Building a Support Network</span>
                </div>
                <Badge variant="outline">In Progress</Badge>
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => router.push('/dashboard/patient/resources')}
            >
              <Play className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          </CardContent>
        </AnimatedCard>

        {/* Upcoming Sessions */}
        <AnimatedCard delay={0.7}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  // Get counselor name
                  const counselorId = session.counselorId;
                  const counselor = counselors.find(c => c.id === counselorId);
                  const counselorName = counselor?.fullName || counselor?.email || 'Counselor';

                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Session with {counselorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()} at {session.time}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/dashboard/patient/sessions/session/${session.id}`)}
                      >
                        Join
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming sessions</p>
                <Button className="mt-2" size="sm" onClick={handleQuickBooking}>
                  Book a Session
                </Button>
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>

      <AnimatedGrid className="grid gap-6 lg:grid-cols-2" staggerDelay={0.2}>
        {/* Recent Messages */}
        <AnimatedCard delay={0.9}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div 
                    key={message.id} 
                    onClick={() => handleMessageClick(message)}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{getCounselorName(message)}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent messages</p>
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Recommended Resources */}
        <AnimatedCard delay={1.1}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedResources.length > 0 ? (
                recommendedResources.map((resource) => (
                  <div 
                    key={resource.id} 
                    onClick={() => router.push(`/dashboard/patient/resources?resourceId=${resource.id}`)}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors duration-200">
                      {resource.type === 'audio' || resource.type === 'video' ? (
                        <Play className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.type.toUpperCase()} • {resource.views} views
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/patient/resources?resourceId=${resource.id}`);
                      }}
                      className="group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:text-primary dark:group-hover:text-primary transition-all duration-200"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No resources available</p>
                </div>
              )}
            </div>
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>

      {/* Quick Booking Modal */}
      <QuickBookingModal
        isOpen={isQuickBookingOpen}
        onClose={handleCloseQuickBooking}
        onConfirmBooking={handleConfirmQuickBooking}
        counselors={counselors.map(counselor => ({
          id: counselor.id,
          name: counselor.fullName || counselor.email || 'Counselor',
          avatar: undefined,
          specialty: (counselor as any).specialty || 'General Counseling',
          availability: (counselor as any).availability || 'available',
        }))}
      />
    </div>
  );
}
