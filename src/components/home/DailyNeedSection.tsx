import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ChevronDown, ChevronUp, MessageCircle, Filter,
  Coffee, Music, Dumbbell, Utensils, Plane, Palette, BookOpen,
  Globe, Lock, Users, UserCircle, UserPlus, Circle, X, Search, Check, Heart,
  Sparkles, Zap, Camera, Smile, Lightbulb, Briefcase, Megaphone, Clock
} from 'lucide-react';
import { NeedStory } from './NeedStory';
import { NeedStoryModal } from './NeedStoryModal';
import type { Need } from '../../types/need';

interface CreateNeedModalProps {
  onClose: () => void;
  onSubmit: (need: Omit<Need, 'id' | 'userId' | 'createdAt'>) => void;
}

const NEED_CATEGORIES = [
  { id: 'socialize', label: 'Socialize', icon: Coffee, color: '#3B82F6', description: 'Coffee chats, meetups, networking' },
  { id: 'events', label: 'Events', icon: Music, color: '#8B5CF6', description: 'Conferences, concerts, gatherings' },
  { id: 'active', label: 'Active', icon: Dumbbell, color: '#10B981', description: 'Sports, fitness, outdoor activities' },
  { id: 'food', label: 'Food', icon: Utensils, color: '#F59E0B', description: 'Restaurants, dining, cooking' },
  { id: 'travel', label: 'Travel', icon: Plane, color: '#EF4444', description: 'Trips, transportation, accommodations' },
  { id: 'creative', label: 'Creative', icon: Palette, color: '#EC4899', description: 'Art, design, photography' },
  { id: 'learning', label: 'Learning', icon: BookOpen, color: '#6366F1', description: 'Courses, mentorship, skills' },
  { id: 'professional', label: 'Professional', icon: Briefcase, color: '#0EA5E9', description: 'Career advice, job opportunities' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: '#F59E0B', description: 'Brainstorming, feedback, validation' }
];

const AUDIENCE_TYPES = [
  { id: 'everyone', label: 'Everyone', icon: Globe, description: 'Visible to all Dislink users' },
  { id: 'inner', label: 'Inner Circle', icon: UserCircle, description: 'Only visible to your Inner Circle connections' },
  { id: 'middle', label: 'Middle Circle', icon: Users, description: 'Only visible to your Middle Circle connections' },
  { id: 'outer', label: 'Outer Circle', icon: UserPlus, description: 'Only visible to your Outer Circle connections' },
  { id: 'private', label: 'Private', icon: Lock, description: 'Only visible to you and people you specifically share with' }
];

const INTEREST_TAGS = [
  'Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 
  'Education', 'Real Estate', 'Hospitality', 'Retail', 'Manufacturing',
  'Consulting', 'Legal', 'Nonprofit', 'Media', 'Entertainment',
  'Sports', 'Fitness', 'Food', 'Travel', 'Art', 'Music'
];

