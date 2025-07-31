import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { user, loading, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/waitlist',
    '/app/login',
    '/app/register',
    '/app/terms',
    '/app/test-terms',
    '/terms',
    '/privacy',
    '/testing',
    '/testing/login',
    '/verify',
    '/confirm',
    '/confirmed',
    '/share',
    '/app/reset-password'
  ];

  useEffect(() => {
    const checkSession = async () => {
      const isPublicPath = publicPaths.some(path => 
        location.pathname === path || location.pathname.startsWith(`${path}/`)
      );

      if (!loading && !isPublicPath) {
        try {
          // Check if we have a valid session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            logger.error('Session error:', error);
            if (error.message?.includes('Invalid Refresh Token') || 
                error.message?.includes('refresh_token_not_found')) {
              await supabase.auth.signOut();
              // Store the attempted URL for redirect after login
              if (location.pathname.startsWith('/app')) {
                localStorage.setItem('redirectUrl', location.pathname);
              }
              navigate('/app/login');
              return;
            }
            throw error;
          }
          
          if (!session) {
            // Store the attempted URL for redirect after login
            if (location.pathname.startsWith('/app')) {
              localStorage.setItem('redirectUrl', location.pathname);
              navigate('/app/login');
            } else {
              navigate('/waitlist');
            }
          } else if (!user) {
            // We have a session but no user data, refresh the user
            await refreshUser();
          } else if (!user.onboardingComplete && !location.pathname.startsWith('/app/onboarding')) {
            // Redirect to onboarding if not completed
            navigate('/app/onboarding');
          }
        } catch (error) {
          logger.error('Error checking session:', error);
          navigate('/app/login');
        } finally {
          setIsCheckingSession(false);
        }
      } else {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [user, loading, location.pathname, navigate, refreshUser]);

  // Show loading state while checking auth
  if (loading || isCheckingSession) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}