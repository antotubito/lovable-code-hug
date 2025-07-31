import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronUp, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SOCIAL_CATEGORIES } from '../../config/social';
import type { User } from '../../types/user';

interface SocialSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sharedLinks: Record<string, boolean>) => void;
  user: User;
  username: string;
  onBack?: () => void;
}

export function SocialSharingModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  username,
  onBack
}: SocialSharingModalProps) {
  const [selectedLinks, setSelectedLinks] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleSelectAll = (categoryId: string) => {
    const category = SOCIAL_CATEGORIES[categoryId];
    if (!category) return;

    const categoryLinks = Object.keys(category.links)
      .filter(platform => user.socialLinks?.[platform]); // Only consider platforms with links

    const allSelected = categoryLinks.every(platform => selectedLinks[platform]);
    const newSelections = { ...selectedLinks };

    categoryLinks.forEach(platform => {
      newSelections[platform] = !allSelected;
    });

    setSelectedLinks(newSelections);
  };

  const handleSubmit = () => {
    const hasSelectedLinks = Object.values(selectedLinks).some(value => value);
    if (!hasSelectedLinks) {
      setError('Please select at least one social platform to share');
      return;
    }
    onSubmit(selectedLinks);
    setSelectedLinks({});
    setError(null);
  };

  // Filter categories to only show ones with active links
  const availableCategories = Object.entries(SOCIAL_CATEGORIES).map(([id, category]) => {
    // Get platforms in this category that have links
    const availablePlatforms = Object.keys(category.links)
      .filter(platform => user.socialLinks?.[platform]);

    return {
      id,
      ...category,
      availablePlatforms
    };
  }).filter(category => category.availablePlatforms.length > 0);

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
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Choose What to Share
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Select which information to share with {username}
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

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {availableCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <category.icon className={`h-5 w-5 ${category.iconColor}`} />
                      <div className="text-left">
                        <h3 className="text-sm font-medium text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-500">
                          {category.availablePlatforms.length} {
                            category.availablePlatforms.length === 1 ? 'platform' : 'platforms'
                          } available
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAll(category.id);
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Select All
                      </button>
                      {expandedCategories.includes(category.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedCategories.includes(category.id) && (
                    <div className="p-4 space-y-4">
                      {category.availablePlatforms.map((platform) => {
                        const platformConfig = category.links[platform];
                        const Icon = platformConfig.icon;
                        const value = user.socialLinks?.[platform];
                        const isSelected = selectedLinks[platform];

                        return (
                          <div
                            key={platform}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isSelected
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
                                <h4 className="text-sm font-medium text-gray-900">
                                  {platformConfig.label}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {value}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedLinks(prev => ({
                                ...prev,
                                [platform]: !prev[platform]
                              }))}
                              className={`p-2 rounded-full ${
                                isSelected
                                  ? 'text-indigo-600 hover:bg-indigo-100'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              {isSelected ? (
                                <Eye className="h-5 w-5" />
                              ) : (
                                <EyeOff className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center px-4 py-2.5 text-gray-700 hover:text-gray-900 text-base"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </button>
                )}
                <div className="flex space-x-3 ml-auto">
                  <button
                    onClick={handleSubmit}
                    disabled={!Object.values(selectedLinks).some(value => value)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-base font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}