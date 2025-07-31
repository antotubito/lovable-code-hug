import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, X, AlertCircle, PlusCircle, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SOCIAL_CATEGORIES } from '../../config/social';

interface SocialLinksInputProps {
  links: Record<string, string>;
  onChange: (links: Record<string, string>) => void;
  required?: boolean;
}

// URL validation patterns
const URL_PATTERNS = {
  linkedin: /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
  github: /^https:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
  twitter: /^@[\w]{1,15}$|^https:\/\/(www\.)?twitter\.com\/[\w]{1,15}\/?$/,
  portfolio: /^https?:\/\/.+/,
  medium: /^@[\w]+$|^https:\/\/(www\.)?medium\.com\/@?[\w]+\/?$/,
  dribbble: /^https:\/\/(www\.)?dribbble\.com\/[\w-]+\/?$/,
  instagram: /^@[\w.]+$|^https:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/,
  facebook: /^https:\/\/(www\.)?facebook\.com\/[\w.]+\/?$/,
  youtube: /^https:\/\/(www\.)?youtube\.com\/@?[\w-]+\/?$/,
  threads: /^@[\w.]+$|^https:\/\/(www\.)?threads\.net\/@[\w.]+\/?$/,
  tiktok: /^@[\w.]+$|^https:\/\/(www\.)?tiktok\.com\/@[\w.]+\/?$/,
  whatsapp: /^\+\d{1,15}$/,
  telegram: /^@[\w]+$/,
  discord: /^[\w]+#\d{4}$/,
  signal: /^\+\d{1,15}$/,
  skype: /^[\w\-.]+$/,
  calendly: /^https:\/\/(www\.)?calendly\.com\/[\w-]+\/?$/,
  buymeacoffee: /^https:\/\/(www\.)?buymeacoffee\.com\/[\w-]+\/?$/,
  patreon: /^https:\/\/(www\.)?patreon\.com\/[\w-]+\/?$/,
  substack: /^[\w-]+\.substack\.com$/
};

// URL formatters to convert username to full URL
const URL_FORMATTERS = {
  linkedin: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://linkedin.com/in/${username.replace('@', '')}`;
  },
  github: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://github.com/${username.replace('@', '')}`;
  },
  twitter: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://twitter.com/${username.replace('@', '')}`;
  },
  instagram: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://instagram.com/${username.replace('@', '')}`;
  },
  facebook: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://facebook.com/${username.replace('@', '')}`;
  },
  youtube: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://youtube.com/${username.startsWith('@') ? '' : '@'}${username.replace('@', '')}`;
  },
  medium: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://medium.com/${username.startsWith('@') ? '' : '@'}${username.replace('@', '')}`;
  },
  dribbble: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://dribbble.com/${username.replace('@', '')}`;
  },
  threads: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://threads.net/${username.startsWith('@') ? '' : '@'}${username.replace('@', '')}`;
  },
  tiktok: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://tiktok.com/${username.startsWith('@') ? '' : '@'}${username.replace('@', '')}`;
  },
  buymeacoffee: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://buymeacoffee.com/${username.replace('@', '')}`;
  },
  patreon: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://patreon.com/${username.replace('@', '')}`;
  },
  calendly: (username: string) => {
    if (username.startsWith('https://')) return username;
    return `https://calendly.com/${username.replace('@', '')}`;
  },
  substack: (username: string) => {
    if (username.includes('.substack.com')) return `https://${username}`;
    return `https://${username}.substack.com`;
  }
};

// Link validation helper
function validateLink(platform: string, value: string): { isValid: boolean; message?: string } {
  if (!value.trim()) return { isValid: true };

  const pattern = URL_PATTERNS[platform as keyof typeof URL_PATTERNS];
  if (!pattern) return { isValid: true }; // No validation pattern defined

  if (!pattern.test(value)) {
    return {
      isValid: false,
      message: `Invalid ${platform} format. Please check and try again.`
    };
  }

  return { isValid: true };
}