const CreateNeedModal: React.FC<CreateNeedModalProps> = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState<'category' | 'details' | 'audience'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<'open' | 'private'>('open');
  const [audienceType, setAudienceType] = useState<string>('everyone');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [duration, setDuration] = useState<24 | 48>(24);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('details');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = () => {
    if (!selectedCategory || !message.trim()) return;
    
    const selectedCategoryData = NEED_CATEGORIES.find(cat => cat.id === selectedCategory);
    
    // Determine visibility based on audience type
    const needVisibility = audienceType === 'private' || audienceType !== 'everyone' ? 'private' : 'open';
    
    // Calculate expiration date based on duration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + duration);
    
    onSubmit({
      category: selectedCategory,
      categoryLabel: selectedCategoryData?.label || 'Other',
      message: message.trim(),
      tags: [...tags, ...selectedInterests],
      visibility: needVisibility,
      expiresAt,
      duration,
      userName: 'Antonio Tubito',
      userImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    });
    
    onClose();
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('category');
    } else if (step === 'audience') {
      setStep('details');
    }
  };

  const filteredInterests = searchQuery 
    ? INTEREST_TAGS.filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    : INTEREST_TAGS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {step === 'category' && 'What do you need help with?'}
                {step === 'details' && 'Tell us more'}
                {step === 'audience' && 'Who should see this?'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {step === 'category' && 'Select a category for your daily need'}
                {step === 'details' && 'Share details about what you need'}
                {step === 'audience' && 'Choose who can see your need'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4 flex space-x-2">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step === 'category' ? 'bg-indigo-600' : 'bg-indigo-200'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step === 'details' ? 'bg-indigo-600' : 'bg-indigo-200'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step === 'audience' ? 'bg-indigo-600' : 'bg-indigo-200'}`}></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              > 
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {NEED_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedCategory === category.id 
                            ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: category.color }} />
                        </div>
                        <span className="text-sm font-medium text-gray-900 mb-1">{category.label}</span>
                        <p className="text-xs text-gray-500 text-center">{category.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-4"
              >
                {selectedCategory && (
                  <div className="flex items-center mb-6 bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ 
                        backgroundColor: `${NEED_CATEGORIES.find(c => c.id === selectedCategory)?.color}20` 
                      }}
                    >
                      {React.createElement(
                        NEED_CATEGORIES.find(c => c.id === selectedCategory)?.icon || Coffee, 
                        { 
                          className: "h-4 w-4", 
                          style: { color: NEED_CATEGORIES.find(c => c.id === selectedCategory)?.color } 
                        }
                      )}
                    </div>
                    <div>
                    <span className="text-sm font-medium text-gray-900">
                      {NEED_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                    </span>
                    <p className="text-xs text-gray-600">
                      {NEED_CATEGORIES.find(c => c.id === selectedCategory)?.description}
                    </p>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you need?
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe what you're looking for..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={5}
                    required
                  />
                  <div className="mt-2 flex justify-between">
                    <p className="text-xs text-gray-500">Be specific to get better responses</p>
                    <p className="text-xs text-gray-500">{message.length} characters</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add tags (optional)
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag and press Enter"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add
                    </motion.button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="pt-6 flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setStep('audience')}
                    disabled={!message.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Next
                    <ChevronDown className="ml-2 h-4 w-4 rotate-270" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'audience' && (
              <motion.div
                key="audience"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-3 mb-6">
                  {AUDIENCE_TYPES.map((audience) => {
                    const Icon = audience.icon;
                    const isSelected = audience.id === audienceType;
                    
                    return (
                      <div
                        key={audience.id}
                        onClick={() => setAudienceType(audience.id)}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                            : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'} mr-3`}>
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{audience.label}</h4>
                          <p className="text-xs text-gray-500">{audience.description}</p>
                        </div>
                        <div className="ml-2">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {audienceType !== 'everyone' && audienceType !== 'private' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" />
                        Target specific interests
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSelectedInterests(selectedInterests.length ? [] : [...INTEREST_TAGS])}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        {selectedInterests.length ? 'Clear all' : 'Select all'}
                      </button>
                    </div>
                    
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search interests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {filteredInterests.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedInterests.includes(interest)
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duration Selection */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                    How long should this need be visible?
                  </h4>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setDuration(24)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                        duration === 24 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-200 text-gray-700 hover:border-indigo-200'
                      }`}
                    >
                      24 hours
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration(48)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                        duration === 48 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-200 text-gray-700 hover:border-indigo-200'
                      }`}
                    >
                      48 hours
                    </button>
                  </div>
                </div>
                
                <div className="pt-6 flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }} 
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                  >
                    <Zap className="h-4 w-4 mr-1.5" />
                    Share
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function DailyNeedSection() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false); 
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Need | null>(null);
  const [needs, setNeeds] = useState<Need[]>([
    // Existing needs with added properties
    {
      id: '1',
      userId: 'user-1',
      userName: 'Sarah Johnson',
      userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      category: 'socialize',
      categoryLabel: 'Socialize',
      message: 'Anyone up for coffee this afternoon in downtown?',
      tags: ['coffee', 'chat'],
      visibility: 'open', // Open visibility
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
      duration: 24,
      isSatisfied: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'Michael Chen',
      userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      category: 'events',
      categoryLabel: 'Events',
      message: 'Got an extra ticket for tonight\'s concert at Madison Square Garden!',
      tags: ['concert', 'music'],
      visibility: 'private', // Private visibility
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // Expires in 48 hours
      duration: 48,
      isSatisfied: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Emma Rodriguez',
      userImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      category: 'learning',
      categoryLabel: 'Learning',
      message: 'Starting a Spanish study group - beginners welcome! Meeting this weekend.',
      tags: ['language', 'study'],
      visibility: 'open', // Open visibility
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
      duration: 24,
      isSatisfied: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    },
    {
      id: '4',
      userId: 'user-4',
      userName: 'David Kim',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      category: 'active',
      categoryLabel: 'Active',
      message: 'Looking for a tennis partner for Sunday morning at Central Park courts.',
      tags: ['sports', 'tennis'],
      visibility: 'private', // Private visibility
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // Expires in 48 hours
      duration: 48,
      isSatisfied: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
    },
    {
      id: '5',
      userId: 'antonio-tubito',
      userName: 'Antonio Tubito',
      userImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      category: 'food',
      categoryLabel: 'Food',
      message: 'Trying that new Italian restaurant downtown tonight. Anyone want to join?',
      tags: ['dining', 'italian'],
      visibility: 'open', // Open visibility
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
      duration: 24,
      isSatisfied: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1) // 1 hour ago
    }
  ]);
  const [satisfiedNeeds, setSatisfiedNeeds] = useState<string[]>([]);

  const handleCreateNeed = (newNeed: Omit<Need, 'id' | 'userId' | 'createdAt'>) => {
    const need: Need = {
      id: `need-${Date.now()}`,
      userId: 'antonio-tubito',
      ...newNeed,
      createdAt: new Date()
    };
    setNeeds([need, ...needs]);
  };

  const handleStoryClick = (need: Need) => {
    setSelectedStory(need);
    setShowStoryModal(true);
  }; 
  
  const handleMarkAsSatisfied = (needId: string) => {
    setNeeds(needs.map(need => 
      need.id === needId 
        ? { ...need, isSatisfied: true } 
        : need
    ));
    setSatisfiedNeeds([...satisfiedNeeds, needId]);
  };

  const handleCloseStoryModal = () => {
    setShowStoryModal(false);
    setSelectedStory(null);
  };

  // Filter needs by category
  const filteredNeeds = selectedCategory 
    ? needs.filter(need => need.category === selectedCategory)
    : needs;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Daily Needs</h2>
            <p className="text-sm text-gray-500">Connect & help your network</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Create</span>
          </motion.button>
          <button
            onClick={() => setExpandedSection(expandedSection ? null : 'needs')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expandedSection ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center ${
              selectedCategory === null
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            All
          </motion.button>
          
          {NEED_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center ${
                  isSelected
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" style={{ color: isSelected ? '#4F46E5' : '#6B7280' }} />
                {category.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Stories Row */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-5 pb-1">
          {/* Create Story Button */}
          <div className="flex-shrink-0 w-20 flex flex-col items-center cursor-pointer" onClick={() => setShowCreateModal(true)}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-2 border-2 border-dashed border-indigo-200 shadow-sm"
            >
              <Plus className="h-7 w-7 text-indigo-500" />
            </motion.button>
            <span className="text-xs text-gray-700 font-medium text-center">
              Create
            </span>
          </div>
          
          {/* Story Items */}
          {filteredNeeds.map((need) => (
            <NeedStory 
              key={need.id}
              need={need}
              onClick={() => handleStoryClick(need)}
            />
          ))}
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
            Recent Posts
          </h3>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Clear filter
            </button>
          )}
        </div>
        
        {filteredNeeds.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No posts found</p>
            {selectedCategory && (
              <p className="text-sm text-gray-400 mt-1">Try selecting a different category</p>
            )}
          </div>
        ) : (
          filteredNeeds.map((need) => (
            <motion.div
              key={need.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleStoryClick(need)}
            >
              <div className="flex items-start space-x-3">
                {need.userImage ? (
                  <img
                    src={need.userImage}
                    alt={need.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-indigo-600">
                      {need.userName?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{need.userName}</h3>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{formatTimeAgo(need.createdAt)}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{need.message}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(need.category)}`}>
                      {React.createElement(getCategoryIcon(need.category), { className: "h-3 w-3 mr-1" })}
                      {need.categoryLabel}
                    </span>
                    
                    {need.visibility === 'open' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </span>
                    )}
                    
                    {need.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        #{tag}
                      </span>
                    ))}
                    {need.tags.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        +{need.tags.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <div className="flex space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-indigo-600">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">{Math.floor(Math.random() * 5)}</span>
                      </button>
                    </div>
                    <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div> 
          ))
        )}
      </div>

      {/* Create Need Modal */}
      <AnimatePresence mode="wait">
        {showCreateModal && (
          <CreateNeedModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateNeed}
          />
        )}
      </AnimatePresence>

      {/* View Story Modal */}
      <AnimatePresence mode="wait">
        {showStoryModal && selectedStory && (
          <NeedStoryModal
            need={selectedStory}
            onClose={handleCloseStoryModal}
            onMarkSatisfied={handleMarkAsSatisfied}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)}h ago`;
  } else {
    return `${Math.floor(diffMins / 1440)}d ago`;
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'socialize': return Coffee;
    case 'events': return Music;
    case 'active': return Dumbbell;
    case 'food': return Utensils;
    case 'travel': return Plane;
    case 'creative': return Palette;
    case 'learning': return BookOpen;
    case 'professional': return Briefcase;
    case 'ideas': return Lightbulb;
    default: return Coffee;
  }
}

function getCategoryBadgeColor(category: string): string {
  switch (category) {
    case 'socialize': return 'bg-blue-100 text-blue-800';
    case 'events': return 'bg-purple-100 text-purple-800';
    case 'active': return 'bg-green-100 text-green-800';
    case 'food': return 'bg-yellow-100 text-yellow-800';
    case 'travel': return 'bg-red-100 text-red-800';
    case 'creative': return 'bg-pink-100 text-pink-800';
    case 'learning': return 'bg-indigo-100 text-indigo-800';
    case 'professional': return 'bg-sky-100 text-sky-800';
    case 'ideas': return 'bg-amber-100 text-amber-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}