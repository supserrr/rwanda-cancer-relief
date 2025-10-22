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
  Filter
} from 'lucide-react';

/**
 * Counselor dashboard page component
 */
export default function CounselorDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApprovalSplash, setShowApprovalSplash] = useState(true); // Set to true for pending approval

  // Sample data - in real app this would come from API
  const pendingApproval = true; // This would come from user status
  const approvalStatus = 'pending'; // 'pending', 'approved', 'rejected'

  const upcomingSessions = [
    {
      id: 1,
      patient: 'Marie Uwimana',
      type: 'Video Call',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'confirmed',
      duration: '60 min'
    },
    {
      id: 2,
      patient: 'Jean-Baptiste Nkurunziza',
      type: 'Chat',
      date: '2024-01-18',
      time: '2:00 PM',
      status: 'pending',
      duration: '45 min'
    }
  ];

  const recentMessages = [
    {
      id: 1,
      patient: 'Marie Uwimana',
      message: 'Thank you for the session yesterday. It really helped.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      patient: 'Jean-Baptiste Nkurunziza',
      message: 'I have a question about the coping strategies we discussed.',
      time: '1 day ago',
      unread: false
    }
  ];

  const patientStats = {
    totalPatients: 12,
    activeSessions: 8,
    completedSessions: 45,
    averageRating: 4.8
  };

  // Approval Splash Screen
  const renderApprovalSplash = () => (
    <div className="min-h-screen w-full bg-background flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card className="w-full bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20">
          <CardHeader className="text-center relative">
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
          </CardHeader>
          <CardContent className="p-8 text-center relative z-10">
          <div className="mb-6">
            {approvalStatus === 'pending' && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
            )}
            {approvalStatus === 'approved' && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
            )}
            {approvalStatus === 'rejected' && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {approvalStatus === 'pending' && 'Application Under Review'}
            {approvalStatus === 'approved' && 'Welcome to RCR!'}
            {approvalStatus === 'rejected' && 'Application Status'}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            {approvalStatus === 'pending' && 
              'Thank you for submitting your counselor application. Our team is currently reviewing your credentials and will get back to you within 3-5 business days. You will receive an email notification once your application has been processed.'
            }
            {approvalStatus === 'approved' && 
              'Congratulations! Your application has been approved. You can now start providing support to patients in need.'
            }
            {approvalStatus === 'rejected' && 
              'We appreciate your interest in joining Rwanda Cancer Relief. Unfortunately, we cannot approve your application at this time. Please contact our support team for more information.'
            }
          </p>

          {approvalStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  <strong>What happens next?</strong> Our admin team will review your credentials, 
                  verify your documents, and check your references. This process typically takes 3-5 business days.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {approvalStatus === 'pending' && (
              <Button 
                onClick={() => window.location.href = '/contact'}
                variant="ghost"
                className="w-full"
              >
                Contact Support
              </Button>
            )}
            {approvalStatus === 'approved' && (
              <Button 
                onClick={() => setShowApprovalSplash(false)}
                className="w-full"
              >
                Access Dashboard
              </Button>
            )}
            {approvalStatus === 'rejected' && (
              <>
                <Button 
                  onClick={() => window.location.href = '/contact'}
                  className="w-full"
                >
                  Contact Support
                </Button>
                <Button 
                  onClick={() => window.location.href = '/signup/counselor'}
                  variant="outline"
                  className="w-full"
                >
                  Reapply
                </Button>
              </>
            )}
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">{patientStats.totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold text-foreground">{patientStats.activeSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{patientStats.completedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold text-foreground">{patientStats.averageRating}</p>
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
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{session.patient}</h4>
                    <p className="text-sm text-muted-foreground">{session.type} • {session.duration}</p>
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
                  <Button size="sm" variant="outline">Start Session</Button>
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
          <CardDescription>Latest conversations with your patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{message.patient}</h4>
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
    return renderApprovalSplash();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Counselor Dashboard</h1>
              <p className="text-muted-foreground">Manage your patients and sessions</p>
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
