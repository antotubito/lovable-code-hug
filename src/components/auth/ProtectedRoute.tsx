import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '../../lib/supabase';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, refreshUser } = useAuth();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Direct check with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // If we have a session but no user data, refresh the user
        if (session && !user) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [user, refreshUser]);

  // Show loading state while checking auth
  if (loading || checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to waitlist if not authenticated
  if (!user && !isAuthenticated) {
    // Store the attempted URL for redirect after login
    localStorage.setItem('redirectUrl', location.pathname);
    
    // Redirect to waitlist
    return <Navigate to="/waitlist" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not completed
  if (user && !user.onboardingComplete && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />;
  }

  // Render protected content
  return <>{children}</>;
}