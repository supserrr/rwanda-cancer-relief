'use client';

import { useState } from 'react';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/ui/card';
import { Badge } from '@workspace/ui/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  FileText, 
  Settings, 
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Award,
  BarChart3,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Eye,
  DollarSign,
  Package,
  Heart,
  Shield,
  BookOpen,
  Phone,
  Video,
  MapPin
} from 'lucide-react';

/**
 * Patient dashboard page component - Dash Style
 */
export default function PatientDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - in real app this would come from API
  const upcomingSessions = [
    {
      id: 1,
      counselor: 'Dr. Grace Mukamana',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Video Call',
      status: 'confirmed'
    },
    {
      id: 2,
      counselor: 'Dr. Jean-Baptiste Nkurunziza',
      date: '2024-01-18',
      time: '2:00 PM',
      type: 'In-Person',
      status: 'pending'
    }
  ];

  const recentMessages = [
    {
      id: 1,
      counselor: 'Dr. Grace Mukamana',
      message: 'How are you feeling today? Remember to practice the breathing exercises we discussed.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      counselor: 'Dr. Jean-Baptiste Nkurunziza',
      message: 'Your test results look good. Let\'s discuss them in our next session.',
      time: '1 day ago',
      unread: false
    }
  ];

  const supportGroups = [
    {
      id: 1,
      name: 'Breast Cancer Support Group',
      members: 24,
      nextMeeting: '2024-01-20',
      description: 'A supportive community for women navigating breast cancer treatment.'
    },
    {
      id: 2,
      name: 'Family Support Network',
      members: 18,
      nextMeeting: '2024-01-22',
      description: 'Support for families affected by cancer.'
    }
  ];

  const resources = [
    {
      id: 1,
      title: 'Understanding Your Treatment',
      type: 'Guide',
      category: 'Medical Information',
      description: 'Comprehensive guide to understanding your treatment plan and what to expect.'
    },
    {
      id: 2,
      title: 'Coping with Side Effects',
      type: 'Resource',
      category: 'Wellness',
      description: 'Practical tips for managing treatment side effects and maintaining quality of life.'
    },
    {
      id: 3,
      title: 'Nutrition During Treatment',
      type: 'Guide',
      category: 'Lifestyle',
      description: 'Nutritional guidance to support your body during cancer treatment.'
    }
  ];

  // Overview Cards Component
  const OverviewCard = ({ title, value, change, icon: Icon, color }: { 
    title: string; 
    value: string; 
    change: string; 
    icon: any; 
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-green-600 mt-1">{change}</p>
          </div>
          <div className={`p-3 ${color} rounded-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Chart Placeholder Component
  const ChartPlaceholder = ({ title, description }: { 
    title: string; 
    description: string; 
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">Chart component would go here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Main Metrics Cards - Dash Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OverviewCard
          title="Upcoming Sessions"
          value="2"
          change="+1 this week"
          icon={Calendar}
          color="bg-primary"
        />
        <OverviewCard
          title="Active Chats"
          value="3"
          change="+2 this week"
          icon={MessageCircle}
          color="bg-green-500"
        />
        <OverviewCard
          title="Support Groups"
          value="2"
          change="Joined this month"
          icon={Users}
          color="bg-blue-500"
        />
        <OverviewCard
          title="Resources"
          value="12"
          change="+3 new this week"
          icon={FileText}
          color="bg-purple-500"
        />
      </div>

      {/* Monthly Progress Chart */}
      <ChartPlaceholder
        title="Monthly Progress"
        description="Your counseling journey this month"
      />

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Quick Actions */}
        <div className="col-span-12 xl:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Join Support Group
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages */}
        <div className="col-span-12 xl:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest conversations with your counselors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-foreground">{message.counselor}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                          {message.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderCounselors = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">My Counselors</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Find New Counselor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Dr. Grace Mukamana',
            specialty: 'Oncology Counseling',
            experience: '8 years',
            rating: 4.9,
            nextSession: 'Tomorrow at 10:00 AM',
            status: 'active',
            image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&auto=format&q=80'
          },
          {
            name: 'Dr. Jean-Baptiste Nkurunziza',
            specialty: 'Family Counseling',
            experience: '12 years',
            rating: 4.8,
            nextSession: 'Friday at 2:00 PM',
            status: 'active',
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&auto=format&q=80'
          }
        ].map((counselor, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{counselor.name}</h3>
                <p className="text-sm text-muted-foreground">{counselor.specialty}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{counselor.rating}</span>
                  <span className="text-sm text-muted-foreground">({counselor.experience})</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Next Session:</p>
                  <p className="text-sm text-muted-foreground">{counselor.nextSession}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Status:</p>
                  <Badge variant={counselor.status === 'active' ? 'default' : 'secondary'}>
                    {counselor.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSupportGroups = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Support Groups</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Join New Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportGroups.map((group) => (
          <Card key={group.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{group.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                </div>
                <Badge variant="outline">{group.members} members</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Next meeting: {group.nextMeeting}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <Users className="w-4 h-4 mr-2" />
                  View Group
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Resources</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{resource.type}</Badge>
                  <Badge variant="secondary">{resource.category}</Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </div>
              
              <Button size="sm" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                View Resource
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'counselors': return renderCounselors();
      case 'support-groups': return renderSupportGroups();
      case 'resources': return renderResources();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Patient Dashboard - DASH STYLE</h1>
              <p className="text-muted-foreground">Welcome back! Here's your support overview - Updated with Dash Style</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'counselors', label: 'Counselors', icon: Users },
              { id: 'support-groups', label: 'Support Groups', icon: Heart },
              { id: 'resources', label: 'Resources', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderCurrentTab()}
      </main>
    </div>
  );
}