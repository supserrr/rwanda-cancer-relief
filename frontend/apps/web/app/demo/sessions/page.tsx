'use client';

import React, { useState } from 'react';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { SessionBookingModal } from '../../../components/session/SessionBookingModal';
import { CounselorSelectionModal } from '../../../components/session/CounselorSelectionModal';
import { 
  Video, 
  Mic, 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Play,
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
  Zap
} from 'lucide-react';
import { dummyCounselors } from '../../../lib/dummy-data';

/**
 * Demo page showcasing the Jitsi video conferencing integration.
 * 
 * This page demonstrates the session booking flow and video conferencing
 * features available in the platform.
 */
export default function SessionsDemoPage() {
  const [isCounselorSelectionOpen, setIsCounselorSelectionOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);

  const handleSelectCounselor = (counselor: any) => {
    setSelectedCounselor(counselor);
    setIsCounselorSelectionOpen(false);
    setIsBookingOpen(true);
  };

  const handleBookingConfirmed = (bookingData: any) => {
    console.log('Demo booking:', bookingData);
    setIsBookingOpen(false);
    setSelectedCounselor(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            New Feature
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Video Counseling Sessions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with professional counselors through secure, encrypted video and audio sessions
          </p>
        </div>

        {/* Feature Highlights */}
        <AnimatedGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
          <AnimatedCard delay={0.1} className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">HD Video Quality</h3>
            <p className="text-sm text-muted-foreground">
              Crystal clear video for face-to-face sessions
            </p>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">End-to-End Encrypted</h3>
            <p className="text-sm text-muted-foreground">
              Your conversations are completely private and secure
            </p>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Audio-Only Option</h3>
            <p className="text-sm text-muted-foreground">
              Low bandwidth mode for limited connectivity
            </p>
          </AnimatedCard>

          <AnimatedCard delay={0.4} className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Instant Connection</h3>
            <p className="text-sm text-muted-foreground">
              Join sessions with a single click
            </p>
          </AnimatedCard>
        </AnimatedGrid>

        {/* Session Type Cards */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Choose Your Session Type</h2>
            <p className="text-muted-foreground">
              Select the format that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Video Session Card */}
            <AnimatedCard delay={0.5} className="group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-0"></div>
              
              <div className="relative z-10 p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Video className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-3">Video Session</h3>
                <p className="text-muted-foreground mb-6">
                  Face-to-face counseling with full video and audio. Best for building connection and understanding non-verbal cues.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>HD video quality</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Screen sharing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Virtual backgrounds</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Recording option</span>
                  </div>
                </div>

                <Badge className="bg-blue-100 text-blue-800 mb-4">Recommended</Badge>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsCounselorSelectionOpen(true)}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Book Video Session
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </AnimatedCard>

            {/* Audio Session Card */}
            <AnimatedCard delay={0.6} className="group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -z-0"></div>
              
              <div className="relative z-10 p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mic className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-3">Audio-Only Session</h3>
                <p className="text-muted-foreground mb-6">
                  Voice-only counseling for privacy or limited bandwidth. Perfect for areas with slower internet connections.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Low bandwidth usage</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>More privacy</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Works on basic phones</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Crystal clear audio</span>
                  </div>
                </div>

                <Badge className="bg-purple-100 text-purple-800 mb-4">Low Bandwidth</Badge>

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setIsCounselorSelectionOpen(true)}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Book Audio Session
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground">
              Simple and straightforward booking process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <AnimatedCard delay={0.7} className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Select a Counselor</h3>
              <p className="text-sm text-muted-foreground">
                Browse available counselors and choose based on specialty and availability
              </p>
            </AnimatedCard>

            <AnimatedCard delay={0.8} className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <Calendar className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Pick Date & Type</h3>
              <p className="text-sm text-muted-foreground">
                Choose your preferred date, time, and session type (video or audio)
              </p>
            </AnimatedCard>

            <AnimatedCard delay={0.9} className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <Play className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Join Your Session</h3>
              <p className="text-sm text-muted-foreground">
                Click the join button when it's time and start your secure session
              </p>
            </AnimatedCard>
          </div>
        </div>

        {/* Technology Stack */}
        <AnimatedCard delay={1.0} className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Powered by Jitsi Meet</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                We use Jitsi Meet, a trusted open-source video conferencing platform used by millions worldwide. 
                Your sessions are encrypted end-to-end, ensuring complete privacy and confidentiality.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Open source & secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>HIPAA compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>No downloads needed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Works on all devices</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white">
                  <Video className="h-16 w-16 mb-4" />
                  <p className="text-2xl font-bold mb-1">100%</p>
                  <p className="text-sm opacity-90">Secure & Private</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Book your first counseling session today and experience professional mental health support 
            from the comfort of your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 px-8"
              onClick={() => setIsCounselorSelectionOpen(true)}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book a Session Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.open('/dashboard/patient/counselors', '_self')}
            >
              <Users className="h-5 w-5 mr-2" />
              Browse Counselors
            </Button>
          </div>
        </div>

        {/* Session Examples */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Session Examples</h2>
            <p className="text-muted-foreground">
              See what a typical session looks like
            </p>
          </div>

          <AnimatedGrid className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto" staggerDelay={0.1}>
            {/* Example 1 */}
            <AnimatedCard delay={1.1} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Video className="h-12 w-12 mx-auto mb-3 opacity-80" />
                  <p className="text-sm opacity-80">Video Session Preview</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-800">Video</Badge>
                  <Badge variant="outline">60 min</Badge>
                </div>
                <h3 className="font-semibold mb-2">Initial Consultation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  First session with your counselor to discuss your needs, set goals, and establish a treatment plan.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Typically 60 minutes</span>
                </div>
              </div>
            </AnimatedCard>

            {/* Example 2 */}
            <AnimatedCard delay={1.2} className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Mic className="h-12 w-12 mx-auto mb-3 opacity-80" />
                  <p className="text-sm opacity-80">Audio Session Preview</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-purple-100 text-purple-800">Audio</Badge>
                  <Badge variant="outline">30 min</Badge>
                </div>
                <h3 className="font-semibold mb-2">Follow-Up Check-In</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quick check-in session to discuss progress, address concerns, and adjust your care plan as needed.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Typically 30 minutes</span>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedGrid>
        </div>

        {/* Privacy & Security */}
        <AnimatedCard delay={1.3} className="p-8 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="h-10 w-10 text-green-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-3">Your Privacy is Our Priority</h3>
              <p className="text-muted-foreground mb-4">
                All sessions are encrypted end-to-end using industry-standard protocols. Your conversations 
                are completely confidential and protected by healthcare privacy regulations.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="bg-white dark:bg-background">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  End-to-End Encryption
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-background">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  HIPAA Ready
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-background">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  No Data Storage
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-background">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  Secure Authentication
                </Badge>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Modals */}
      <CounselorSelectionModal
        isOpen={isCounselorSelectionOpen}
        onClose={() => setIsCounselorSelectionOpen(false)}
        counselors={dummyCounselors}
        onSelectCounselor={handleSelectCounselor}
      />

      {selectedCounselor && (
        <SessionBookingModal
          counselor={selectedCounselor}
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedCounselor(null);
          }}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}
    </div>
  );
}

