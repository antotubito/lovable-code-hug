import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { ProfileView } from '../components/profile/ProfileView';
import { ProfileEdit } from '../components/profile/ProfileEdit';
import { ProfileActions } from '../components/profile/ProfileActions';
import { updateProfile, getCurrentProfile } from '../lib/profile';
import { sendTierNotifications } from '../lib/notifications';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function Profile() {
  const { user, refreshUser, connectionStatus, reconnectSupabase } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState(user);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [notificationSent, setNotificationSent] = useState(false);

  // Check authentication status and load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        const hasSession = !!session;
        setIsAuthenticated(hasSession);
        
        if (hasSession) {
          // If we have a session but no user data, fetch it directly
          if (!user) {
            const profileData = await getCurrentProfile();
            if (profileData) {
              setLocalUser(profileData);
            } else {
              // If we couldn't get profile data, try refreshing user through auth context
              await refreshUser();
              setLocalUser(user);
            }
          } else {
            // If we already have user data, use it
            setLocalUser(user);
          }
        }
      } catch (error) {
        logger.error('Error loading profile data:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [user, refreshUser]);

  // Handle profile save
  const handleSave = async (updates: Partial<typeof user>, notifyTiers?: number[]) => {
    setSaving(true);
    setError(null);
    setNotificationSent(false);
    
    try {
      // Update profile in database
      const updatedUser = await updateProfile(updates);
      
      // Update local state
      setLocalUser(updatedUser);
      
      // Refresh user in auth context
      await refreshUser();
      
      // Send notifications to selected tiers if provided
      if (notifyTiers && notifyTiers.length > 0) {
        // Determine which fields were updated
        const updatedFields: string[] = [];
        
        if (updates.firstName || updates.lastName) updatedFields.push('name');
        if (updates.jobTitle) updatedFields.push('jobTitle');
        if (updates.company) updatedFields.push('company');
        if (updates.bio?.location) updatedFields.push('location');
        if (updates.socialLinks) updatedFields.push('socialLinks');
        
        if (updatedFields.length > 0) {
          const success = await sendTierNotifications(
            updatedUser.id,
            updatedFields,
            notifyTiers
          );
          
          if (success) {
            setNotificationSent(true);
            logger.info('Notifications sent successfully', { tiers: notifyTiers });
          }
        }
      }
      
      // Exit edit mode
      setIsEditing(false);
    } catch (err) {
      logger.error('Failed to save profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile changes');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Handle retry loading profile
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
    
    try {
      if (connectionStatus === 'disconnected') {
        const reconnected = await reconnectSupabase();
        if (!reconnected) {
          throw new Error('Failed to reconnect to Supabase');
        }
      }
      
      await refreshUser();
      const profileData = await getCurrentProfile();
      if (profileData) {
        setLocalUser(profileData);
      } else if (user) {
        setLocalUser(user);
      } else {
        throw new Error('Failed to load profile data');
      }
    } catch (err) {
      logger.error('Error retrying profile load:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!localUser && !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
          <a 
            href="/app/login" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Show error state if we have an error but no user data
  if (!localUser && error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry {retryCount > 0 ? `(${retryCount})` : ''}
          </button>
        </div>
      </div>
    );
  }

  // Fallback for when we still don't have user data
  if (!localUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your profile information.</p>
          <button 
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Profile
          </button>
        </div>
      </div>
    );
  }

  // Render profile
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Actions */}
        <div className="mb-6">
          <ProfileActions user={localUser} onEdit={() => setIsEditing(true)} />
        </div>

        {/* Notification Success Message */}
        {notificationSent && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Your profile has been updated and notifications have been sent to your selected circles.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setNotificationSent(false)}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isEditing ? (
            <div className="p-6">
              <ProfileEdit
                user={localUser}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                saving={saving}
              />
            </div>
          ) : (
            <ProfileView 
              user={localUser} 
              onEdit={() => setIsEditing(true)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}