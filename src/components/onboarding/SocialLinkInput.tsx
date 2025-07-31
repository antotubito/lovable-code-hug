import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { SOCIAL_CATEGORIES } from '../../config/social';

interface SocialLinkInputProps {
  platform: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  autoFocus?: boolean;
  isValid?: boolean;
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
      message: `Invalid format. Please check and try again.`
    };
  }

  return { isValid: true };
}

export function SocialLinkInput({ 
  platform, 
  value, 
  onChange, 
  onRemove,
  autoFocus = false,
  isValid = true
}: SocialLinkInputProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Find platform configuration
  let platformConfig;
  let category;
  
  for (const [categoryId, categoryData] of Object.entries(SOCIAL_CATEGORIES)) {
    if (categoryData.links[platform]) {
      platformConfig = categoryData.links[platform];
      category = categoryData;
      break;
    }
  }
  
  if (!platformConfig) {
    return null;
  }
  
  const Icon = platformConfig.icon;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Validate the input
    const validation = validateLink(platform, newValue);
    
    if (!validation.isValid) {
      setError(validation.message || 'Invalid format');
    } else {
      setError(null);
    }
    
    onChange(newValue);
  };
  
  const handleBlur = () => {
    if (!value.trim()) return;
    
    // Format the URL if needed
    const formatter = URL_FORMATTERS[platform as keyof typeof URL_FORMATTERS];
    if (formatter) {
      const formattedValue = formatter(value);
      onChange(formattedValue);
    }
    
    // Final validation
    const validation = validateLink(platform, value);
    if (!validation.isValid) {
      setError(validation.message || 'Invalid format');
    } else {
      setError(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-white rounded-lg border ${isValid ? 'border-gray-200' : 'border-red-300'} p-4 relative`}
    >
      <div className="flex items-center mb-3">
        <div 
          className="p-2 rounded-lg mr-3"
          style={{ backgroundColor: `${platformConfig.color}20` }}
        >
          <Icon 
            className="h-5 w-5"
            style={{ color: platformConfig.color }}
          />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{platformConfig.label}</h4>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={platformConfig.placeholder}
          className={`w-full px-3 py-2 border rounded-lg text-sm ${
            error || !isValid
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
          autoFocus={autoFocus}
        />
      </div>
      
      {(error || !isValid) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 flex items-start"
        >
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1.5 flex-shrink-0" />
          <p className="text-xs text-red-600">{error || 'Invalid format. Please check and try again.'}</p>
        </motion.div>
      )}
      
      <p className="mt-2 text-xs text-gray-500">
        {platformConfig.placeholder}
      </p>
    </motion.div>
  );
}