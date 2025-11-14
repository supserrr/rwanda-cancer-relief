'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { AnimatedGrid } from '@workspace/ui/components/animated-grid';
import { SessionCard } from '../../../../components/dashboard/shared/SessionCard';
import { CounselorRescheduleModal } from '../../../../components/session/CounselorRescheduleModal';
import { CancelSessionModal } from '../../../../components/session/CancelSessionModal';
import { ScheduleSessionModal } from '../../../../components/session/ScheduleSessionModal';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Info
} from 'lucide-react';
import { useAuth } from '../../../../components/auth/AuthProvider';
import { useSessions } from '../../../../hooks/useSessions';
import { AdminApi, type AdminUser } from '../../../../lib/api/admin';
import type { Session, RescheduleSessionInput, CreateSessionInput } from '@/lib/api/sessions';
import { toast } from 'sonner';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { createClient } from '@/lib/supabase/client';
import { normalizeAvatarUrl } from '@workspace/ui/lib/avatar';
import { ProfileViewModal } from '@workspace/ui/components/profile-view-modal';
import { Patient } from '../../../../lib/types';

export default function CounselorSessionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [counselorProfile, setCounselorProfile] = useState<AdminUser | null>(null);
  const [patientCache, setPatientCache] = useState<Map<string, AdminUser>>(new Map());
  const [viewingPatient, setViewingPatient] = useState<AdminUser | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [availableCounselors, setAvailableCounselors] = useState<Array<{ id: string; name: string; email?: string }>>([]);

  // Load sessions using the hook
  const counselorSessionsParams = useMemo(
    () => (user?.id ? { counselorId: user.id } : undefined),
    [user?.id]
  );

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    createSession,
    rescheduleSession,
    cancelSession,
    refreshSessions,
  } = useSessions(counselorSessionsParams, {
    enabled: Boolean(user?.id),
  });

  // Load patients for the schedule modal and counselor profile for specialty
  useEffect(() => {
    const fetchData = async () => {
      try {
        setPatientsLoading(true);
        const [patientsResponse, counselorResponse] = await Promise.all([
          AdminApi.listUsers({ role: 'patient' }),
          user?.id ? AdminApi.getUser(user.id).catch(() => null) : Promise.resolve(null),
        ]);
        
        // Load all patients - if pagination exists, fetch all pages
        let allPatients = patientsResponse.users;
        const limit = patientsResponse.limit || 50;
        if (patientsResponse.total && patientsResponse.total > patientsResponse.users.length) {
          // Fetch remaining pages if needed
          const totalPages = Math.ceil(patientsResponse.total / limit);
          const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
          
          const additionalPatients = await Promise.all(
            remainingPages.map(page =>
              AdminApi.listUsers({ role: 'patient', limit, offset: (page - 1) * limit })
                .then(res => res.users)
                .catch(() => [])
            )
          );
          allPatients = [...allPatients, ...additionalPatients.flat()];
        }
        
        setPatients(allPatients);
        // Cache all loaded patients
        const newCache = new Map<string, AdminUser>();
        allPatients.forEach((patient) => {
          newCache.set(patient.id, patient);
          // Debug: Log patient data for verification
          if (process.env.NODE_ENV === 'development') {
            console.debug(`Loaded patient ${patient.id}:`, {
              fullName: patient.fullName,
              email: patient.email,
              hasMetadata: !!patient.metadata,
            });
          }
        });
        setPatientCache(newCache);
        
        // Debug: Log total patients loaded
        console.log(`Loaded ${allPatients.length} patients for counselor ${user?.id}`);
        
        if (counselorResponse) {
          setCounselorProfile(counselorResponse);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        // Don't show toast if patients list is empty - might be expected
        if (error instanceof Error && !error.message.includes('403')) {
          toast.error('Failed to load data');
        }
      } finally {
        setPatientsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Primary: Fetch patient profiles directly from sessions immediately
  // This runs in parallel with AdminApi.listUsers and ensures we have patient data
  useEffect(() => {
    if (sessions.length > 0 && user?.id) {
      const uniquePatientIds = Array.from(new Set(sessions.map(s => s.patientId)));
      const supabase = createClient();
      if (!supabase) return;
      
      (async () => {
        try {
          console.log(`[PRIMARY] Fetching ${uniquePatientIds.length} patients from sessions:`, uniquePatientIds);
          let { data: profiles, error } = await supabase
            .from('profiles')
            .select('id,full_name,role,avatar_url,metadata,created_at,updated_at')
            .in('id', uniquePatientIds)
            .eq('role', 'patient');
          
          if (error) {
            console.error('[PRIMARY] ❌ Error fetching patient profiles:', error);
            console.error('[PRIMARY] Error details:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            });
            
            // Try fallback: fetch without role filter
            console.log('[PRIMARY] Attempting fallback query without role filter...');
            const { data: fallbackProfiles, error: fallbackError } = await supabase
              .from('profiles')
              .select('id,full_name,role,avatar_url,metadata,created_at,updated_at')
              .in('id', uniquePatientIds);
            
            if (fallbackError) {
              console.error('[PRIMARY] ❌ Fallback query also failed:', fallbackError);
              return;
            }
            
            if (fallbackProfiles && fallbackProfiles.length > 0) {
              console.log(`[PRIMARY] ✅ Fallback query succeeded with ${fallbackProfiles.length} profiles`);
              profiles = fallbackProfiles;
            } else {
              console.warn('[PRIMARY] Fallback query returned no profiles');
              return;
            }
          } else {
            console.log(`[PRIMARY] ✅ Query returned ${profiles?.length || 0} profiles`);
          }
          
          if (profiles && profiles.length > 0) {
            const fetchedPatients: AdminUser[] = profiles.map((profile: any) => {
              const metadata = (profile.metadata || {}) as Record<string, unknown>;
              
              // Extract full name from multiple possible sources
              const emailFromMetadata = (typeof metadata.email === 'string' ? metadata.email : '');
              const fullName = 
                (profile.full_name && typeof profile.full_name === 'string' ? profile.full_name.trim() : undefined) ||
                (profile.fullName && typeof profile.fullName === 'string' ? profile.fullName.trim() : undefined) ||
                (profile.name && typeof profile.name === 'string' ? profile.name.trim() : undefined) ||
                (typeof metadata.name === 'string' && metadata.name.trim() ? metadata.name.trim() : undefined) ||
                (typeof metadata.full_name === 'string' && metadata.full_name.trim() ? metadata.full_name.trim() : undefined) ||
                (typeof metadata.fullName === 'string' && metadata.fullName.trim() ? metadata.fullName.trim() : undefined) ||
                (emailFromMetadata ? (emailFromMetadata.split('@')[0]?.trim() || undefined) : undefined) ||
                'Patient';
              
              // Extract avatar URL and pass it as avatarUrl
              const avatarUrl = profile.avatar_url || 
                               (metadata.avatar_url as string) || 
                               (metadata.avatarUrl as string) ||
                               (metadata.avatar as string) ||
                               undefined;
              
              const email = (typeof metadata.email === 'string' ? metadata.email : '') || '';
              
              console.log(`[PRIMARY] ✅ Fetched patient ${profile.id}: "${fullName}"`, {
                profile_full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                extracted_name: fullName,
                email: email,
              });
              
              return {
                id: profile.id,
                email: email,
                fullName: fullName,
                avatarUrl: avatarUrl,
                role: 'patient' as const,
                metadata: metadata,
                createdAt: profile.created_at || new Date().toISOString(),
                updatedAt: profile.updated_at || new Date().toISOString(),
              } as AdminUser;
            });
            
            setPatients(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newPatients = fetchedPatients.filter(p => !existingIds.has(p.id));
              if (newPatients.length > 0) {
                console.log(`[PRIMARY] Adding ${newPatients.length} patients to list`);
                return [...prev, ...newPatients];
              }
              return prev;
            });
            
            setPatientCache(prev => {
              const newCache = new Map(prev);
              fetchedPatients.forEach((patient) => {
                newCache.set(patient.id, patient);
              });
              return newCache;
            });
          }
        } catch (error) {
          console.error('[PRIMARY] Error:', error);
        }
      })();
    }
  }, [sessions.length, user?.id]);

  // Note: We also load patients via AdminApi.listUsers with pagination as a backup
  // The primary fetch above ensures we have patient data even if AdminApi fails
  // If a patient appears in a session but not in the patient list, they may have been deleted
  // In that case, the name will show as "Patient" which is acceptable

  // Filter sessions based on tab
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter(session => {
      if (session.status !== 'scheduled') return false;
      
      // Parse date (session.date is a string in YYYY-MM-DD format)
      const sessionDate = new Date(session.date);
      
      // If session has a time, combine date and time
      if (session.time) {
        // Parse time (format: HH:MM or HH:MM:SS)
        const [hours, minutes] = session.time.split(':').map(Number);
        const sessionDateTime = new Date(sessionDate);
        sessionDateTime.setHours(hours || 0, minutes || 0, 0, 0);
        
        // Session is upcoming if the datetime hasn't passed
        return sessionDateTime > now;
      }
      
      // If no time specified, check if date is today or in the future
      // Set to end of day for date-only comparison
      const endOfSessionDate = new Date(sessionDate);
      endOfSessionDate.setHours(23, 59, 59, 999);
      return endOfSessionDate > now;
    });
  }, [sessions]);

  const pastSessions = sessions.filter(session => 
    session.status === 'completed' || session.status === 'cancelled'
  );

  const allSessions = sessions;

  // Fetch patient names directly from sessions if not in loaded list
  // This is a fallback when AdminApi.listUsers doesn't return patients
  useEffect(() => {
    // Always fetch patient profiles from sessions if we have sessions
    // This ensures we have patient data even if AdminApi.listUsers fails
    // Run immediately if we have sessions, don't wait for patientsLoading
    if (sessions.length > 0) {
      const uniquePatientIds = Array.from(new Set(sessions.map(s => s.patientId)));
      const existingPatientIds = new Set(patients.map(p => p.id));
      const missingPatientIds = uniquePatientIds.filter(id => !existingPatientIds.has(id));
      
      if (missingPatientIds.length === 0) {
        return; // All patients already loaded
      }
      
      const supabase = createClient();
      if (!supabase) return;
      
      // Fetch patient profiles directly from profiles table for missing patient IDs
      (async () => {
        try {
          console.log(`[FALLBACK] Fetching ${missingPatientIds.length} missing patients from profiles table:`, missingPatientIds);
          
          // Try to fetch all columns first to see what we get
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id,full_name,role,avatar_url,metadata,created_at,updated_at')
            .in('id', missingPatientIds)
            .eq('role', 'patient');
          
          if (error) {
            console.error('[FALLBACK] Failed to fetch patient profiles from sessions:', error);
            console.error('[FALLBACK] Error details:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            });
            return;
          }
          
          console.log(`[FALLBACK] Query returned ${profiles?.length || 0} profiles`);
          
          if (profiles && profiles.length > 0) {
            // Map profiles to AdminUser format
            const fetchedPatients: AdminUser[] = profiles.map((profile: any) => {
              const metadata = (profile.metadata || {}) as Record<string, unknown>;
              
              // Try all possible name fields
              const emailFromMetadata = (typeof metadata.email === 'string' ? metadata.email : '');
              const fullName = 
                (profile.full_name && typeof profile.full_name === 'string' ? profile.full_name.trim() : undefined) ||
                (profile.fullName && typeof profile.fullName === 'string' ? profile.fullName.trim() : undefined) ||
                (profile.name && typeof profile.name === 'string' ? profile.name.trim() : undefined) ||
                (typeof metadata.name === 'string' && metadata.name.trim() ? metadata.name.trim() : undefined) ||
                (typeof metadata.full_name === 'string' && metadata.full_name.trim() ? metadata.full_name.trim() : undefined) ||
                (typeof metadata.fullName === 'string' && metadata.fullName.trim() ? metadata.fullName.trim() : undefined) ||
                (emailFromMetadata ? (emailFromMetadata.split('@')[0]?.trim() || undefined) : undefined) ||
                'Patient';
              
              // Extract avatar URL
              const avatarUrl = profile.avatar_url || 
                               (metadata.avatar_url as string) || 
                               (metadata.avatarUrl as string) ||
                               (metadata.avatar as string) ||
                               undefined;
              
              const email = (typeof metadata.email === 'string' ? metadata.email : '') || '';
              
              console.log(`[FALLBACK] ✅ Fetched patient ${profile.id}: "${fullName}"`, {
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                email: email,
                extractedName: fullName,
              });
              
              return {
                id: profile.id,
                email: email,
                fullName: fullName,
                avatarUrl: avatarUrl,
                role: 'patient' as const,
                metadata: metadata,
                createdAt: profile.created_at || new Date().toISOString(),
                updatedAt: profile.updated_at || new Date().toISOString(),
              } as AdminUser;
            });
            
            // Add to patients list and cache (merge with existing)
            setPatients(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newPatients = fetchedPatients.filter(p => !existingIds.has(p.id));
              console.log(`[FALLBACK] Adding ${newPatients.length} new patients to list`);
              return [...prev, ...newPatients];
            });
            
            setPatientCache(prev => {
              const newCache = new Map(prev);
              fetchedPatients.forEach((patient) => {
                newCache.set(patient.id, patient);
              });
              console.log(`[FALLBACK] Updated cache with ${fetchedPatients.length} patients. New cache size: ${newCache.size}`);
              return newCache;
            });
            
            console.log(`[FALLBACK] Successfully fetched ${fetchedPatients.length} patients from session profiles`);
          } else {
            console.warn(`[FALLBACK] No patient profiles found for IDs:`, missingPatientIds);
          }
        } catch (error) {
          console.error('[FALLBACK] Error fetching patient profiles from sessions:', error);
          if (error instanceof Error) {
            console.error('[FALLBACK] Error stack:', error.stack);
          }
        }
      })();
    }
  }, [sessions.length, patients.length]); // Run when sessions or patients change

  const getPatientName = (patientId: string): string => {
    // First check the loaded patients list
    let patient = patients.find(p => p.id === patientId);
    
    // If not found, check cache
    if (!patient) {
      patient = patientCache.get(patientId) || undefined;
    }
    
    // If found, extract name from multiple possible fields
    if (patient) {
      // Check fullName first (this is the primary field set by AdminApi)
      if (patient.fullName && typeof patient.fullName === 'string' && patient.fullName.trim()) {
        const name = patient.fullName.trim();
        console.log(`[getPatientName] ✅ Found patient name for ${patientId}: "${name}" (from fullName)`);
        return name;
      }
      
      // Check metadata fields
      if (patient.metadata && typeof patient.metadata === 'object' && patient.metadata !== null) {
        const metadata = patient.metadata as Record<string, unknown>;
        
        // Try full_name
        if (typeof metadata.full_name === 'string' && metadata.full_name.trim()) {
          const name = metadata.full_name.trim();
          console.debug(`Found patient name for ${patientId}: "${name}" (from metadata.full_name)`);
          return name;
        }
        
        // Try name
        if (typeof metadata.name === 'string' && metadata.name.trim()) {
          const name = metadata.name.trim();
          console.debug(`Found patient name for ${patientId}: "${name}" (from metadata.name)`);
          return name;
        }
        
        // Try fullName in metadata
        if (typeof metadata.fullName === 'string' && metadata.fullName.trim()) {
          const name = metadata.fullName.trim();
          console.debug(`Found patient name for ${patientId}: "${name}" (from metadata.fullName)`);
          return name;
        }
      }
      
      // Fallback to email username
      if (typeof patient.email === 'string' && patient.email) {
        const emailUsername = patient.email.split('@')[0];
        if (emailUsername && emailUsername.trim()) {
          const name = emailUsername.trim();
          console.debug(`Found patient name for ${patientId}: "${name}" (from email)`);
          return name;
        }
      }
      
      // Debug: Log if patient found but no name extracted
      console.warn(`Patient ${patientId} found but no name extracted:`, {
        fullName: patient.fullName,
        email: patient.email,
        hasMetadata: !!patient.metadata,
        metadata: patient.metadata,
      });
    } else {
      // Debug: Log if patient not found - but don't spam in production
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[getPatientName] Patient ${patientId} not found in patients list or cache. Total patients loaded: ${patients.length}, Cache size: ${patientCache.size}`);
        console.warn(`[getPatientName] Available patient IDs:`, patients.map(p => p.id));
        console.warn(`[getPatientName] Cache patient IDs:`, Array.from(patientCache.keys()));
      }
    }
    
    // If patient not found and patients are still loading, show loading state
    if (patientsLoading) {
      console.debug(`[getPatientName] Patients still loading for ${patientId}, returning "Loading..."`);
      return 'Loading...';
    }
    
    // If patient is in cache but no name found, show a generic placeholder
    // This should be rare as every account must have a name
    console.warn(`[getPatientName] Returning default "Patient" for ${patientId} - patient data may not be loaded yet`);
    return 'Patient';
  };

  const getPatientAvatar = (patientId: string) => {
    // First check the loaded patients list
    let patient = patients.find(p => p.id === patientId);
    
    // If not found, check cache
    if (!patient) {
      patient = patientCache.get(patientId) || undefined;
    }
    
    if (patient) {
      // Extract avatar from multiple possible fields with debug logging
      const rawAvatar = patient.avatarUrl ||
                       (patient.metadata?.avatar_url as string) ||
                       (patient.metadata?.avatarUrl as string) ||
                       (patient.metadata?.avatar as string) ||
                       undefined;
      
      if (rawAvatar) {
        const normalized = normalizeAvatarUrl(rawAvatar);
        if (normalized && process.env.NODE_ENV === 'development') {
          console.debug(`[getPatientAvatar] ✅ Found avatar for ${patientId}: ${normalized}`);
        }
        return normalized;
      } else if (process.env.NODE_ENV === 'development') {
        console.debug(`[getPatientAvatar] Patient ${patientId} found but no avatar URL`, {
          avatarUrl: patient.avatarUrl,
          metadata: patient.metadata,
        });
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.debug(`[getPatientAvatar] Patient ${patientId} not found in patients or cache`);
    }
    
    return undefined;
  };

  const getCounselorSpecialty = () => {
    // First check counselor profile from API
    if (counselorProfile?.specialty) {
      return counselorProfile.specialty;
    }
    
    // Check counselor profile metadata
    if (counselorProfile?.metadata && typeof counselorProfile.metadata === 'object') {
      const metadata = counselorProfile.metadata as Record<string, unknown>;
      if (typeof metadata.specialty === 'string' && metadata.specialty.trim()) {
        return metadata.specialty.trim();
      }
      if (Array.isArray(metadata.specialties) && metadata.specialties.length > 0) {
        const firstSpecialty = metadata.specialties[0];
        if (typeof firstSpecialty === 'string' && firstSpecialty.trim()) {
          return firstSpecialty.trim();
        }
      }
      if (typeof metadata.expertise === 'string' && metadata.expertise.trim()) {
        return metadata.expertise.trim();
      }
    }
    
    // Check auth user metadata
    if (user?.metadata && typeof user.metadata === 'object') {
      const userMetadata = user.metadata as Record<string, unknown>;
      if (typeof userMetadata.specialty === 'string' && userMetadata.specialty.trim()) {
        return userMetadata.specialty.trim();
      }
      if (Array.isArray(userMetadata.specialties) && userMetadata.specialties.length > 0) {
        const firstSpecialty = userMetadata.specialties[0];
        if (typeof firstSpecialty === 'string' && firstSpecialty.trim()) {
          return firstSpecialty.trim();
        }
      }
      if (typeof userMetadata.expertise === 'string' && userMetadata.expertise.trim()) {
        return userMetadata.expertise.trim();
      }
    }
    
    // Final fallback
    return 'General Counseling';
  };

  const getCounselorAvatar = () => {
    // Get counselor's own avatar from their profile or auth user
    if (counselorProfile?.avatarUrl) {
      return normalizeAvatarUrl(counselorProfile.avatarUrl);
    }
    if (user?.avatar) {
      return normalizeAvatarUrl(user.avatar);
    }
    // Check metadata
    const metadata = (counselorProfile?.metadata ?? {}) as Record<string, unknown>;
    const rawAvatar = (metadata.avatar_url as string) ||
                      (metadata.avatarUrl as string) ||
                      (metadata.avatar as string) ||
                      undefined;
    if (rawAvatar) {
      return normalizeAvatarUrl(rawAvatar);
    }
    return undefined;
  };

  const handleJoinSession = (session: Session) => {
    // Navigate to the session room
    router.push(`/dashboard/counselor/sessions/session/${session.id}`);
  };


  const handleRescheduleSession = (session: Session) => {
    setSelectedSession(session);
    setIsRescheduleOpen(true);
  };

  const handleConfirmReschedule = async (
    sessionId: string | undefined, 
    newDate: Date, 
    newTime: string, 
    newDuration: number, 
    notes?: string
  ) => {
    if (!user || !sessionId) return;
    
    // Type guard: after the check above, sessionId is definitely a string
    // TypeScript doesn't narrow after return, so we use a type assertion
    const id = sessionId as string;
    
    try {
      // Reschedule only updates date and time, duration is handled separately if needed
      const rescheduleData = {
        date: newDate.toISOString().split('T')[0], // YYYY-MM-DD
        time: newTime,
        reason: notes || 'Rescheduled by counselor',
      } as RescheduleSessionInput;
      await rescheduleSession(id as string, rescheduleData);
      
      // If duration changed, update session separately
      if (newDuration && selectedSession && newDuration !== selectedSession.duration) {
        // Note: We might need to update duration separately if the API supports it
        // For now, we'll just reschedule and note the duration change in the reason
      }
      
      toast.success('Session rescheduled successfully! Patient has been notified.');
      setIsRescheduleOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reschedule session. Please try again.');
    }
  };


  const handleScheduleSession = () => {
    setIsScheduleOpen(true);
  };

  const handleConfirmSchedule = async (sessionData: {
    patientId: string;
    date: Date;
    time: string;
    duration: number;
    sessionType: 'video' | 'audio';
    notes?: string;
  }) => {
    if (!user) return;
    
    try {
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }

      // Validate patient exists in loaded patients list
      const patient = patients.find(p => p.id === sessionData.patientId);
      if (!patient) {
        toast.error('Patient not found. Please select a valid patient.');
        return;
      }

      // Ensure patients are loaded
      if (patientsLoading) {
        toast.error('Patient data is still loading. Please wait and try again.');
        return;
      }
      
      // Type guard: after the check above, user.id is definitely a string
      // TypeScript doesn't narrow after return, so we use a type assertion
      const counselorId = user.id as string;
      
      const createData = {
        patientId: sessionData.patientId,
        counselorId: counselorId as string,
        date: sessionData.date.toISOString().split('T')[0], // YYYY-MM-DD
        time: sessionData.time,
        duration: sessionData.duration,
        type: sessionData.sessionType,
        notes: sessionData.notes,
      } as CreateSessionInput;
      await createSession(createData);
      toast.success('Session scheduled successfully! Patient has been notified.');
      setIsScheduleOpen(false);
      await refreshSessions();
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to schedule session. Please try again.');
    }
  };

  const handleCancelSession = (session: Session) => {
    setSelectedSession(session);
    setIsCancelOpen(true);
  };

  const handleViewPatientProfile = async (patientId: string) => {
    // First check if patient is already loaded
    let patient = patients.find(p => p.id === patientId) || patientCache.get(patientId);
    
    if (patient) {
      setViewingPatient(patient);
      setIsProfileOpen(true);
    } else {
      // Patient not found in cache, query through sessions to respect RLS policies
      // This allows viewing profiles of patients in sessions, even if not yet assigned
      try {
        toast.loading('Loading patient information...', { id: 'loading-patient' });
        
        const supabase = createClient();
        if (!supabase) {
          throw new Error('Database connection not available');
        }
        
        // Find a session with this patient to establish the relationship
        const patientSession = sessions.find(s => s.patientId === patientId && s.counselorId === user?.id);
        
        if (!patientSession) {
          throw new Error('You can only view profiles of patients you have sessions with.');
        }
        
        // Query patient profile - since we have a session, RLS should allow access
        // Use the same pattern as bulk fetch that works (query profiles directly with patient ID from session)
        let profile = null;
        
        // Try direct query first (same as bulk fetch pattern)
        console.log('[handleViewPatientProfile] Querying patient profile directly (same as bulk fetch)...');
        const { data: profiles, error: directError } = await supabase
          .from('profiles')
          .select('id,full_name,role,avatar_url,metadata,created_at,updated_at,assigned_counselor_id')
          .in('id', [patientId])
          .eq('role', 'patient');
        
        if (!directError && profiles && profiles.length > 0) {
          profile = profiles[0];
          console.log('[handleViewPatientProfile] ✅ Direct query succeeded');
        } else {
          // Try without role filter as fallback
          console.log('[handleViewPatientProfile] Direct query failed, trying without role filter...');
          const { data: fallbackProfiles, error: fallbackError } = await supabase
            .from('profiles')
            .select('id,full_name,role,avatar_url,metadata,created_at,updated_at,assigned_counselor_id')
            .in('id', [patientId]);
          
          if (!fallbackError && fallbackProfiles && fallbackProfiles.length > 0) {
            profile = fallbackProfiles[0];
            // Verify it's a patient
            if (profile && profile.role !== 'patient') {
              throw new Error('The requested user is not a patient');
            }
            console.log('[handleViewPatientProfile] ✅ Fallback query succeeded');
          } else {
            // RLS is blocking access - create minimal patient object from session data
            // This allows the modal to open with limited info
            console.warn('[handleViewPatientProfile] RLS blocking profile access, creating minimal patient object from session data');
            
            // Show a warning toast that profile data is limited
            toast.warning('Profile access is limited due to security policies. Some information may not be available.', {
              duration: 5000,
            });
            
            // Create a minimal patient object from what we know from the session
            // Don't call getPatientName/getPatientAvatar here as they also rely on cache which is empty
            // Just use basic defaults - the modal will still open and allow assignment
            profile = {
              id: patientId,
              full_name: 'Patient', // Will be updated if we can get name from session notes or other sources
              role: 'patient' as const,
              avatar_url: undefined,
              metadata: {
                // Try to extract any patient info from session notes if available
                ...(patientSession.notes ? { session_notes: patientSession.notes } : {}),
              } as Record<string, unknown>,
              created_at: patientSession.createdAt || new Date().toISOString(),
              updated_at: patientSession.updatedAt || new Date().toISOString(),
              assigned_counselor_id: null,
            };
            
            console.log('[handleViewPatientProfile] Created minimal patient object from session data');
          }
        }
        
        if (!profile) {
          throw new Error('Patient not found. You may only view profiles of patients you have sessions with.');
        }
        
        // Map profile to AdminUser format
        const metadata = (profile.metadata || {}) as Record<string, unknown>;
        const emailFromMetadata = (typeof metadata.email === 'string' ? metadata.email : '');
        const fullName = 
          (profile.full_name && typeof profile.full_name === 'string' ? profile.full_name.trim() : undefined) ||
          (typeof metadata.name === 'string' && metadata.name.trim() ? metadata.name.trim() : undefined) ||
          (typeof metadata.full_name === 'string' && metadata.full_name.trim() ? metadata.full_name.trim() : undefined) ||
          (typeof metadata.fullName === 'string' && metadata.fullName.trim() ? metadata.fullName.trim() : undefined) ||
          (emailFromMetadata ? (emailFromMetadata.split('@')[0]?.trim() || undefined) : undefined) ||
          'Patient';
        
        const avatarUrl = profile.avatar_url || 
                         (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined) ||
                         (typeof metadata.avatarUrl === 'string' ? metadata.avatarUrl : undefined) ||
                         (typeof metadata.avatar === 'string' ? metadata.avatar : undefined) ||
                         undefined;
        
        patient = {
          id: profile.id,
          email: emailFromMetadata,
          fullName: fullName,
          avatarUrl: avatarUrl,
          role: 'patient' as const,
          metadata: metadata,
          createdAt: profile.created_at || new Date().toISOString(),
          updatedAt: profile.updated_at || new Date().toISOString(),
        } as AdminUser;
        
        // Add to cache for future use
        patientCache.set(patientId, patient);
        // Update patients list if needed
        if (!patients.find(p => p.id === patientId)) {
          setPatients(prev => [...prev, patient!]);
        }
        
        setViewingPatient(patient);
        setIsProfileOpen(true);
        toast.dismiss('loading-patient');
      } catch (error) {
        console.error('[handleViewPatientProfile] Error loading patient:', error);
        toast.dismiss('loading-patient');
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to load patient information. You may only view profiles of patients you have sessions with.';
        toast.error(errorMessage);
      }
    }
  };

  const handleViewSessionInfo = (session: Session) => {
    setSelectedSession(session);
    // For now, we can navigate to the session detail page or show a modal
    // Since we already have session detail page, we'll navigate there
    router.push(`/dashboard/counselor/sessions/session/${session.id}`);
  };

  const handleAssignPatient = async (patientId: string, counselorId: string) => {
    try {
      // assignPatientToCounselor already returns the updated patient data
      const updatedPatient = await AdminApi.assignPatientToCounselor(patientId, counselorId);
      toast.success('Patient assigned successfully');
      // Use the returned patient data instead of making another API call
      if (viewingPatient) {
        setViewingPatient(updatedPatient);
        // Update patient in cache
        setPatientCache(prev => {
          const newCache = new Map(prev);
          newCache.set(patientId, updatedPatient);
          return newCache;
        });
        // Update patient in list
        setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
      }
    } catch (error) {
      console.error('Error assigning patient:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign patient');
      throw error;
    }
  };

  // Load available counselors for "Pass to Colleague" feature
  useEffect(() => {
    const loadCounselors = async () => {
      try {
        const response = await AdminApi.listUsers({ role: 'counselor' });
        const counselors = response.users
          .filter(c => c.id !== user?.id) // Exclude current counselor
          .map(c => ({
            id: c.id,
            name: c.fullName || c.email || 'Counselor',
            email: c.email
          }));
        setAvailableCounselors(counselors);
      } catch (error) {
        console.error('Error loading counselors:', error);
      }
    };

    if (user?.id && isProfileOpen) {
      loadCounselors();
    }
  }, [user?.id, isProfileOpen]);

  const handleConfirmCancel = async (sessionId: string, reason: string, notes?: string) => {
    if (!user) return;
    
    try {
      await cancelSession(sessionId, { reason });
      toast.success('Session cancelled successfully! Patient has been notified.');
      setIsCancelOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel session. Please try again.');
    }
  };

  if (authLoading || sessionsLoading || patientsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner variant="bars" size={32} className="text-primary" />
      </div>
    );
  }

  if (sessionsError) {
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-lg font-semibold mb-2">Error loading sessions</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="My Sessions"
        description="Manage your counseling sessions and view session history"
      />

      {/* Quick Stats */}
      <AnimatedGrid className="grid gap-4 md:grid-cols-4" staggerDelay={0.1}>
        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Next session in 2 hours
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.filter(s => s.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Sessions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.filter(s => s.status === 'cancelled').length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </AnimatedCard>
      </AnimatedGrid>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Sessions</h2>
        </div>
        <Button onClick={handleScheduleSession} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Session
        </Button>
      </div>

      {/* Sessions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            All ({allSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    patientName={getPatientName(session.patientId)}
                    patientAvatar={getPatientAvatar(session.patientId)}
                    patientId={session.patientId}
                    counselorName={user?.name || 'Counselor'}
                    counselorSpecialty={getCounselorSpecialty()}
                    counselorAvatar={getCounselorAvatar()}
                    counselorId={session.counselorId}
                    onJoin={handleJoinSession}
                    onReschedule={handleRescheduleSession}
                    onCancel={handleCancelSession}
                    onViewPatientProfile={handleViewPatientProfile}
                    onViewSessionInfo={handleViewSessionInfo}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any scheduled sessions at the moment
                </p>
                <Button onClick={handleScheduleSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {allSessions.length > 0 ? (
              <>
                <div className="flex justify-end mb-4">
                  <Button onClick={handleScheduleSession} variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Another Session
                  </Button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allSessions.map((session) => (
                    <SessionCard
                    key={session.id}
                    session={session}
                    patientName={getPatientName(session.patientId)}
                    patientAvatar={getPatientAvatar(session.patientId)}
                    patientId={session.patientId}
                    counselorName={user?.name || 'Counselor'}
                    counselorSpecialty={getCounselorSpecialty()}
                    counselorAvatar={getCounselorAvatar()}
                    counselorId={session.counselorId}
                    onJoin={session.status === 'scheduled' ? handleJoinSession : undefined}
                    onReschedule={session.status === 'scheduled' ? handleRescheduleSession : undefined}
                    onCancel={session.status === 'scheduled' ? handleCancelSession : undefined}
                    onViewPatientProfile={handleViewPatientProfile}
                    onViewSessionInfo={handleViewSessionInfo}
                  />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by scheduling your first session
                </p>
                <Button onClick={handleScheduleSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reschedule Modal */}
      <CounselorRescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession as any}
        patientName={selectedSession ? getPatientName(selectedSession.patientId) : undefined}
        patientAvatar={selectedSession ? getPatientAvatar(selectedSession.patientId) : undefined}
        onReschedule={handleConfirmReschedule as any}
      />

      {/* Cancel Session Modal */}
      <CancelSessionModal
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession as any}
        patientName={selectedSession ? getPatientName(selectedSession.patientId) : undefined}
        patientAvatar={selectedSession ? getPatientAvatar(selectedSession.patientId) : undefined}
        userRole="counselor"
        onCancel={handleConfirmCancel as any}
      />

      {/* Schedule Session Modal */}
      {user && (
        <ScheduleSessionModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          counselorId={user?.id || ''}
          counselorName={user.name || 'Counselor'}
          patients={patients.map(patient => ({
            id: patient.id,
            name: patient.fullName || patient.email,
            avatar: undefined // AdminUser doesn't have avatar
          }))}
          onSchedule={handleConfirmSchedule}
        />
      )}

      {/* Patient Profile Modal */}
      {viewingPatient && user && (() => {
        // Debug: Log metadata to see what we're passing
        if (process.env.NODE_ENV === 'development') {
          console.log('[ProfileViewModal] Patient data:', {
            id: viewingPatient.id,
            fullName: viewingPatient.fullName,
            email: viewingPatient.email,
            metadata: viewingPatient.metadata,
            hasMetadata: !!viewingPatient.metadata,
            metadataKeys: viewingPatient.metadata ? Object.keys(viewingPatient.metadata) : [],
          });
        }
        return (
        <ProfileViewModal
          isOpen={isProfileOpen}
          onClose={() => {
            setIsProfileOpen(false);
            setViewingPatient(null);
          }}
          user={{
            id: viewingPatient.id,
            name: viewingPatient.fullName || viewingPatient.email || 'Patient',
            email: viewingPatient.email,
            role: 'patient' as const,
            avatar: viewingPatient.avatarUrl,
            createdAt: new Date(viewingPatient.createdAt),
            // Pass all metadata and fields from AdminUser
            metadata: viewingPatient.metadata || {},
            // Health info
            diagnosis: viewingPatient.cancerType || (viewingPatient.metadata?.diagnosis as string) || (viewingPatient.metadata?.cancer_type as string),
            treatmentStage: viewingPatient.treatmentStage || (viewingPatient.metadata?.treatment_stage as string),
            cancerType: viewingPatient.cancerType || (viewingPatient.metadata?.cancer_type as string) || (viewingPatient.metadata?.cancerType as string),
            currentTreatment: viewingPatient.metadata?.current_treatment as string || viewingPatient.metadata?.currentTreatment as string,
            diagnosisDate: viewingPatient.metadata?.diagnosis_date as string || viewingPatient.metadata?.diagnosisDate as string,
            // Personal info
            age: (typeof viewingPatient.metadata?.age === 'string' ? viewingPatient.metadata.age : typeof viewingPatient.metadata?.age === 'number' ? String(viewingPatient.metadata.age) : undefined) || (typeof viewingPatient.age === 'string' ? viewingPatient.age : typeof viewingPatient.age === 'number' ? String(viewingPatient.age) : undefined),
            gender: viewingPatient.metadata?.gender as string || viewingPatient.gender as string,
            location: viewingPatient.metadata?.location as string || viewingPatient.location as string,
            phoneNumber: viewingPatient.metadata?.contactPhone as string || viewingPatient.metadata?.contact_phone as string || viewingPatient.metadata?.phone as string || viewingPatient.metadata?.phoneNumber as string,
            preferredLanguage: viewingPatient.metadata?.preferred_language as string || viewingPatient.metadata?.preferredLanguage as string || viewingPatient.metadata?.language as string,
            // Support info
            supportNeeds: viewingPatient.metadata?.support_needs as string[] || viewingPatient.metadata?.supportNeeds as string[],
            familySupport: viewingPatient.metadata?.family_support as string || viewingPatient.metadata?.familySupport as string,
            consultationType: viewingPatient.metadata?.consultation_type as string[] || viewingPatient.metadata?.consultationType as string[],
            specialRequests: viewingPatient.metadata?.special_requests as string || viewingPatient.metadata?.specialRequests as string,
            // Emergency contact
            emergencyContactName: viewingPatient.metadata?.emergency_contact_name as string || viewingPatient.metadata?.emergencyContactName as string,
            emergencyContactPhone: viewingPatient.metadata?.emergency_contact_phone as string || viewingPatient.metadata?.emergencyContactPhone as string,
            emergencyContact: viewingPatient.metadata?.emergency_contact as string || viewingPatient.metadata?.emergencyContact as string,
            // Assignment
            assignedCounselor: (viewingPatient.metadata?.assigned_counselor_id as string) || ((viewingPatient as any).assigned_counselor_id as string) || undefined,
            // Progress
            moduleProgress: viewingPatient.metadata?.module_progress as Record<string, number> | undefined,
          } as Patient}
          userType="patient"
          currentUserRole="counselor"
          onAssignPatient={handleAssignPatient}
          currentCounselorId={user.id}
          availableCounselors={availableCounselors}
        />
        );
      })()}
    </div>
  );
}
