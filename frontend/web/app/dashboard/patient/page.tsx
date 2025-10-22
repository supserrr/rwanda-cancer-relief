'use client';

import { useState } from 'react';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/ui/card';
import { Badge } from '@workspace/ui/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Bell,
  Search,
  Filter,
  Plus,
  Video,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

/**
 * Patient dashboard page component
 */
export default function PatientDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - in real app this would come from API
  const upcomingSessions = [
    {
      id: 1,
      counselor: 'Dr. Marie Uwimana',
      type: 'Video Call',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: 2,
      counselor: 'Jean-Baptiste Nkurunziza',
      type: 'Chat',
      date: '2024-01-18',
      time: '2:00 PM',
      status: 'pending'
    }
  ];

  const recentMessages = [
    {
      id: 1,
      counselor: 'Dr. Marie Uwimana',
      message: 'How are you feeling today?',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      counselor: 'Jean-Baptiste Nkurunziza',
      message: 'I\'ve sent you some resources about coping strategies.',
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
      description: 'A supportive community for breast cancer patients and survivors'
    },
    {
      id: 2,
      name: 'Family Support Circle',
      members: 18,
      nextMeeting: '2024-01-22',
      description: 'Support for families navigating cancer together'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Support Groups</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Resources</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>Your scheduled counseling sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {session.type === 'Video Call' ? (
                      <Video className="w-5 h-5 text-primary" />
                    ) : (
                      <MessageCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{session.counselor}</h4>
                    <p className="text-sm text-muted-foreground">{session.type}</p>
                    <p className="text-sm text-muted-foreground">{session.date} at {session.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                    {session.status === 'confirmed' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" />Confirmed</>
                    ) : (
                      <><Clock className="w-3 h-3 mr-1" />Pending</>
                    )}
                  </Badge>
                  <Button size="sm" variant="outline">Join</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Recent Messages
          </CardTitle>
          <CardDescription>Latest conversations with your counselors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{message.counselor}</h4>
                    <p className="text-sm text-muted-foreground">{message.message}</p>
                    <p className="text-xs text-muted-foreground">{message.time}</p>
                  </div>
                </div>
                {message.unread && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCounselors = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Your Counselors</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Find New Counselor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Dr. Marie Uwimana',
            title: 'Licensed Clinical Psychologist',
            specialties: ['Cancer Support', 'Grief Counseling'],
            languages: ['Kinyarwanda', 'English'],
            availability: 'Available now',
            lastSession: '2 days ago'
          },
          {
            name: 'Jean-Baptiste Nkurunziza',
            title: 'Mental Health Counselor',
            specialties: ['Anxiety Management', 'Coping Strategies'],
            languages: ['Kinyarwanda', 'English'],
            availability: 'Available in 2 hours',
            lastSession: '1 week ago'
          }
        ].map((counselor, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{counselor.name}</h3>
                <p className="text-sm text-muted-foreground">{counselor.title}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Specialties:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {counselor.specialties.map((specialty, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{specialty}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Languages:</p>
                  <p className="text-sm text-muted-foreground">{counselor.languages.join(', ')}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Availability:</p>
                  <p className="text-sm text-muted-foreground">{counselor.availability}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Last Session:</p>
                  <p className="text-sm text-muted-foreground">{counselor.lastSession}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book
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
          Join Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportGroups.map((group) => (
          <Card key={group.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
                <Badge variant="secondary">{group.members} members</Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Next meeting: {group.nextMeeting}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Users className="w-4 h-4 mr-2" />
                  Join Meeting
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
        {[
          {
            title: 'Understanding Your Diagnosis',
            type: 'Guide',
            description: 'A comprehensive guide to understanding your cancer diagnosis and treatment options.',
            category: 'Medical Information'
          },
          {
            title: 'Coping with Treatment Side Effects',
            type: 'Article',
            description: 'Practical tips for managing common side effects of cancer treatment.',
            category: 'Treatment Support'
          },
          {
            title: 'Family Communication Guide',
            type: 'Resource',
            description: 'How to talk to your family about your cancer journey.',
            category: 'Family Support'
          },
          {
            title: 'Financial Assistance Programs',
            type: 'Guide',
            description: 'Information about financial support available for cancer patients.',
            category: 'Financial Support'
          },
          {
            title: 'Nutrition During Treatment',
            type: 'Article',
            description: 'Dietary guidelines and nutrition tips for cancer patients.',
            category: 'Lifestyle'
          },
          {
            title: 'Mental Health and Wellness',
            type: 'Resource',
            description: 'Strategies for maintaining mental health during your cancer journey.',
            category: 'Mental Health'
          }
        ].map((resource, index) => (
          <Card key={index}>
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
              <h1 className="text-2xl font-bold text-foreground">Patient Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's your support overview.</p>
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
              { id: 'overview', label: 'Overview', icon: Heart },
              { id: 'counselors', label: 'Counselors', icon: Users },
              { id: 'support-groups', label: 'Support Groups', icon: Users },
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
