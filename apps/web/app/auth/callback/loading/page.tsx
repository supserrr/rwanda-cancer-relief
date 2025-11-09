'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner'
import { Progress } from '@workspace/ui/components/ui/progress'

import { createClient } from '@/lib/supabase/client'
import { getOnboardingRoute, isOnboardingComplete, type User, type UserRole } from '@/lib/auth'

const STORAGE_KEY = 'rcr.oauth.payload'

const getMetadataString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  return undefined
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export default function AuthCallbackLoadingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const roleParam = searchParams.get('role')
  const nextParam = searchParams.get('next')
  const errorParam = searchParams.get('error')

  const [status, setStatus] = useState('Connecting you with Rwanda Cancer Relief…')
  const [detail, setDetail] = useState('Preparing secure access to your counseling and care resources.')
  const [progress, setProgress] = useState(12)
  const [error, setError] = useState<string | null>(null)
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    let isMounted = true

    const setStep = (value: number, headline: string, message: string) => {
      if (!isMounted) return
      setProgress(clampProgress(value))
      setStatus(headline)
      setDetail(message)
    }

    const fail = (message: string, description?: string) => {
      if (!isMounted) return
      const resolved = description ?? message
      setError(resolved)
      setStatus('We need a quick restart')
      setDetail(resolved || 'We could not complete your sign in just yet. Please try again or reach out to our care team.')
      setProgress(0)
      setShowRetry(true)
    }

    if (errorParam) {
      fail(errorParam)
      return () => {
        isMounted = false
      }
    }

    const supabase = createClient()
    if (!supabase) {
      fail('Our authentication service is not configured. Please try again later.')
      return () => {
        isMounted = false
      }
    }

    setStep(18, 'Confirming your sign-in request…', 'We are securely verifying your credentials. Thank you for your patience.')

    const run = async () => {
      try {
        let hashPayload = ''
        try {
          if (typeof window !== 'undefined') {
            hashPayload = window.sessionStorage.getItem(STORAGE_KEY) || ''
            if (!hashPayload && window.location.hash) {
              hashPayload = window.location.hash.substring(1)
            }
          }
        } catch (storageError) {
          console.error('OAuth callback storage read error', storageError)
          fail('We could not access secure storage in this browser. Please try signing in again.')
          return
        }

        if (!hashPayload) {
          fail('We could not find your sign-in details. Please start the sign-in flow again.')
          return
        }

        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.removeItem(STORAGE_KEY)
          } catch (removeError) {
            console.warn('Unable to clear OAuth payload from storage', removeError)
          }
        }

        const fragmentParams = new URLSearchParams(hashPayload)
        const accessToken = fragmentParams.get('access_token')
        const refreshToken = fragmentParams.get('refresh_token')
        const fragmentError = fragmentParams.get('error') || fragmentParams.get('error_description')

        if (fragmentError) {
          fail('We were unable to finish signing you in.', fragmentError)
          return
        }

        if (!accessToken) {
          fail('We could not find the secure token we need. Please try again.')
          return
        }

        setStep(36, 'Activating your secure session…', 'Opening the doorway to your Rwanda Cancer Relief support network.')

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? '',
        })

        if (sessionError || !session) {
          console.error('Supabase setSession error', sessionError)
          fail('We could not establish your secure session. Please sign in again.')
          return
        }

        setStep(58, 'Personalizing your care experience…', 'Reviewing your onboarding progress and support preferences.')

        const userMetadata = session.user.user_metadata ?? {}
        const resolvedRole = (userMetadata.role as UserRole) || (roleParam as UserRole) || 'patient'

        if (roleParam && (!userMetadata.role || userMetadata.role === 'guest')) {
          supabase.auth
            .updateUser({
              data: {
                ...userMetadata,
                role: roleParam,
              },
            })
            .catch((updateError) => {
              console.warn('Failed to persist user role after OAuth callback', updateError)
            })
        }

        const metadataFullName =
          getMetadataString(userMetadata.full_name) ??
          getMetadataString(userMetadata.name)
        const metadataAvatar = getMetadataString(userMetadata.avatar_url) ?? getMetadataString(userMetadata.avatar)

        const onboardingUser: User = {
          id: session.user.id,
          email: session.user.email ?? '',
          name: metadataFullName ?? session.user.email ?? '',
          role: resolvedRole,
          avatar: metadataAvatar,
          isVerified: session.user.email_confirmed_at !== null,
          createdAt: session.user.created_at ? new Date(session.user.created_at) : new Date(),
          updatedAt: session.user.updated_at ? new Date(session.user.updated_at) : new Date(),
          metadata: { ...userMetadata },
        }

        const onboardingComplete = isOnboardingComplete(onboardingUser)

        let nextPath = typeof nextParam === 'string' && nextParam.startsWith('/') ? nextParam : ''

        if (!onboardingComplete) {
          setStep(76, 'Almost there…', 'We will guide you through onboarding to tailor your support plan.')
          nextPath = getOnboardingRoute(resolvedRole)
        } else {
          setStep(76, 'Loading your dashboard…', 'Gathering the latest updates from your care team.')
          if (!nextPath || nextPath === '/') {
            if (resolvedRole === 'counselor') {
              nextPath = '/dashboard/counselor'
            } else if (resolvedRole === 'patient') {
              nextPath = '/dashboard/patient'
            } else if (resolvedRole === 'admin') {
              nextPath = '/dashboard/admin'
            } else {
              nextPath = '/'
            }
          }
        }

        setStep(92, 'Final wellness checks…', 'Making sure everything is ready before we redirect you.')

        await supabase.auth.getSession()

        setStep(100, 'Redirecting now…', 'Welcome back to Rwanda Cancer Relief—your support network is ready.')
        router.replace(nextPath)
      } catch (err) {
        console.error('Unexpected error during OAuth callback processing', err)
        fail('Something went wrong while finishing your sign in. Please try again.')
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [router, roleParam, nextParam, errorParam])

  const handleSignIn = () => {
    router.replace('/signin')
  }

  const handleSupport = () => {
    router.replace('/contact')
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-[-4rem] h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-xl border-primary/15 bg-card/90 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Spinner variant="bars" size={40} className={showRetry ? 'text-destructive' : 'text-primary'} />
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground">{status}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {detail}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Progress value={clampProgress(progress)} className="h-2 bg-primary/15" />

          {showRetry ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                {error ?? 'We were unable to finish signing you in. Please try again or contact our care team.'}
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button onClick={handleSignIn}>Return to Sign In</Button>
                <Button variant="outline" onClick={handleSupport}>
                  Contact Support
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              We will redirect you automatically as soon as everything is set.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
