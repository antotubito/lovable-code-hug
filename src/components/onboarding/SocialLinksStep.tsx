import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Globe, ArrowLeft } from 'lucide-react';
import { SocialPlatformSelector } from './SocialPlatformSelector';
import { SocialLinkInput } from './SocialLinkInput';
import { AnimatedButton } from './AnimatedButton';

interface SocialLinksStepProps {
  socialLinks: Record<string, string>;
  onUpdate: (links: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SocialLinksStep({ 
  socialLinks, 
  onUpdate, 
  onNext, 
  onBack 
}: SocialLinksStepProps) {
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validLinks, setValidLinks] = useState<Record<string, boolean>>({});

  // Validate links on mount and when they change
  useEffect(() => {
    const newValidLinks: Record<string, boolean> = {};
    
    Object.entries(socialLinks).forEach(([platform, value]) => {
      // Consider empty links as valid (they'll be filtered out later)
      newValidLinks[platform] = value.trim() === '' || isValidLink(platform, value);
    });
    
    setValidLinks(newValidLinks);
  }, [socialLinks]);

  const isValidLink = (platform: string, value: string): boolean => {
    if (!value.trim()) return true; // Empty values are "valid" but will be removed
    
    // Basic validation patterns for common platforms
    const patterns: Record<string, RegExp> = {
      linkedin: /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
      twitter: /^@[\w]{1,15}$|^https:\/\/(www\.)?twitter\.com\/[\w]{1,15}\/?$/,
      github: /^https:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
      instagram: /^@[\w.]+$|^https:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/,
      facebook: /^https:\/\/(www\.)?facebook\.com\/[\w.]+\/?$/,
      portfolio: /^https?:\/\/.+/
    };
    
    // If we have a pattern for this platform, test it
    if (patterns[platform]) {
      return patterns[platform].test(value);
    }
    
    // For other platforms, just ensure it's not empty
    return value.trim() !== '';
  };

  const handleAddPlatform = (platform: string) => {
    if (socialLinks[platform]) {
      setError(`You've already added ${platform}`);
      return;
    }
    
    const updatedLinks = {
      ...socialLinks,
      [platform]: ''
    };
    
    onUpdate(updatedLinks);
    setShowPlatformSelector(false);
  };

  const handleRemovePlatform = (platform: string) => {
    const updatedLinks = { ...socialLinks };
    delete updatedLinks[platform];
    onUpdate(updatedLinks);
  };

  const handleUpdatePlatform = (platform: string, value: string) => {
    onUpdate({
      ...socialLinks,
      [platform]: value
    });
  };

  const handleContinue = () => {
    // Check if any links are invalid
    const hasInvalidLinks = Object.entries(validLinks).some(([platform, isValid]) => !isValid);
    
    if (hasInvalidLinks) {
      setError('Please fix the invalid social links before continuing');
      return;
    }
    
    // Filter out empty links
    const filteredLinks = Object.entries(socialLinks)
      .filter(([_, value]) => value.trim() !== '')
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {});
    
    // Update with filtered links
    onUpdate(filteredLinks);
    
    // Clear error and continue
    setError(null);
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Social links section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Your Social Platforms</h3>
          <button
            type="button"
            onClick={() => setShowPlatformSelector(true)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Platform
          </button>
        </div>

        {Object.keys(socialLinks).length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Globe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">
              Add your social platforms to make it easier for people to connect with you
            </p>
            <button
              type="button"
              onClick={() => setShowPlatformSelector(true)}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Your First Platform
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {Object.entries(socialLinks).map(([platform, value]) => (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <SocialLinkInput
                    platform={platform}
                    value={value}
                    onChange={(newValue) => handleUpdatePlatform(platform, newValue)}
                    onRemove={() => handleRemovePlatform(platform)}
                    autoFocus={value === ''}
                    isValid={validLinks[platform] !== false}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex space-x-3">
        <AnimatedButton
          variant="secondary"
          onClick={onBack}
          icon={ArrowLeft}
        >
          Back
        </AnimatedButton>
        <AnimatedButton
          onClick={handleContinue}
        >
          {Object.keys(socialLinks).length > 0 ? 'Continue' : 'Skip for now'}
        </AnimatedButton>
      </div>

      {/* Platform selector modal */}
      <AnimatePresence>
        {showPlatformSelector && (
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
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <SocialPlatformSelector
                onSelect={handleAddPlatform}
                onClose={() => setShowPlatformSelector(false)}
                selectedPlatforms={Object.keys(socialLinks)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}