import React, { useState, useEffect } from 'react';
import { Tag, X, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterestsInputProps {
  interests: string[];
  onChange: (interests: string[]) => void;
}

// Predefined interest categories with suggestions
const INTEREST_CATEGORIES = {
  'Professional': [
    'Software Development', 'Design', 'Marketing', 'Finance', 'Data Science',
    'Product Management', 'Entrepreneurship', 'Leadership', 'AI', 'Blockchain',
    'Cloud Computing', 'UX Research', 'Digital Marketing', 'Content Creation'
  ],
  'Creative': [
    'Photography', 'Writing', 'Music', 'Art', 'Film', 'Design', 'Fashion',
    'Drawing', 'Painting', 'Sculpture', 'Animation', 'Graphic Design'
  ],
  'Technology': [
    'Programming', 'Web Development', 'Mobile Apps', 'AI', 'Machine Learning',
    'Cybersecurity', 'Blockchain', 'IoT', 'Cloud Computing', 'Data Science',
    'Robotics', 'Virtual Reality', 'Augmented Reality'
  ],
  'Lifestyle': [
    'Travel', 'Fitness', 'Cooking', 'Reading', 'Hiking', 'Yoga', 'Meditation',
    'Running', 'Cycling', 'Swimming', 'Gardening', 'Home Improvement'
  ],
  'Business': [
    'Entrepreneurship', 'Startups', 'Investing', 'Marketing', 'E-commerce',
    'Real Estate', 'Finance', 'Leadership', 'Management', 'Sales', 'Strategy'
  ],
  'Education': [
    'Teaching', 'Learning', 'Languages', 'Science', 'History', 'Mathematics',
    'Literature', 'Philosophy', 'Psychology', 'Research', 'Academic Writing'
  ]
};

export function InterestsInput({ interests, onChange }: InterestsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on search query
  const filteredSuggestions = searchQuery
    ? Object.entries(INTEREST_CATEGORIES).reduce((acc, [category, items]) => {
        const filtered = items.filter(item => 
          item.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !interests.includes(item)
        );
        if (filtered.length > 0) {
          acc[category] = filtered;
        }
        return acc;
      }, {} as Record<string, string[]>)
    : INTEREST_CATEGORIES;

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent, value?: string) => {
    const interestToAdd = value || inputValue.trim();
    
    if (!interestToAdd) return;
    
    // Don't add duplicates
    if (!interests.includes(interestToAdd)) {
      onChange([...interests, interestToAdd]);
    }
    
    setInputValue('');
    setSearchQuery('');
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    onChange(interests.filter(interest => interest !== interestToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddInterest(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Interests
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {interests.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              No interests added yet. Add some below.
            </p>
          ) : (
            interests.map((interest, index) => (
              <motion.span
                key={interest}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                >
                  <span className="sr-only">Remove interest</span>
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))
          )}
        </div>
      </div>

      {/* Add New Interest */}
      <div>
        <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-2">
          Add New Interest
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="interest"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Type an interest and press Enter"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
          />
          {inputValue && (
            <button
              type="button"
              onClick={(e) => handleAddInterest(e)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Plus className="h-5 w-5 text-gray-400 hover:text-indigo-500" />
            </button>
          )}
        </div>
      </div>

      {/* Interest Suggestions */}
      {showSuggestions && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Suggestions</h3>
            <button
              type="button"
              onClick={() => setShowSuggestions(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(filteredSuggestions).map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeCategory === category
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Suggestions */}
          <div className="max-h-48 overflow-y-auto">
            {Object.entries(filteredSuggestions)
              .filter(([category]) => !activeCategory || category === activeCategory)
              .map(([category, items]) => (
                <div key={category} className="mb-3 last:mb-0">
                  {activeCategory === null && (
                    <h4 className="text-xs font-medium text-gray-500 mb-2">{category}</h4>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {items
                      .filter(item => !interests.includes(item))
                      .slice(0, 8)
                      .map(item => (
                        <button
                          key={item}
                          type="button"
                          onClick={(e) => handleAddInterest(e, item)}
                          className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Adding interests helps others find common ground with you and makes connections more meaningful.
      </p>
    </div>
  );
}