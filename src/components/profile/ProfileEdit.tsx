import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Building2, Briefcase, MapPin, Globe, 
  Camera, Heart, Link as LinkIcon, Eye, EyeOff, 
  Save, X, ChevronDown, ChevronUp, Bell
} from 'lucide-react';
import type { User as UserType } from '../../types/user';
import type { Industry } from '../../types/industry';
import { IndustrySelect } from './IndustrySelect';
import { JobTitleInput } from './JobTitleInput';
import { SocialLinksInput } from './SocialLinksInput';
import { ProfileImageUpload } from './ProfileImageUpload';
import { InterestsInput } from './InterestsInput';
import { CityAutocomplete } from '../common/CityAutocomplete';
import { TierNotificationToggle } from './TierNotificationToggle';
import { NotificationPreview } from './NotificationPreview';
import type { Location } from '../../types/location';

interface ProfileEditProps {
  user: UserType;
  onSave: (updates: Partial<UserType>, notifyTiers?: number[]) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export function ProfileEdit({ user, onSave, onCancel, saving }: ProfileEditProps) {
  const [profileData, setProfileData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    name: user.name || '',
    jobTitle: user.jobTitle || '',
    company: user.company || '',
    industry: user.industry || undefined,
    profileImage: user.profileImage || undefined,
    coverImage: user.coverImage || undefined,
    bio: {
      location: user.bio?.location || '',
      from: user.bio?.from || '',
      about: user.bio?.about || ''
    },
    interests: user.interests || [],
    socialLinks: user.socialLinks || {},
    publicProfile: {
      enabled: user.publicProfile?.enabled ?? true,
      defaultSharedLinks: user.publicProfile?.defaultSharedLinks || {},
      allowedFields: {
        email: user.publicProfile?.allowedFields?.email ?? false,
        phone: user.publicProfile?.allowedFields?.phone ?? false,
        company: user.publicProfile?.allowedFields?.company ?? true,
        jobTitle: user.publicProfile?.allowedFields?.jobTitle ?? true,
        bio: user.publicProfile?.allowedFields?.bio ?? true,
        interests: user.publicProfile?.allowedFields?.interests ?? true,
        location: user.publicProfile?.allowedFields?.location ?? true
      }
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'basic', 'images', 'bio', 'interests', 'social', 'privacy', 'notifications'
  ]);
  const [selectedTiers, setSelectedTiers] = useState<number[]>([1]); // Default to Inner Circle
  const [showNotificationPreview, setShowNotificationPreview] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [originalData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    jobTitle: user.jobTitle || '',
    company: user.company || '',
    bio: {
      location: user.bio?.location || '',
      from: user.bio?.from || '',
      about: user.bio?.about || ''
    },
    socialLinks: { ...user.socialLinks } || {}
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!profileData.firstName.trim()) {
        throw new Error('First name is required');
      }
      
      if (!profileData.lastName.trim()) {
        throw new Error('Last name is required');
      }

      // Construct the full name
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

      // Determine which fields have been updated
      const changedFields: string[] = [];
      
      if (profileData.firstName !== originalData.firstName || 
          profileData.lastName !== originalData.lastName) {
        changedFields.push('firstName');
      }
      
      if (profileData.jobTitle !== originalData.jobTitle) {
        changedFields.push('jobTitle');
      }
      
      if (profileData.company !== originalData.company) {
        changedFields.push('company');
      }
      
      if (profileData.bio.location !== originalData.bio.location) {
        changedFields.push('bio.location');
      }
      
      if (profileData.bio.from !== originalData.bio.from) {
        changedFields.push('bio.from');
      }
      
      if (profileData.bio.about !== originalData.bio.about) {
        changedFields.push('bio.about');
      }
      
      // Check if any social links have been added, removed, or modified
      const originalLinks = Object.keys(originalData.socialLinks || {}).length;
      const currentLinks = Object.keys(profileData.socialLinks || {}).length;
      
      if (originalLinks !== currentLinks) {
        changedFields.push('socialLinks');
      } else {
        // Check if any individual links have changed
        for (const [platform, url] of Object.entries(profileData.socialLinks || {})) {
          if (originalData.socialLinks[platform] !== url) {
            changedFields.push('socialLinks');
            break;
          }
        }
      }
      
      // Store updated fields for notification
      setUpdatedFields(changedFields);
      
      // If fields have changed and tiers are selected, show notification preview
      if (changedFields.length > 0 && selectedTiers.length > 0) {
        setShowNotificationPreview(true);
        return;
      }

      // Otherwise, save directly
      await onSave({
        ...profileData,
        name: fullName
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save changes');
      throw error;
    }
  };

  const handleContinueWithNotification = async () => {
    try {
      // Construct the full name
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      // In a real implementation, you would send notifications to the selected tiers here
      console.log('Sending notifications to tiers:', selectedTiers);
      console.log('Updated fields:', updatedFields);
      
      // Save the profile data
      await onSave({
        ...profileData,
        name: fullName
      }, selectedTiers);
      
      // Close the notification preview
      setShowNotificationPreview(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save changes');
      throw error;
    }
  };

  const handleInterestsChange = (interests: string[]) => {
    setProfileData({ ...profileData, interests });
  };

  const handleLocationChange = (data: { name: string; location: Location | null }) => {
    setProfileData({
      ...profileData,
      bio: { ...profileData.bio, location: data.name }
    });
  };

  const handleFromChange = (data: { name: string; location: Location | null }) => {
    setProfileData({
      ...profileData,
      bio: { ...profileData.bio, from: data.name }
    });
  };

  const handleIndustryChange = (industry: Industry) => {
    setProfileData({ ...profileData, industry });
  };

  const toggleFieldVisibility = (field: keyof typeof profileData.publicProfile.allowedFields) => {
    setProfileData({
      ...profileData,
      publicProfile: {
        ...profileData.publicProfile,
        allowedFields: {
          ...profileData.publicProfile.allowedFields,
          [field]: !profileData.publicProfile.allowedFields[field]
        }
      }
    });
  };

  const toggleSocialLinkVisibility = (platform: string) => {
    setProfileData({
      ...profileData,
      publicProfile: {
        ...profileData.publicProfile,
        defaultSharedLinks: {
          ...profileData.publicProfile.defaultSharedLinks,
          [platform]: !profileData.publicProfile.defaultSharedLinks[platform]
        }
      }
    });
  };

  const togglePublicProfile = () => {
    setProfileData({
      ...profileData,
      publicProfile: {
        ...profileData.publicProfile,
        enabled: !profileData.publicProfile.enabled
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Basic Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleSection('basic')}
        >
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          {expandedSections.includes('basic') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.includes('basic') && (
          <div className="p-4 border-t border-gray-200 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </div>
            </div>

            <IndustrySelect
              value={profileData.industry}
              onChange={handleIndustryChange}
            />

            <JobTitleInput
              value={profileData.jobTitle}
              onChange={(value) => setProfileData({ ...profileData, jobTitle: value })}
              industry={profileData.industry}
              required
            />

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                id="company"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={profileData.company}
                onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Profile Images Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleSection('images')}
        >
          <div className="flex items-center">
            <Camera className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Profile Images</h3>
          </div>
          {expandedSections.includes('images') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.includes('images') && (
          <div className="p-4 border-t border-gray-200 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Profile Picture <span className="text-red-500">*</span>
              </label>
              <ProfileImageUpload
                currentImage={profileData.profileImage}
                onImageChange={(imageData) => setProfileData({ ...profileData, profileImage: imageData })}
                onImageRemove={() => setProfileData({ ...profileData, profileImage: undefined })}
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Face verification is required for profile photos to ensure authenticity.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Cover Image
              </label>
              <ProfileImageUpload
                currentImage={profileData.coverImage}
                onImageChange={(imageData) => setProfileData({ ...profileData, coverImage: imageData })}
                onImageRemove={() => setProfileData({ ...profileData, coverImage: undefined })}
                isCover={true}
              />
              <p className="mt-2 text-xs text-gray-500">
                A cover photo adds personality to your profile and makes it more engaging.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bio & Location Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleSection('bio')}
        >
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Bio & Location</h3>
          </div>
          {expandedSections.includes('bio') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.includes('bio') && (
          <div className="p-4 border-t border-gray-200 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CityAutocomplete
                label="Current Location"
                value={profileData.bio.location}
                onSelect={handleLocationChange}
                placeholder="Search your city..."
                required
                storageKey="profile"
                fieldName="location"
              />

              <CityAutocomplete
                label="From"
                value={profileData.bio.from}
                onSelect={handleFromChange}
                placeholder="Where are you from?"
                storageKey="profile"
                fieldName="from"
              />
            </div>

            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                About You
              </label>
              <textarea
                id="about"
                rows={4}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={profileData.bio.about}
                onChange={(e) => setProfileData({
                  ...profileData,
                  bio: { ...profileData.bio, about: e.target.value }
                })}
                placeholder="Tell us about yourself..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Brief description for your profile. URLs are hyperlinked automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interests Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleSection('interests')}
        >
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Interests</h3>
          </div>
          {expandedSections.includes('interests') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.includes('interests') && (
          <div className="p-4 border-t border-gray-200">
            <InterestsInput
              interests={profileData.interests}
              onChange={handleInterestsChange}
            />
          </div>
        )}
      </div>

      {/* Social Links Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleSection('social')}
        >
          <div className="flex items-center">
            <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
          </div>
          {expandedSections.includes('social') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.includes('social') && (
          <div className="p-4 border-t border-gray-200">
            <SocialLinksInput
              links={profileData.socialLinks}
              onChange={(links) => setProfileData({ ...profileData, socialLinks: links })}
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              At least one social platform is required to complete your profile.
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleSection('notifications')}
        >
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
          </div>
          {expandedSections.includes('notifications') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.includes('notifications') && (
          <div className="p-4 border-t border-gray-200">
            <TierNotificationToggle
              selectedTiers={selectedTiers}
              onChange={setSelectedTiers}
              disabled={saving}
            />
            
            <div className="mt-4 bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-amber-700">
                When you update your profile information, such as job title, company, or social links, 
                your connections in the selected circles will be notified of these changes.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Public Profile Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleSection('privacy')}
        >
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Public Profile Settings</h3>
          </div>
          {expandedSections.includes('privacy') ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.includes('privacy') && (
          <div className="p-4 border-t border-gray-200 space-y-6">
            {/* Public Profile Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Public Profile</h3>
                <p className="text-sm text-gray-500">
                  Allow others to view your profile without having the app
                </p>
              </div>
              <button
                type="button"
                onClick={togglePublicProfile}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  profileData.publicProfile.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    profileData.publicProfile.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {profileData.publicProfile.enabled && (
              <>
                {/* Profile Fields Visibility */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Information</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Email Address' },
                      { key: 'phone', label: 'Phone Number' },
                      { key: 'company', label: 'Company' },
                      { key: 'jobTitle', label: 'Job Title' },
                      { key: 'bio', label: 'Bio' },
                      { key: 'interests', label: 'Interests' },
                      { key: 'location', label: 'Location' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{label}</span>
                        <button
                          type="button"
                          onClick={() => toggleFieldVisibility(key as keyof typeof profileData.publicProfile.allowedFields)}
                          disabled={saving}
                          className={`p-2 rounded-full transition-colors ${
                            profileData.publicProfile.allowedFields[key as keyof typeof profileData.publicProfile.allowedFields]
                              ? 'text-indigo-600 hover:bg-indigo-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {profileData.publicProfile.allowedFields[key as keyof typeof profileData.publicProfile.allowedFields] ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links Visibility */}
                {Object.keys(profileData.socialLinks).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Social Links</h4>
                    <div className="space-y-4">
                      {Object.keys(profileData.socialLinks).map((platform) => (
                        <div key={platform} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">{platform}</span>
                          <button
                            type="button"
                            onClick={() => toggleSocialLinkVisibility(platform)}
                            disabled={saving}
                            className={`p-2 rounded-full transition-colors ${
                              profileData.publicProfile.defaultSharedLinks[platform]
                                ? 'text-indigo-600 hover:bg-indigo-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {profileData.publicProfile.defaultSharedLinks[platform] ? (
                              <Eye className="h-5 w-5" />
                            ) : (
                              <EyeOff className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <X className="h-4 w-4 inline mr-1.5" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1.5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Notification Preview Modal */}
      <AnimatePresence>
        {showNotificationPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <NotificationPreview
                user={user}
                updatedFields={updatedFields}
                selectedTiers={selectedTiers}
                onClose={() => setShowNotificationPreview(false)}
              />
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNotificationPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContinueWithNotification}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save & Send Notifications'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}