import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Link as LinkIcon, Save, Check } from 'lucide-react';
import { SOCIAL_CATEGORIES } from '../../config/social';
import type { Contact } from '../../types/contact';
import { useAuth } from '../auth/AuthProvider';

interface SharingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sharedLinks: Record<string, boolean>) => Promise<void>;
  contact: Contact;
}

export function SharingSettingsModal({
  isOpen,
  onClose,
  onSave,
  contact
}: SharingSettingsModalProps) {
  const { user } = useAuth();
  const [sharedLinks, setSharedLinks] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize shared links from contact data
  useEffect(() => {
    if (isOpen && user && user.socialLinks) {
      // Start with all links from the user's profile
      const initialSharedLinks: Record<string, boolean> = {};
      
      // For each platform in the user's profile
      Object.keys(user.socialLinks).forEach(platform => {
        // Check if this platform is already shared with the contact
        const isShared = contact.socialLinks && contact.socialLinks[platform] !== undefined;
        initialSharedLinks[platform] = isShared;
      });
      
      setSharedLinks(initialSharedLinks);
    }
  }, [isOpen, user, contact]);

  const togglePlatform = (platform: string) => {
    setSharedLinks(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(sharedLinks);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving sharing settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Group platforms by category
  const platformsByCategory: Record<string, { platform: string; isShared: boolean }[]> = {};
  
  if (user && user.socialLinks) {
    Object.entries(user.socialLinks).forEach(([platform, url]) => {
      // Skip if URL is empty
      if (!url) return;
      
      // Find the category for this platform
      let categoryId = 'other';
      for (const [id, category] of Object.entries(SOCIAL_CATEGORIES)) {
        if (category.links[platform]) {
          categoryId = id;
          break;
        }
      }
      
      // Initialize category array if needed
      if (!platformsByCategory[categoryId]) {
        platformsByCategory[categoryId] = [];
      }
      
      // Add platform to category
      platformsByCategory[categoryId].push({
        platform,
        isShared: sharedLinks[platform] || false
      });
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Sharing Settings
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose what to share with {contact.name}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {Object.entries(platformsByCategory).map(([categoryId, platforms]) => {
                // Get category info
                const category = SOCIAL_CATEGORIES[categoryId];
                if (!category || platforms.length === 0) return null;
                
                return (
                  <div key={categoryId} className="mb-6 last:mb-0">
                    <div className="flex items-center mb-3">
                      <category.icon className={`h-5 w-5 mr-2 ${category.iconColor}`} />
                      <h3 className="text-sm font-medium text-gray-900">{category.title}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {platforms.map(({ platform, isShared }) => {
                        const platformConfig = category.links[platform];
                        if (!platformConfig) return null;
                        
                        const Icon = platformConfig.icon;
                        
                        return (
                          <div 
                            key={platform}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isShared 
                                ? 'border-indigo-200 bg-indigo-50' 
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center">
                              <Icon 
                                className="h-5 w-5 mr-3"
                                style={{ color: platformConfig.color }}
                              />
                              <div>
                                <p className="font-medium text-gray-900">{platformConfig.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {user?.socialLinks?.[platform]}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => togglePlatform(platform)}
                              className={`p-2 rounded-full transition-colors ${
                                isShared
                                  ? 'text-indigo-600 hover:bg-indigo-100'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              {isShared ? (
                                <Eye className="h-5 w-5" />
                              ) : (
                                <EyeOff className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {Object.keys(platformsByCategory).length === 0 && (
                <div className="text-center py-8">
                  <LinkIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">You don't have any social links to share</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add social links to your profile first
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : success ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}