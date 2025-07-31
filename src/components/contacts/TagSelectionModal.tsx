import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Contact } from '../../types/contact';

interface TagSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tags: string[]) => void;
  username: string;
  contacts?: Contact[];
  onBack?: () => void;
}

// Relationship categories with predefined tags
const RELATIONSHIP_TAGS = {
  'Personal': [
    'Close Friend',
    'Friend of Friend',
    'Gym Buddy',
    'Travel Companion',
    'Roommate',
    'Neighbor',
    'Study Partner',
    'Hobby Friend',
    'Sports Team',
    'Band Member'
  ],
  'Social': [
    'Party Friend',
    'Concert Buddy',
    'Gaming Friend',
    'Book Club',
    'Dance Partner',
    'Art Group',
    'Food Explorer',
    'Adventure Buddy',
    'Festival Friend',
    'Coffee Mate'
  ],
  'Professional': [
    'Colleague',
    'Mentor',
    'Mentee',
    'Business Partner',
    'Client',
    'Service Provider',
    'Industry Peer',
    'Collaborator',
    'Advisor',
    'Team Member'
  ],
  'Community': [
    'Volunteer',
    'Organizer',
    'Fellow Speaker',
    'Community Leader',
    'Alumni',
    'Local Group',
    'Social Cause',
    'Support Network',
    'Event Regular',
    'Workshop Friend'
  ],
  'Creative': [
    'Art Collaborator',
    'Music Partner',
    'Writing Group',
    'Photography Buddy',
    'Design Peer',
    'Film Club',
    'Theater Group',
    'Craft Circle',
    'Creative Project',
    'Jam Session'
  ]
};

export function TagSelectionModal({
  isOpen,
  onClose,
  onSubmit,
  username,
  contacts = [],
  onBack
}: TagSelectionModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get frequently used tags from existing contacts
  const frequentTags = React.useMemo(() => {
    const tagCounts = contacts.reduce((acc, contact) => {
      contact.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [contacts]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setError(null);
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      const newTag = customTag.trim();
      if (!selectedTags.includes(newTag)) {
        setSelectedTags(prev => [...prev, newTag]);
      }
      setCustomTag('');
      setError(null);
    }
  };

  const handleSubmit = () => {
    if (selectedTags.length === 0) {
      setError('Please select at least one tag');
      return;
    }
    onSubmit(selectedTags);
    setSelectedTags([]);
    setCustomTag('');
    setError(null);
  };

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
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    What role does {username} play in your life?
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Select tags that describe your relationship
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
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="mb-6 text-sm text-red-600 bg-red-50 p-4 rounded-lg">
                  {error}
                </div>
              )}

              {/* Frequent Tags */}
              {frequentTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Frequently Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {frequentTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-500 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Relationship Categories */}
              <div className="space-y-6">
                {Object.entries(RELATIONSHIP_TAGS).map(([category, tags]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-500 ring-offset-2'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="mt-6">
                <label htmlFor="customTag" className="block text-sm font-medium text-gray-900 mb-2">
                  Add Custom Tag
                </label>
                <input
                  type="text"
                  id="customTag"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Type and press Enter to add"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                />
              </div>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Selected Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          onClick={() => handleTagToggle(tag)}
                          className="ml-1.5 p-0.5 hover:bg-indigo-200 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </button>
                )}
                <div className="flex space-x-3 ml-auto">
                  <button
                    onClick={() => onSubmit([])}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
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