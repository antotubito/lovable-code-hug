import { supabase } from './supabase';
import type { User, LoginCredentials, RegistrationData } from '../types/user';
import { logger } from './logger';
import { apiService } from './apiService';

// Get current user based on Supabase session
export async function getCurrentUser(): Promise<User | null> {
  try {
    logger.info('Getting current user');
    
    // Check Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      logger.error('Session error:', sessionError);
      throw sessionError;
    }
    
    if (!session) {
      logger.debug('No active session');
      return null;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      // Check if it's a network error
      if (profileError.message?.includes('Failed to fetch')) {
        logger.error('Network error fetching profile:', profileError);
        throw new Error('Network error. Please check your internet connection.');
      }
      
      logger.error('Profile error:', profileError);
      throw profileError;
    }

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      middleName: profile.middle_name,
      lastName: profile.last_name,
      name: `${profile.first_name} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name}`.trim(),
      company: profile.company,
      jobTitle: profile.job_title,
      industry: profile.industry,
      profileImage: profile.profile_image,
      coverImage: profile.cover_image,
      bio: profile.bio,
      interests: profile.interests,
      socialLinks: profile.social_links || {},
      onboardingComplete: profile.onboarding_complete,
      registrationComplete: profile.registration_complete,
      registrationStatus: profile.registration_status,
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
  } catch (error) {
    logger.error('Error getting current user:', error);
    throw error;
  }
}

// Login using Supabase authentication
export async function login(credentials: LoginCredentials): Promise<{ 
  success: boolean; 
  requiresOnboarding?: boolean;
  emailConfirmationRequired?: boolean;
  emailNotFound?: boolean;
  error?: string;
}> {
  try {
    logger.info('Attempting login', { email: credentials.email });

    // Try direct Supabase auth
    if ('accessKey' in credentials) {
      // Handle testing access key login
      if (!credentials.accessKey?.trim()) {
        return {
          success: false,
          error: 'Access key is required'
        };
      }

      // Clear any existing auth data
      await supabase.auth.signOut();

      // Use test credentials for access key login
      const testEmail = `test-${credentials.accessKey}@example.com`;
      const testPassword = credentials.accessKey;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid access key'
          };
        }
        throw error;
      }

      if (!data.session) {
        return {
          success: false,
          error: 'No session returned'
        };
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete, registration_status')
        .eq('id', data.session.user.id)
        .single();

      logger.info('Test login successful', { userId: data.user?.id });
      
      return { 
        success: true,
        requiresOnboarding: !profile?.onboarding_complete
      };
    } else {
      // Handle regular email/password login
      if (!credentials.email?.trim() || !credentials.password?.trim()) {
        return {
          success: false,
          error: 'Email and password are required'
        };
      }

      // First check if the email exists in auth.users
      try {
        // Get the user directly from Supabase Auth
        const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (userError) {
          logger.error('Login error from Supabase:', userError);
          
          if (userError.message.includes('Failed to fetch')) {
            return {
              success: false,
              error: 'Network error. Please check your internet connection and try again.'
            };
          }
          
          if (userError.message.includes('Email not confirmed')) {
            localStorage.setItem('confirmEmail', credentials.email);
            return {
              success: false,
              emailConfirmationRequired: true
            };
          }

          if (userError.message.includes('Invalid login credentials')) {
            // Check if the email exists in profiles
            const { data: profileCheck, error: profileError } = await supabase
              .from('profiles')
              .select('id, email')
              .ilike('email', credentials.email.toLowerCase().trim())
              .limit(1);

            if (profileError) {
              logger.error('Profile check error:', profileError);
            }

            // If profile exists but credentials are invalid, it's a password issue
            if (profileCheck && profileCheck.length > 0) {
              logger.info('Profile found but password is incorrect');
              return {
                success: false,
                error: 'Invalid password'
              };
            } else {
              // If no profile found, the email doesn't exist
              logger.warn('Email not found in profiles:', { email: credentials.email });
              return {
                success: false,
                emailNotFound: true
              };
            }
          }

          throw userError;
        }

        if (!userData.session) {
          return {
            success: false,
            error: 'No session returned'
          };
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete, registration_status')
          .eq('id', userData.session.user.id)
          .single();

        logger.info('Login successful', { userId: userData.user?.id });
        
        return { 
          success: true,
          requiresOnboarding: !profile?.onboarding_complete
        };
      } catch (error) {
        logger.error('Error during login:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch')) {
            return {
              success: false,
              error: 'Network error. Please check your internet connection and try again.'
            };
          }
          
          return {
            success: false,
            error: error.message
          };
        }
        
        return {
          success: false,
          error: 'An unexpected error occurred. Please try again.'
        };
      }
    }
  } catch (error) {
    logger.error('Login error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection and try again.'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

// Logout function
export async function logout(): Promise<void> {
  try {
    logger.info('Logging out user');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear any local storage items
    localStorage.removeItem('redirectUrl');
    localStorage.removeItem('confirmEmail');
    localStorage.removeItem('onboarding_progress');
    
    logger.info('Logout successful');
  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
}

// Sign up
export async function signUp(data: RegistrationData): Promise<boolean> {
  try {
    logger.info('Starting user registration', { email: data.email });

    // Create Supabase user with email verification
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          middle_name: data.middleName,
          last_name: data.lastName,
          name: `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`.trim(),
          company: data.company,
          onboarding_complete: false,
          registration_complete: false,
          registration_status: 'pending'
        },
        emailRedirectTo: data.emailRedirectTo || `${window.location.origin}/confirmed`
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Handle rate limit errors
      if (signUpError.message.includes('security purposes') || 
          signUpError.message.includes('rate limit') ||
          signUpError.message.includes('over_email_send_rate_limit')) {
        throw new Error('For security purposes, you can only request this after 50 seconds.');
      }
      
      throw signUpError;
    }
    
    if (!authData.user) throw new Error('No user data returned');

    // Store email temporarily for verification
    localStorage.setItem('confirmEmail', data.email);

    logger.info('User registration successful', { userId: authData.user.id });
    return true;
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
}

// Password validation helper
export function validatePassword(password: string) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasUppercase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowercase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecial) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true, message: '' };
}

// Get test users
export function getTestUsers() {
  return [
    { email: "john@techinnovations.dev", name: "John Developer" },
    { email: "user1@example.com", name: "User One" },
    { email: "user2@example.com", name: "User Two" }
  ];
}

// Get access requests
export function getAccessRequests() {
  return []; // Example empty access requests list
}

// Approve access request
export function approveAccessRequest(userId: string) {
  logger.info('Approving access request', { userId });
  return `User ${userId} has been approved for testing access.`;
}

// Decline access request
export function declineAccessRequest(userId: string) {
  logger.info('Declining access request', { userId });
  return `User ${userId} access request has been declined.`;
}