export function SocialLinksInput({
  links,
  onChange,
  required = false
}: SocialLinksInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAddPlatformHint, setShowAddPlatformHint] = useState(Object.keys(links).length === 0);

  useEffect(() => {
    // Check if at least one social link is required and provided
    if (required && !Object.values(links).some(link => link.trim())) {
      setError('At least one social platform is required');
    } else {
      setError(null);
    }
    
    // Show add platform hint if no links
    setShowAddPlatformHint(Object.keys(links).length === 0);
  }, [links, required]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleLinkChange = (platform: string, value: string) => {
    // Validate the link
    const validation = validateLink(platform, value);
    
    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [platform]: validation.message || 'Invalid format'
      }));
      return;
    }

    // Clear validation error if valid
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[platform];
      return newErrors;
    });

    const newLinks = { ...links };
    if (value.trim()) {
      // Format the URL if needed
      const formatter = URL_FORMATTERS[platform as keyof typeof URL_FORMATTERS];
      newLinks[platform] = formatter ? formatter(value) : value;
    } else {
      delete newLinks[platform];
    }
    
    // Clear error if at least one link is provided when required
    if (required && Object.values(newLinks).some(link => link.trim())) {
      setError(null);
    }
    
    onChange(newLinks);
  };

  const handleAddPlatform = () => {
    setExpanded(true);
    // Expand the first category if none are expanded
    if (expandedCategories.length === 0) {
      const firstCategory = Object.keys(SOCIAL_CATEGORIES)[0];
      setExpandedCategories([firstCategory]);
    }
    setShowAddPlatformHint(false);
  };

  const hasAnyLink = Object.values(links).some(link => link.trim() !== '');
  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      >
        <div>
          <span className="text-sm font-medium text-gray-900">
            Social Platforms
            {required && !hasAnyLink && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </span>
          <p className="text-sm text-gray-500 mt-1">
            {hasAnyLink 
              ? `${Object.keys(links).length} active platform${Object.keys(links).length !== 1 ? 's' : ''}`
              : 'No platforms configured'}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Error Message */}
      <AnimatePresence>
        {(error || hasValidationErrors) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error || 'Please fix the following errors:'}
                  </h3>
                  {hasValidationErrors && (
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(validationErrors).map(([platform, message]) => (
                          <li key={platform}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-50 rounded-lg space-y-6">
              {/* Add Platform Button */}
              {showAddPlatformHint && (
                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                    <LinkIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Add Your Social Platforms</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Connect your social media accounts to make it easier for others to find you
                  </p>
                  <button
                    type="button"
                    onClick={handleAddPlatform}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    Add Your First Platform
                  </button>
                </div>
              )}

              {/* Categories */}
              {Object.entries(SOCIAL_CATEGORIES).map(([categoryId, category]) => (
                <div key={categoryId} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(categoryId)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <category.icon className={`h-5 w-5 ${category.iconColor}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-medium text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-500">
                          {Object.keys(category.links).filter(platform => links[platform]).length} active
                        </p>
                      </div>
                    </div>
                    {expandedCategories.includes(categoryId) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {/* Platform Inputs */}
                  <AnimatePresence>
                    {expandedCategories.includes(categoryId) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-gray-200 space-y-4">
                          {Object.entries(category.links).map(([platform, config]) => {
                            const Icon = config.icon;
                            const isActive = Boolean(links[platform]);
                            const hasError = Boolean(validationErrors[platform]);
                            
                            return (
                              <div key={platform} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Icon 
                                      className="h-5 w-5 mr-3"
                                      style={{ color: config.color }}
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                      {config.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {isActive ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Check className="h-3 w-3 mr-1" />
                                        Active
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        <X className="h-3 w-3 mr-1" />
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={links[platform] || ''}
                                    onChange={(e) => handleLinkChange(platform, e.target.value)}
                                    placeholder={config.placeholder}
                                    className={`block w-full px-3 py-2 border rounded-lg text-sm ${
                                      hasError
                                        ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                        : isActive
                                        ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                        : 'border-gray-200 bg-gray-50 text-gray-500 focus:ring-gray-400 focus:border-gray-400'
                                    }`}
                                  />
                                  {isActive && !hasError && (
                                    <button
                                      type="button"
                                      onClick={() => handleLinkChange(platform, '')}
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                                    >
                                      <X className="h-4 w-4 text-gray-400" />
                                    </button>
                                  )}
                                </div>
                                {hasError ? (
                                  <p className="text-xs text-red-600">
                                    {validationErrors[platform]}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-500">
                                    {isActive ? 'Click X to deactivate' : 'Enter username to activate'}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Add Platform Button (when already have some platforms) */}
              {!showAddPlatformHint && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleAddPlatform}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    Add More Platforms
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}