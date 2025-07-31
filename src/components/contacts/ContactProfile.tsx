import React, { useState } from 'react';
import { 
  Building2, Mail, Phone, MapPin, Calendar, Tag, 
  MessageCircle, Heart, ArrowLeft, User, Link as LinkIcon,
  ChevronDown, ChevronUp, Globe, Share2, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Contact } from '../../types/contact';
import { ContactNotes } from './ContactNotes';
import { ContactFollowUps } from './ContactFollowUps';
import { SOCIAL_CATEGORIES } from '../../config/social';
import { SharingSettingsModal } from './SharingSettingsModal';

interface ContactProfileProps {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddNote?: (content: string) => Promise<void>;
  onAddFollowUp?: (data: { dueDate: Date; description: string }) => Promise<void>;
  onToggleFollowUp?: (id: string, completed: boolean) => Promise<void>;
  onUpdateSharing?: (contactId: string, sharedLinks: Record<string, boolean>) => Promise<void>;
}

export function ContactProfile({ 
  contact, 
  onClose, 
  onEdit, 
  onDelete,
  onAddNote,
  onAddFollowUp,
  onToggleFollowUp,
  onUpdateSharing
}: ContactProfileProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState<'notes' | 'followups' | 'social' | null>(null);
  const [showSharingModal, setShowSharingModal] = useState(false);

  const toggleSection = (section: 'notes' | 'followups' | 'social') => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Get social icon component based on platform
  const getSocialIcon = (platform: string) => {
    // Look through all categories to find the platform
    for (const [categoryId, category] of Object.entries(SOCIAL_CATEGORIES)) {
      if (category.links[platform]) {
        const Icon = category.links[platform].icon;
        return <Icon className="h-5 w-5" style={{ color: category.links[platform].color }} />;
      }
    }
    
    // Fallback icon if platform not found
    return <LinkIcon className="h-5 w-5 text-gray-400" />;
  };

  const handleSharingUpdate = async (sharedLinks: Record<string, boolean>) => {
    if (onUpdateSharing) {
      await onUpdateSharing(contact.id, sharedLinks);
      setShowSharingModal(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl w-full">
        {/* Cover Image */}
        <div className="relative h-48 sm:h-64">
          {contact.coverImage ? (
            <img
              src={contact.coverImage}
              alt="Profile cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-indigo-800"></div>
          )}
          <div className="absolute inset-0 bg-black/20"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Sharing Settings Button */}
          <button
            onClick={() => setShowSharingModal(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            title="Sharing Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 -mt-12 relative z-10">
          {/* Profile Header */}
          <div className="sm:flex sm:items-end sm:space-x-5">
            <div className="relative flex">
              {contact.profileImage ? (
                <img
                  src={contact.profileImage}
                  alt={contact.name}
                  className="h-24 w-24 rounded-xl ring-4 ring-white object-cover sm:h-32 sm:w-32"
                />
              ) : (
                <div className="h-24 w-24 rounded-xl ring-4 ring-white bg-indigo-100 flex items-center justify-center sm:h-32 sm:w-32">
                  <span className="text-4xl font-medium text-indigo-600">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {contact.name}
                </h1>
                {contact.jobTitle && (
                  <p className="text-lg text-gray-600">
                    {contact.jobTitle}
                    {contact.company && (
                      <> at {contact.company}</>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Sections */}
          <div className="mt-8 space-y-8">
            {/* About Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-400" />
                  About
                </h2>
              </div>

              {/* Location Info */}
              {(contact.bio?.location || contact.bio?.from) && (
                <div className="flex flex-wrap gap-6 mb-4">
                  {contact.bio?.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                      <span>Located in {contact.bio.location}</span>
                    </div>
                  )}
                  {contact.bio?.from && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="h-5 w-5 mr-2 text-gray-400" />
                      <span>From {contact.bio.from}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bio Text */}
              {contact.bio?.about && (
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {contact.bio.about}
                  </p>
                </div>
              )}

              {/* Interests */}
              {contact.interests && contact.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-gray-400" />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {contact.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-gray-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            {contact.socialLinks && Object.keys(contact.socialLinks).length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('social')}
                >
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Social Links
                  </h2>
                  {activeSection === 'social' ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                <AnimatePresence>
                  {activeSection === 'social' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(contact.socialLinks).map(([platform, url]) => {
                          if (!url) return null;
                          return (
                            <a
                              key={platform}
                              href={url as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              {getSocialIcon(platform)}
                              <span className="ml-3 font-medium text-gray-700">
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                              </span>
                              <ChevronUp className="h-4 w-4 ml-auto text-gray-400 rotate-90" />
                            </a>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('notes')}
              >
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-gray-400" />
                  Notes
                </h2>
                {activeSection === 'notes' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <AnimatePresence>
                {activeSection === 'notes' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      <ContactNotes
                        notes={contact.notes}
                        onAddNote={onAddNote}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Follow-ups Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('followups')}
              >
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  Follow-ups
                </h2>
                {activeSection === 'followups' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <AnimatePresence>
                {activeSection === 'followups' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      <ContactFollowUps
                        followUps={contact.followUps}
                        onAddFollowUp={onAddFollowUp}
                        onToggleComplete={onToggleFollowUp}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Meeting Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                Meeting Details
              </h2>
              
              <div className="space-y-4">
                {contact.meetingDate && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date</p>
                      <p className="text-sm text-gray-700">
                        {new Date(contact.meetingDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                
                {contact.meetingLocation && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-700">
                        {contact.meetingLocation.name}
                        {contact.meetingLocation.venue && (
                          <span className="block text-gray-500">
                            {contact.meetingLocation.venue}
                          </span>
                        )}
                        {contact.meetingLocation.eventContext && (
                          <span className="block text-indigo-600 font-medium">
                            {contact.meetingLocation.eventContext}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                
                {contact.meetingContext && (
                  <div className="flex items-start">
                    <MessageCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Context</p>
                      <p className="text-sm text-gray-700">{contact.meetingContext}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sharing Settings Modal */}
      <SharingSettingsModal
        isOpen={showSharingModal}
        onClose={() => setShowSharingModal(false)}
        onSave={handleSharingUpdate}
        contact={contact}
      />
    </>
  );
}