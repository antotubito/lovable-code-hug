import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, MapPin, Globe, Heart, 
  Linkedin, Twitter, Github, Instagram, Facebook, Youtube,
  MessageCircle as WhatsApp, Link as LinkIcon, Download,
  BookOpen, Users, Star, Sparkles, ArrowRight, Send as Telegram,
  MessageSquare as Discord, Twitch, AtSign as Threads,
  Coffee as BuyMeACoffee, Heart as Patreon, Rss as Substack,
  Send, Check, Briefcase, Video, Music, DollarSign, Calendar,
  Ghost, Dribbble, X, Copy, QrCode, Share2, Edit2, AlertTriangle,
  PlusCircle, ChevronDown, ChevronUp, Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../../types/user';
import { SOCIAL_CATEGORIES } from '../../config/social';
import { logger } from '../../lib/logger';

interface ProfileViewProps {
  user: User;
  onEdit: () => void;
  onEditSection?: (section: string) => void;
}

export function ProfileView({ user, onEdit, onEditSection }: ProfileViewProps) {
  const [showCompletionTips, setShowCompletionTips] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['about', 'social']);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Log user data for debugging
  logger.debug('ProfileView rendering with user data:', { 
    userId: user?.id,
    hasData: !!user,
    name: user?.name,
    socialLinksCount: user?.socialLinks ? Object.keys(user.socialLinks).length : 0
  });

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  // Handle copy profile link
  const handleCopyProfileLink = async () => {
    try {
      const profileUrl = `${window.location.origin}/share/${user.id}`;
      await navigator.clipboard.writeText(profileUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  // Handle case when user is null or undefined
  if (!user) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Check if user has social links, interests, and bio
  const hasSocialLinks = user.socialLinks && Object.keys(user.socialLinks).length > 0;
  const hasInterests = user.interests && user.interests.length > 0;
  const hasBio = user.bio?.about || user.bio?.location || user.bio?.from;
  const hasLocation = user.bio?.location;
  const hasFrom = user.bio?.from;
  const hasJobInfo = user.jobTitle && user.company;

  // Calculate profile completion percentage
  const completionItems = [
    !!user.profileImage,
    !!user.coverImage,
    hasBio,
    hasInterests,
    hasSocialLinks,
    hasLocation,
    hasFrom,
    hasJobInfo
  ];
  
  const completedItems = completionItems.filter(Boolean).length;
  const completionPercentage = Math.round((completedItems / completionItems.length) * 100);
  
  // Determine which sections need completion
  const incompleteSections = {
    photo: !user.profileImage,
    cover: !user.coverImage,
    bio: !user.bio?.about,
    location: !hasLocation,
    from: !hasFrom,
    interests: !hasInterests,
    socialLinks: !hasSocialLinks,
    jobInfo: !hasJobInfo
  };

  // Handle section-specific edit actions
  const handleEditSection = (section: string) => {
    if (onEditSection) {
      onEditSection(section);
    } else {
      onEdit();
    }
  };

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64">
        {user.coverImage ? (
          <img
            src={user.coverImage}
            alt="Profile cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center justify-center">
            <button
              onClick={() => handleEditSection('images')}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Cover Image
            </button>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Edit Cover Button */}
        {user.coverImage && (
          <button
            onClick={() => handleEditSection('images')}
            className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <Pencil className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Profile Completion Banner */}
      {completionPercentage < 100 && showCompletionTips && (
        <div className="absolute top-4 right-4 left-4 sm:left-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                Complete Your Profile
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Your profile is {completionPercentage}% complete. Add more information to make connections easier.
              </p>
              <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            <button 
              onClick={() => setShowCompletionTips(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={onEdit}
            className="mt-3 w-full text-center text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            Complete Now
          </button>
        </div>
      )}

      {/* Profile Content */}
      <div className="px-6 -mt-12 relative z-10">
        {/* Profile Header */}
        <div className="sm:flex sm:items-end sm:space-x-5">
          <div className="relative flex">
            {user.profileImage ? (
              <div className="relative">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-24 w-24 rounded-xl ring-4 ring-white object-cover sm:h-32 sm:w-32"
                />
                <button
                  onClick={() => handleEditSection('images')}
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-24 w-24 rounded-xl ring-4 ring-white bg-indigo-100 flex items-center justify-center sm:h-32 sm:w-32">
                <button
                  onClick={() => handleEditSection('images')}
                  className="flex flex-col items-center justify-center w-full h-full text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <PlusCircle className="h-8 w-8 mb-1" />
                  <span className="text-xs">Add Photo</span>
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 truncate flex items-center">
                {user.name}
                <button
                  onClick={() => handleEditSection('basic')}
                  className="ml-2 p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </h1>
              {user.jobTitle && (
                <p className="text-lg text-gray-600">
                  {user.jobTitle}
                  {user.company && (
                    <> at {user.company}</>
                  )}
                </p>
              )}
              {!user.jobTitle && !user.company && (
                <button
                  onClick={() => handleEditSection('basic')}
                  className="mt-1 text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Job Information
                </button>
              )}
            </div>
            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Edit2 className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                <span>Edit Profile</span>
              </button>
              
              <button
                type="button"
                onClick={handleCopyProfileLink}
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Copy className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="mt-8 space-y-8">
          {/* About Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => toggleSection('about')}
            >
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-gray-400" />
                About
              </h2>
              <div className="flex items-center">
                {!hasBio && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSection('bio');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center mr-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Bio
                  </button>
                )}
                {expandedSections.includes('about') ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.includes('about') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {/* Location Info */}
                  {(hasLocation || hasFrom) ? (
                    <div className="flex flex-wrap gap-6 mb-4">
                      {user.bio?.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                          <span>Located in {user.bio.location}</span>
                        </div>
                      )}
                      {user.bio?.from && (
                        <div className="flex items-center text-gray-600">
                          <Globe className="h-5 w-5 mr-2 text-gray-400" />
                          <span>From {user.bio.from}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Add your location information to help people connect with you</p>
                      </div>
                      <button
                        onClick={() => handleEditSection('bio')}
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center whitespace-nowrap"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Location
                      </button>
                    </div>
                  )}

                  {/* Bio Text */}
                  {user.bio?.about ? (
                    <div className="prose max-w-none mb-6">
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {user.bio.about}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tell others about yourself, your interests, and your expertise</p>
                      </div>
                      <button
                        onClick={() => handleEditSection('bio')}
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center whitespace-nowrap"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Bio
                      </button>
                    </div>
                  )}

                  {/* Interests */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-gray-400" />
                        Interests
                      </h3>
                      {!hasInterests && (
                        <button
                          onClick={() => handleEditSection('interests')}
                          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add Interests
                        </button>
                      )}
                    </div>
                    
                    {hasInterests ? (
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-600">Add your interests to help others connect with you based on shared passions</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Social Links */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => toggleSection('social')}
            >
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-gray-400" />
                Social Links
              </h2>
              <div className="flex items-center">
                {!hasSocialLinks && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSection('social');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center mr-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Social Links
                  </button>
                )}
                {expandedSections.includes('social') ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.includes('social') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {hasSocialLinks ? (
                    /* Group links by category */
                    Object.entries(SOCIAL_CATEGORIES).map(([categoryKey, category]) => {
                      const categoryLinks = Object.entries(user.socialLinks || {})
                        .filter(([key]) => category.links[key])
                        .map(([key, value]) => ({
                          key,
                          value,
                          ...category.links[key]
                        }));

                      if (categoryLinks.length === 0) return null;

                      return (
                        <div key={categoryKey} className="mb-6 last:mb-0">
                          <div className={`p-4 rounded-lg bg-gradient-to-br ${category.color} mb-4`}>
                            <div className="flex items-center">
                              <category.icon className={`h-5 w-5 ${category.iconColor} mr-3`} />
                              <h4 className="font-medium text-gray-900">{category.title}</h4>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categoryLinks.map(({ key, value, icon: Icon, color, label }) => (
                              <a
                                key={key}
                                href={value as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200"
                              >
                                <div className="flex items-center">
                                  <Icon 
                                    className="h-5 w-5 mr-3"
                                    style={{ color }}
                                  />
                                  <span className="font-medium text-gray-700">
                                    {label}
                                  </span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-100 text-center">
                      <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <LinkIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Connect Your Social Profiles</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add your social media profiles to make it easier for people to connect with you across platforms.
                      </p>
                      <button
                        onClick={() => handleEditSection('social')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Social Links
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Completion Card */}
          {completionPercentage < 100 && (
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-xl shadow-sm text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Profile Completion
                </h2>
                <span className="text-xl font-bold">{completionPercentage}%</span>
              </div>
              
              <div className="h-2 w-full bg-white/20 rounded-full mb-4">
                <div 
                  className="h-full bg-white rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              
              <div className="space-y-2 mb-4">
                {incompleteSections.photo && (
                  <div className="flex items-center text-white/90">
                    <div className="w-5 h-5 mr-2 rounded-full border border-white/40 flex items-center justify-center">
                      <span className="text-xs">•</span>
                    </div>
                    <span className="text-sm">Add a profile photo</span>
                  </div>
                )}
                {incompleteSections.cover && (
                  <div className="flex items-center text-white/90">
                    <div className="w-5 h-5 mr-2 rounded-full border border-white/40 flex items-center justify-center">
                      <span className="text-xs">•</span>
                    </div>
                    <span className="text-sm">Add a cover image</span>
                  </div>
                )}
                {incompleteSections.bio && (
                  <div className="flex items-center text-white/90">
                    <div className="w-5 h-5 mr-2 rounded-full border border-white/40 flex items-center justify-center">
                      <span className="text-xs">•</span>
                    </div>
                    <span className="text-sm">Write a bio</span>
                  </div>
                )}
                {incompleteSections.location && (
                  <div className="flex items-center text-white/90">
                    <div className="w-5 h-5 mr-2 rounded-full border border-white/40 flex items-center justify-center">
                      <span className="text-xs">•</span>
                    </div>
                    <span className="text-sm">Add your current location</span>
                  </div>
                )}
                {incompleteSections.interests && (
                  <div className="flex items-center text-white/90">
                    <div className="w-5 h-5 mr-2 rounded-full border border-white/40 flex items-center justify-center">
                      <span className="text-xs">•</span>
                    </div>
                    <span className="text-sm">Add your interests</span>
                  </div>
                )}
                {incompleteSections.socialLinks && (
                  <div className="flex items-center text-white/90">
                    <div className="w-5 h-5 mr-2 rounded-full border border-white/40 flex items-center justify-center">
                      <span className="text-xs">•</span>
                    </div>
                    <span className="text-sm">Connect social profiles</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={onEdit}
                className="w-full py-2 bg-white text-indigo-700 rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Complete Your Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}