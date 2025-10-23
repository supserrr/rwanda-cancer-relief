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
  Package
} from 'lucide-react';

/**
 * Counselor dashboard page component - Dashy Style
 */
export default function CounselorDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApprovalSplash, setShowApprovalSplash] = useState(false); // Set to false to show dashboard

  // Sample data - in real app this would come from API
  const pendingApproval = false; // This would come from user status
  const approvalStatus = 'approved'; // 'pending', 'approved', 'rejected'

  // Overview Cards Data
  const overviewData = {
    totalPatients: { value: 1234, growthRate: 12.5 },
    activeSessions: { value: 89, growthRate: 8.2 },
    completedSessions: { value: 456, growthRate: 15.3 },
    averageRating: { value: 4.8, growthRate: 0.2 }
  };

  // Overview Card Component
  const OverviewCard = ({ label, data, Icon, color }: { 
    label: string; 
    data: { value: number; growthRate: number }; 
    Icon: any; 
    color: string;
  }) => {
    const isDecreasing = data.growthRate < 0;
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground">{data.value}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className={`w-4 h-4 ${isDecreasing ? 'text-red-500' : 'text-green-500'} mr-1`} />
                <span className={`text-sm ${isDecreasing ? 'text-red-500' : 'text-green-500'}`}>
                  {isDecreasing ? '' : '+'}{data.growthRate}%
                </span>
              </div>
            </div>
            <div className={`p-3 ${color} rounded-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Chart Placeholder Component
  const ChartPlaceholder = ({ title, description, height = "h-80" }: { 
    title: string; 
    description: string; 
    height?: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${height} flex items-center justify-center bg-muted/20 rounded-lg`}>
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">Chart component would go here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Weekly Performance Component
  const WeeklyPerformance = () => (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Performance</CardTitle>
        <CardDescription>This week's counseling metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">New Patients</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">12</p>
              <p className="text-sm text-green-500">+3 from last week</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Messages Sent</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">89</p>
              <p className="text-sm text-green-500">+15 from last week</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Hours Logged</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">42</p>
              <p className="text-sm text-green-500">+8 from last week</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Top Channels Table Component
  const TopChannels = () => (
    <Card>
      <CardHeader>
        <CardTitle>Top Patients</CardTitle>
        <CardDescription>Most active patients this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: 'Marie Uwimana', sessions: 12, revenue: '$2,400', growth: '+12%' },
            { name: 'Jean-Baptiste Nkurunziza', sessions: 10, revenue: '$2,000', growth: '+8%' },
            { name: 'Grace Mukamana', sessions: 8, revenue: '$1,600', growth: '+15%' },
            { name: 'Paul Nkurunziza', sessions: 7, revenue: '$1,400', growth: '+5%' },
            { name: 'Claire Uwimana', sessions: 6, revenue: '$1,200', growth: '+10%' }
          ].map((patient, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{patient.name}</h4>
                  <p className="text-sm text-muted-foreground">{patient.sessions} sessions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">{patient.revenue}</p>
                <p className="text-sm text-green-500">{patient.growth}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Chats Card Component
  const ChatsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Messages</CardTitle>
        <CardDescription>Latest conversations with patients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: 'Marie Uwimana', message: 'Thank you for the session yesterday. It really helped.', time: '2 hours ago', unread: true },
            { name: 'Jean-Baptiste Nkurunziza', message: 'I have a question about the coping strategies we discussed.', time: '1 day ago', unread: false },
            { name: 'Grace Mukamana', message: 'Can we schedule another session for next week?', time: '2 days ago', unread: true }
          ].map((message, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{message.name}</h4>
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
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overview Cards - Dashy Style */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <OverviewCard
          label="Total Patients"
          data={overviewData.totalPatients}
          Icon={Users}
          color="bg-primary"
        />
        <OverviewCard
          label="Active Sessions"
          data={overviewData.activeSessions}
          Icon={Calendar}
          color="bg-green-500"
        />
        <OverviewCard
          label="Completed Sessions"
          data={overviewData.completedSessions}
          Icon={CheckCircle}
          color="bg-blue-500"
        />
        <OverviewCard
          label="Average Rating"
          data={overviewData.averageRating}
          Icon={Award}
          color="bg-purple-500"
        />
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {/* Main Chart */}
        <div className="col-span-12 xl:col-span-7">
          <ChartPlaceholder
            title="Session Analytics"
            description="Overview of your counseling sessions over time"
          />
        </div>

        {/* Weekly Performance */}
        <div className="col-span-12 xl:col-span-5">
          <WeeklyPerformance />
        </div>

        {/* Used Devices Chart */}
        <div className="col-span-12 xl:col-span-5">
          <ChartPlaceholder
            title="Session Types"
            description="Distribution of session types"
            height="h-64"
          />
        </div>

        {/* Region Labels */}
        <div className="col-span-12 xl:col-span-7">
          <ChartPlaceholder
            title="Patient Demographics"
            description="Geographic distribution of patients"
            height="h-64"
          />
        </div>

        {/* Top Channels Table */}
        <div className="col-span-12 grid xl:col-span-8">
          <TopChannels />
        </div>

        {/* Chats Card */}
        <div className="col-span-12 xl:col-span-4">
          <ChatsCard />
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">My Patients</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patients..."
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
            name: 'Marie Uwimana',
            age: 45,
            diagnosis: 'Breast Cancer',
            stage: 'Stage 2',
            lastSession: '2 days ago',
            nextSession: 'Tomorrow',
            status: 'active'
          },
          {
            name: 'Jean-Baptiste Nkurunziza',
            age: 38,
            diagnosis: 'Lung Cancer',
            stage: 'Stage 3',
            lastSession: '1 week ago',
            nextSession: 'Next week',
            status: 'active'
          },
          {
            name: 'Grace Mukamana',
            age: 52,
            diagnosis: 'Cervical Cancer',
            stage: 'Stage 1',
            lastSession: '3 days ago',
            nextSession: 'This Friday',
            status: 'active'
          }
        ].map((patient, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Diagnosis:</p>
                  <p className="text-sm text-muted-foreground">{patient.diagnosis}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Stage:</p>
                  <Badge variant="outline">{patient.stage}</Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Last Session:</p>
                  <p className="text-sm text-muted-foreground">{patient.lastSession}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Next Session:</p>
                  <p className="text-sm text-muted-foreground">{patient.nextSession}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Notes
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
        <h2 className="text-2xl font-bold text-foreground">Counselor Resources</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Counseling Best Practices',
            type: 'Guide',
            description: 'Evidence-based practices for cancer counseling and support.',
            category: 'Professional Development'
          },
          {
            title: 'Cultural Sensitivity Training',
            type: 'Course',
            description: 'Understanding cultural nuances in Rwandan healthcare.',
            category: 'Training'
          },
          {
            title: 'Crisis Intervention Protocols',
            type: 'Protocol',
            description: 'Step-by-step guide for handling crisis situations.',
            category: 'Emergency Procedures'
          },
          {
            title: 'Patient Assessment Tools',
            type: 'Toolkit',
            description: 'Standardized tools for patient assessment and evaluation.',
            category: 'Assessment'
          },
          {
            title: 'Self-Care for Counselors',
            type: 'Resource',
            description: 'Maintaining your own mental health while helping others.',
            category: 'Wellness'
          },
          {
            title: 'Legal and Ethical Guidelines',
            type: 'Document',
            description: 'Important legal and ethical considerations for counselors.',
            category: 'Compliance'
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
      case 'patients': return renderPatients();
      case 'resources': return renderResources();
      default: return renderOverview();
    }
  };

  // Show approval splash screen if pending approval
  if (showApprovalSplash && pendingApproval) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <Card className="w-full bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20">
            <CardHeader className="text-center relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
            </CardHeader>
            <CardContent className="p-8 text-center relative z-10">
              <div className="mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Application Under Review
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                Thank you for submitting your counselor application. Our team is currently reviewing your credentials and will get back to you within 3-5 business days. You will receive an email notification once your application has been processed.
              </p>

              <div className="bg-muted/20 border border-border rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">What happens next?</h4>
                    <p className="text-sm text-muted-foreground">
                      Our admin team will review your credentials, 
                      verify your documents, and check your references. This process typically takes 3-5 business days.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/contact'}
                  variant="ghost"
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Counselor Dashboard - DASHY STYLE</h1>
              <p className="text-muted-foreground">Manage your patients and sessions - Updated with Dashy Style</p>
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
              { id: 'patients', label: 'Patients', icon: Users },
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