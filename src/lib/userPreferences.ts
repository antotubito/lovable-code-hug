import { supabase } from './supabase';
import { logger } from './logger';
import type { Location } from '../types/location';

// User preferences manager
class UserPreferences {
  private static instance: UserPreferences;
  private cache: Map<string, any> = new Map();
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): UserPreferences {
    if (!UserPreferences.instance) {
      UserPreferences.instance = new UserPreferences();
    }
    return UserPreferences.instance;
  }

  // Set the current user ID
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  // Save a preference to localStorage and Supabase if user is logged in
  async savePreference(key: string, value: any): Promise<void> {
    try {
      // Save to localStorage
      localStorage.setItem(`pref_${key}`, JSON.stringify(value));
      
      // Update cache
      this.cache.set(key, value);
      
      // If user is logged in, save to Supabase
      if (this.userId) {
        // Get current preferences
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', this.userId)
          .single();
        
        if (error) {
          logger.error('Error fetching user preferences:', error);
          return;
        }
        
        // Update preferences
        const currentPreferences = data?.preferences || {};
        const updatedPreferences = {
          ...currentPreferences,
          [key]: value
        };
        
        // Save to Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ preferences: updatedPreferences })
          .eq('id', this.userId);
        
        if (updateError) {
          logger.error('Error updating user preferences:', updateError);
        } else {
          logger.info(`Saved preference ${key} to Supabase`);
        }
      }
    } catch (err) {
      logger.error(`Error saving preference ${key}:`, err);
    }
  }

  // Get a preference from cache, localStorage, or Supabase
  async getPreference<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      // Check cache first
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      
      // Check localStorage
      const localValue = localStorage.getItem(`pref_${key}`);
      if (localValue) {
        const parsedValue = JSON.parse(localValue);
        this.cache.set(key, parsedValue);
        return parsedValue;
      }
      
      // If user is logged in, check Supabase
      if (this.userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', this.userId)
          .single();
        
        if (error) {
          logger.error('Error fetching user preferences:', error);
        } else if (data?.preferences && data.preferences[key] !== undefined) {
          const value = data.preferences[key];
          
          // Update cache and localStorage
          this.cache.set(key, value);
          localStorage.setItem(`pref_${key}`, JSON.stringify(value));
          
          return value;
        }
      }
      
      // Return default value if provided
      return defaultValue;
    } catch (err) {
      logger.error(`Error getting preference ${key}:`, err);
      return defaultValue;
    }
  }

  // Remove a preference
  async removePreference(key: string): Promise<void> {
    try {
      // Remove from localStorage
      localStorage.removeItem(`pref_${key}`);
      
      // Remove from cache
      this.cache.delete(key);
      
      // If user is logged in, remove from Supabase
      if (this.userId) {
        // Get current preferences
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', this.userId)
          .single();
        
        if (error) {
          logger.error('Error fetching user preferences:', error);
          return;
        }
        
        // Update preferences
        const currentPreferences = data?.preferences || {};
        const updatedPreferences = { ...currentPreferences };
        delete updatedPreferences[key];
        
        // Save to Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ preferences: updatedPreferences })
          .eq('id', this.userId);
        
        if (updateError) {
          logger.error('Error updating user preferences:', updateError);
        } else {
          logger.info(`Removed preference ${key} from Supabase`);
        }
      }
    } catch (err) {
      logger.error(`Error removing preference ${key}:`, err);
    }
  }

  // Save a location preference
  async saveLocationPreference(key: string, location: Location): Promise<void> {
    try {
      // Save to localStorage with specific key
      localStorage.setItem(`location_${key}`, JSON.stringify(location));
      
      // Save to general preferences
      await this.savePreference(`location_${key}`, location);
      
      // If user is logged in, update bio in profile
      if (this.userId) {
        // Get current bio
        const { data, error } = await supabase
          .from('profiles')
          .select('bio')
          .eq('id', this.userId)
          .single();
        
        if (error) {
          logger.error('Error fetching profile for location update:', error);
          return;
        }
        
        // Format location string
        const locationString = `${location.name}${location.country ? `, ${location.country}` : ''}`;
        
        // Update bio with location
        const currentBio = data?.bio || {};
        const updatedBio = {
          ...currentBio,
          [key]: locationString
        };
        
        // Save to Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ bio: updatedBio })
          .eq('id', this.userId);
        
        if (updateError) {
          logger.error('Error updating profile with location:', updateError);
        } else {
          logger.info(`Saved location ${key} to profile bio:`, locationString);
        }
      }
    } catch (err) {
      logger.error(`Error saving location preference ${key}:`, err);
    }
  }

  // Get a location preference
  async getLocationPreference(key: string): Promise<Location | null> {
    try {
      // Check localStorage first
      const localValue = localStorage.getItem(`location_${key}`);
      if (localValue) {
        return JSON.parse(localValue);
      }
      
      // Check general preferences
      const prefValue = await this.getPreference<Location>(`location_${key}`);
      if (prefValue) {
        return prefValue;
      }
      
      return null;
    } catch (err) {
      logger.error(`Error getting location preference ${key}:`, err);
      return null;
    }
  }

  // Clear all preferences
  async clearAllPreferences(): Promise<void> {
    try {
      // Get all preference keys from localStorage
      const prefKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('pref_') || key.startsWith('location_'))) {
          prefKeys.push(key);
        }
      }
      
      // Remove all preferences from localStorage
      prefKeys.forEach(key => localStorage.removeItem(key));
      
      // Clear cache
      this.cache.clear();
      
      // If user is logged in, clear preferences in Supabase
      if (this.userId) {
        const { error } = await supabase
          .from('profiles')
          .update({ preferences: {} })
          .eq('id', this.userId);
        
        if (error) {
          logger.error('Error clearing user preferences in Supabase:', error);
        } else {
          logger.info('Cleared all preferences in Supabase');
        }
      }
    } catch (err) {
      logger.error('Error clearing all preferences:', err);
    }
  }

  // Sync preferences from Supabase to localStorage
  async syncPreferencesFromSupabase(): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences, bio')
        .eq('id', this.userId)
        .single();
      
      if (error) {
        logger.error('Error fetching preferences from Supabase:', error);
        return;
      }
      
      // Update preferences in localStorage and cache
      const preferences = data?.preferences || {};
      Object.entries(preferences).forEach(([key, value]) => {
        localStorage.setItem(`pref_${key}`, JSON.stringify(value));
        this.cache.set(key, value);
      });
      
      // Update location preferences from bio
      const bio = data?.bio || {};
      Object.entries(bio).forEach(([key, value]) => {
        if (typeof value === 'string' && value.includes(',')) {
          // This looks like a location string, but we don't have the full location object
          // We'll just store the string value for now
          localStorage.setItem(`bio_${key}`, value as string);
        }
      });
      
      logger.info('Synced preferences from Supabase');
    } catch (err) {
      logger.error('Error syncing preferences from Supabase:', err);
    }
  }
}

// Export singleton instance
export const userPreferences = UserPreferences.getInstance();

// Initialize user ID when auth state changes
export const initUserPreferences = async (userId: string | null): Promise<void> => {
  userPreferences.setUserId(userId);
  
  if (userId) {
    // Sync preferences from Supabase when user logs in
    await userPreferences.syncPreferencesFromSupabase();
  }
};