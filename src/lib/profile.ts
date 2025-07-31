import { supabase } from './supabase';
import type { User } from '../types/user';
import { logger } from './logger';

// Event emitter for profile updates with a maximum limit
const MAX_LISTENERS = 10;
const profileListeners = new Set<(profile: User) => void>();

// Subscribe to profile updates
export function subscribeToProfileUpdates(callback: (profile: User) => void) {
  if (profileListeners.size >= MAX_LISTENERS) {
    logger.warn('Maximum number of profile listeners reached');
    return () => {};
  }

  profileListeners.add(callback);
  
  return () => {
    profileListeners.delete(callback);
  };
}

// Batch notify listeners with debouncing
let notifyTimeout: number | null = null;
function notifyProfileUpdate(profile: User) {
  if (notifyTimeout) {
    window.clearTimeout(notifyTimeout);
  }

  notifyTimeout = window.setTimeout(() => {
    profileListeners.forEach(listener => {
      try {
        listener(profile);
      } catch (err) {
        logger.error('Error in profile listener:', err);
      }
    });
    notifyTimeout = null;
  }, 16);
}

// Update profile
export async function updateProfile(updates: Partial<User>): Promise<User> {
  logger.info('Updating profile', { updates });

  try {
    // Get current session to ensure we have the user ID
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const userId = session.user.id;
    if (!userId) {
      throw new Error('No user ID available');
    }

    // Update name field if any name components are being updated
    const updatedName = updates.firstName || updates.lastName
      ? `${updates.firstName || ''} ${updates.lastName || ''}`.trim()
      : undefined;

    // For regular users, update profile in Supabase
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: updates.firstName,
        middle_name: updates.middleName,
        last_name: updates.lastName,
        job_title: updates.jobTitle,
        company: updates.company,
        industry: updates.industry,
        profile_image: updates.profileImage,
        cover_image: updates.coverImage,
        bio: updates.bio,
        interests: updates.interests,
        social_links: updates.socialLinks,
        public_profile: updates.publicProfile,
        onboarding_complete: updates.onboardingComplete,
        registration_complete: updates.registrationComplete,
        registration_status: updates.registrationStatus,
        registration_completed_at: updates.registrationCompletedAt?.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!data) throw new Error('No data returned from update');

    // Create user object from updated profile
    const updatedUser: User = {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      middleName: data.middle_name,
      name: `${data.first_name} ${data.middle_name ? data.middle_name + ' ' : ''}${data.last_name}`.trim(),
      jobTitle: data.job_title,
      company: data.company,
      industry: data.industry,
      profileImage: data.profile_image,
      coverImage: data.cover_image,
      bio: data.bio,
      interests: data.interests,
      socialLinks: data.social_links || {},
      onboardingComplete: data.onboarding_complete,
      registrationComplete: data.registration_complete,
      registrationStatus: data.registration_status,
      registrationCompletedAt: data.registration_completed_at ? new Date(data.registration_completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      twoFactorEnabled: false,
      publicProfile: data.public_profile || {
        enabled: true,
        defaultSharedLinks: {},
        allowedFields: {
          email: false,
          phone: false,
          company: true,
          jobTitle: true,
          bio: true,
          interests: true,
          location: true
        }
      }
    };

    // Notify listeners
    notifyProfileUpdate(updatedUser);

    logger.info('Profile update complete');
    return updatedUser;
  } catch (error) {
    logger.error('Error updating profile:', error);
    throw error;
  }
}

// Get current user profile
export async function getCurrentProfile(): Promise<User | null> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      logger.info('No active session found when getting current profile');
      return null;
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      logger.error('Error fetching profile:', error);
      throw error;
    }

    if (!profile) {
      logger.warn('No profile found for user:', session.user.id);
      return null;
    }

    // Create user object from profile
    const user: User = {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      middleName: profile.middle_name,
      name: `${profile.first_name || ''} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name || ''}`.trim(),
      jobTitle: profile.job_title,
      company: profile.company,
      industry: profile.industry,
      profileImage: profile.profile_image,
      coverImage: profile.cover_image,
      bio: profile.bio || {},
      interests: profile.interests || [],
      socialLinks: profile.social_links || {},
      onboardingComplete: profile.onboarding_complete || false,
      registrationComplete: profile.registration_complete || false,
      registrationStatus: profile.registration_status || 'pending',
      registrationCompletedAt: profile.registration_completed_at ? new Date(profile.registration_completed_at) : undefined,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
      twoFactorEnabled: false,
      publicProfile: profile.public_profile || {
        enabled: true,
        defaultSharedLinks: {},
        allowedFields: {
          email: false,
          phone: false,
          company: true,
          jobTitle: true,
          bio: true,
          interests: true,
          location: true
        }
      }
    };

    logger.info('Successfully retrieved current profile');
    return user;
  } catch (error) {
    logger.error('Error getting current profile:', error);
    return null;
  }
}