import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, ChevronRight, MoreVertical, Clock, Building2, Mail, Calendar, MapPin, Tag, Check, X, MessageCircle, UserPlus, Users, Circle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import type { Contact } from '../../types/contact';
import { LocationSelectionModal } from './LocationSelectionModal';
import { TagSelectionModal } from './TagSelectionModal';
import { SocialSharingModal } from './SocialSharingModal';
import { MutualConnectionsModal } from './MutualConnectionsModal';
import { MeetingNoteModal } from './MeetingNoteModal';
import { CelebrationConfetti } from './CelebrationConfetti';
import { BadgeSelectionModal } from './BadgeSelectionModal';
import { TierModal } from './TierModal';
import { logger } from '../../lib/logger';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onAccept?: (
    id: string, 
    location: { name: string; latitude: number; longitude: number; venue?: string; eventContext?: string }, 
    tags: string[],
    sharedLinks: Record<string, boolean>,
    mutualConnections: string[],
    note?: string,
    badges?: string[]
  ) => Promise<void>;
  onDecline?: (id: string) => Promise<void>;
  onUpdateTier?: (id: string, tier: 1 | 2 | 3) => Promise<void>;
  contacts?: Contact[];
}

interface DeclineConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactName: string;
}

function DeclineConfirmation({ isOpen, onClose, onConfirm, contactName }: DeclineConfirmationProps) {
  // Funny decline messages
  const declineMessages = [
    `Are you sure you want to leave ${contactName} on read? That's cold! 🥶`,
    `${contactName} will be devastated! Are you really going to break their digital heart? 💔`,
    `This is your chance to avoid another awkward conversation with ${contactName}. Proceed?`,
    `${contactName} might cry digital tears if you decline. Still want to do this? 😢`,
    `Warning: Declining ${contactName} may result in one less holiday card this year. Continue?`,
    `${contactName} was probably just going to send you cat memes anyway. Decline anyway?`,
    `Plot twist: ${contactName} is secretly a networking guru. Sure you want to miss out?`,
    `Your networking score will drop by 5 points if you decline ${contactName}. Just kidding! Or are we?`,
    `${contactName} might be your future boss. No pressure or anything! Still declining?`,
    `Are you certain you want to send ${contactName} to the shadow realm of declined connections?`
  ];

  // Select a random message
  const randomMessage = declineMessages[Math.floor(Math.random() * declineMessages.length)];

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
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <X className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Decline Connection
              </h3>
              <p className="text-gray-600">
                {randomMessage}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700"
              >
                Yes, Decline
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const ContactCard = ({ contact, onEdit, onDelete, onAccept, onDecline, onUpdateTier, contacts = [] }: ContactCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showMutualModal, setShowMutualModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showNotesPreview, setShowNotesPreview] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [processing, setProcessing] = useState(false);
  const noteButtonRef = useRef<HTMLDivElement>(null);
  const notePopupRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; latitude: number; longitude: number; venue?: string; eventContext?: string }>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<Record<string, boolean>>({});
  const [selectedMutuals, setSelectedMutuals] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [meetingNote, setMeetingNote] = useState<string>();
  const [isHovered, setIsHovered] = useState(false);

  const isRequest = Boolean(onAccept && onDecline);
  const lastNote = contact.notes[0];

  const resetState = () => {
    setSelectedLocation(undefined);
    setSelectedTags([]);
    setSelectedLinks({});
    setSelectedMutuals([]);
    setSelectedBadges([]);
    setMeetingNote(undefined);
    setShowLocationModal(false);
    setShowTagModal(false);
    setShowSocialModal(false);
    setShowMutualModal(false);
    setShowBadgeModal(false);
    setShowNoteModal(false);
    setShowTierModal(false);
    setProcessing(false);
  };

  const handleLocationSelect = (location: { name: string; latitude: number; longitude: number; venue?: string; eventContext?: string }) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
    setShowTagModal(true);
  };

  const handleTagsSubmit = (tags: string[]) => {
    setSelectedTags(tags);
    setShowTagModal(false);
    setShowSocialModal(true);
  };

  const handleSocialSubmit = (sharedLinks: Record<string, boolean>) => {
    setSelectedLinks(sharedLinks);
    setShowSocialModal(false);
    setShowMutualModal(true);
  };

  const handleMutualSubmit = (mutualConnections: string[]) => {
    setSelectedMutuals(mutualConnections);
    setShowMutualModal(false);
    setShowBadgeModal(true);
  };

  const handleBadgeSubmit = (badges: string[]) => {
    setSelectedBadges(badges);
    setShowBadgeModal(false);
    setShowNoteModal(true);
  };

  const handleNoteSubmit = async (note: string, followUp?: { date: string; description: string }) => {
    setMeetingNote(note);
    await handleAccept();
  };

  const handleTierSubmit = async (tier: 1 | 2 | 3) => {
    if (onUpdateTier) {
      try {
        setProcessing(true);
        await onUpdateTier(contact.id, tier);
        setShowTierModal(false);
      } catch (error) {
        logger.error('Error updating contact tier:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleAccept = async () => {
    if (onAccept && selectedLocation) {
      try {
        setProcessing(true);
        logger.info('Accepting connection request', { 
          contactId: contact.id,
          location: selectedLocation,
          tagsCount: selectedTags.length,
          sharedLinksCount: Object.keys(selectedLinks).filter(k => selectedLinks[k]).length,
          mutualConnectionsCount: selectedMutuals.length,
          hasNote: !!meetingNote,
          badgesCount: selectedBadges.length
        });
        
        await onAccept(
          contact.id,
          selectedLocation,
          selectedTags,
          selectedLinks,
          selectedMutuals,
          meetingNote,
          selectedBadges
        );
        
        setShowCelebration(true);
        
        // Reset state and close modals after a delay
        setTimeout(() => {
          setShowCelebration(false);
          resetState();
        }, 3000);
      } catch (error) {
        logger.error('Error accepting connection request:', error);
        resetState();
      }
    }
    setShowNoteModal(false);
  };

  const handleLocationSkip = () => {
    if (contact.requestLocation) {
      handleLocationSelect(contact.requestLocation);
    } else {
      handleLocationSelect({
        name: 'Unknown Location',
        latitude: 0,
        longitude: 0
      });
    }
  };

  const handleTagsSkip = () => {
    handleTagsSubmit([]);
  };

  const handleSocialSkip = () => {
    handleSocialSubmit({});
  };

  const handleMutualSkip = () => {
    handleMutualSubmit([]);
  };

  const handleBadgeSkip = () => {
    handleBadgeSubmit([]);
  };

  const handleNoteSkip = () => {
    handleNoteSubmit('');
  };

  const handleCardClick = () => {
    if (!isRequest) {
      navigate(`/app/contact/${contact.id}`);
    }
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (noteButtonRef.current) {
      const buttonRect = noteButtonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const popupWidth = 280; // Width of popup
      const popupHeight = 150; // Approximate height of popup
      
      // Calculate position
      let left = buttonRect.left;
      let top = buttonRect.top;
      
      // Adjust horizontal position if too close to right edge
      if (left + popupWidth > windowWidth - 16) {
        left = windowWidth - popupWidth - 16;
      }
      
      // Adjust vertical position if too close to bottom edge
      if (top + popupHeight > windowHeight - 16) {
        top = windowHeight - popupHeight - 16;
      }
      
      // Ensure popup doesn't go off-screen to the left
      left = Math.max(16, left);
      
      setPopupPosition({
        top: top + window.scrollY,
        left
      });
    }
    
    setShowNotesPreview(!showNotesPreview);
  };

  const handleAcceptClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (processing) return;
    setShowLocationModal(true);
  };

  const handleDeclineClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (processing) return;
    setShowDeclineConfirm(true);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleSetTier = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowTierModal(true);
  };

  const confirmDecline = async () => {
    if (!onDecline) return;
    
    try {
      setProcessing(true);
      logger.info('Declining connection request', { contactId: contact.id });
      await onDecline(contact.id);
    } catch (error) {
      logger.error('Error declining connection request:', error);
    } finally {
      setProcessing(false);
      setShowDeclineConfirm(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notePopupRef.current && 
        noteButtonRef.current && 
        !notePopupRef.current.contains(event.target as Node) &&
        !noteButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotesPreview(false);
      }

      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to render tier badge
  const renderTierBadge = () => {
    if (!contact.tier) return null;
    
    const tierColors = { 
      1: 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200',
      2: 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200',
      3: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-200'
    };
    
    const tierLabels = {
      1: 'Inner Circle',
      2: 'Middle Circle',
      3: 'Outer Circle'
    };
    
    return (
      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${tierColors[contact.tier]} border shadow-sm`}>
        <Circle className="h-3 w-3 inline mr-1" />
        {tierLabels[contact.tier]}
      </div>
    );
  };

  const CardContent = () => (
    <div 
      className="p-6 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderTierBadge()}
      
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {contact.profileImage ? (
            <img
              src={contact.profileImage}
              alt={contact.name} 
              className="h-12 w-12 rounded-full object-cover shadow-sm border border-gray-100"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center shadow-sm border border-indigo-200">
              <span className="text-xl font-medium text-indigo-600">
                {contact.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
              {/* Sparkle animation when hovered */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </motion.div>
                )}
              </AnimatePresence>
              {!isRequest && contact.notes.length > 0 && (
                <div className="relative inline-block">
                  <div
                    ref={noteButtonRef}
                    onClick={handleNotesClick}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleNotesClick(e as any);
                      }
                    }}
                    aria-label="Show notes"
                  >
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <AnimatePresence>
                    {showNotesPreview && lastNote && (
                      <motion.div
                        ref={notePopupRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                          position: 'fixed',
                          top: `${popupPosition.top}px`,
                          left: `${popupPosition.left}px`,
                          zIndex: 50,
                          maxWidth: '280px',
                          width: '100%'
                        }}
                        className="bg-white rounded-lg shadow-lg p-4"
                      >
                        <div className="text-sm text-gray-600 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
                          {lastNote.content}
                        </div>
                        <div className="mt-2 text-xs text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(lastNote.createdAt).toLocaleDateString()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            {contact.jobTitle && contact.company && (
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <Building2 className="h-4 w-4 mr-1.5" />
                <span className="truncate">{contact.jobTitle} at {contact.company}</span>
              </p>
            )}
            {isRequest && (
              <div className="mt-3 space-y-1.5">
                {contact.requestDate && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="truncate">Connected on {new Date(contact.requestDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </p>
                )}
                {contact.requestLocation && (
                  <p className="text-sm text-gray-600 flex items-start">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400 mt-0.5" />
                    <span>
                      {contact.requestLocation.name}
                      {contact.requestLocation.venue && (
                        <span className="ml-1 text-gray-500">
                          @ {contact.requestLocation.venue}
                        </span>
                      )}
                      {contact.requestLocation.eventContext && (
                        <span className="block text-indigo-600">
                          {contact.requestLocation.eventContext}
                        </span>
                      )}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {isRequest ? (
          <div className="flex -mt-1 -mr-1">
            <div
              onClick={handleAcceptClick} 
              className={`p-1.5 sm:p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer rounded-full ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleAcceptClick(e as any);
                }
              }}
              aria-label="Accept request"
            >
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div
              onClick={handleDeclineClick}
              className={`ml-1 p-1.5 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer rounded-full ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleDeclineClick(e as any);
                }
              }}
              aria-label="Decline request"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              onClick={handleMenuToggle}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer rounded-full"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleMenuToggle(e as any);
                }
              }}
              aria-label="Contact options"
            >
              <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            
            {/* Dropdown menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200 overflow-hidden"
                >
                  <div>
                    <button
                      onClick={handleSetTier}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center border-b border-gray-100"
                    >
                      <Circle className="h-4 w-4 mr-2 text-indigo-500" />
                      Set Relationship Circle
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false); 
                        onEdit(contact);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Contact
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete(contact.id);
                      }} 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center border-t border-gray-100"
                    >
                      <svg className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Contact
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {contact.meetingDate && (
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1.5 text-indigo-400" />
            <span className="truncate">Connected on {new Date(contact.meetingDate).toLocaleDateString()}</span>
          </div>
        )}
        {contact.meetingLocation && (
          <div className="flex items-start text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1.5 mt-0.5 text-indigo-400" />
            <div>
              {contact.meetingLocation.name}
              {contact.meetingLocation.venue && ` - ${contact.meetingLocation.venue}`}
              {contact.meetingLocation.eventContext && (
                <span className="block text-indigo-600 font-medium mt-1">
                  {contact.meetingLocation.eventContext}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {contact.tags.map((tag, index) => (
            <motion.span
              whileHover={{ scale: 1.05 }}
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <motion.div 
        whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
        className={`bg-white rounded-xl shadow-sm transition-all duration-200 overflow-hidden ${
          !isRequest ? 'cursor-pointer' : ''
        } border border-gray-100`}
        onClick={handleCardClick}
        role={!isRequest ? "button" : undefined}
        tabIndex={!isRequest ? 0 : undefined}
        onKeyDown={(e) => {
          if (!isRequest && (e.key === 'Enter' || e.key === ' ')) {
            handleCardClick();
          }
        }}
      >
        <CardContent />
      </motion.div>

      {user && (
        <>
          <LocationSelectionModal
            isOpen={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            onSelect={handleLocationSelect}
            onSkip={handleLocationSkip}
            currentLocation={undefined}
            username={contact.name.split(' ')[0]}
            suggestedLocation={contact.requestLocation}
          />

          <TagSelectionModal
            isOpen={showTagModal}
            onClose={() => setShowTagModal(false)}
            onSubmit={handleTagsSubmit}
            onSkip={handleTagsSkip}
            username={contact.name.split(' ')[0]}
            contacts={contacts}
            onBack={() => {
              setShowTagModal(false);
              setShowLocationModal(true);
            }}
          />

          <SocialSharingModal
            isOpen={showSocialModal}
            onClose={() => setShowSocialModal(false)}
            onSubmit={handleSocialSubmit}
            onSkip={handleSocialSkip}
            user={user}
            username={contact.name.split(' ')[0]}
            onBack={() => {
              setShowSocialModal(false);
              setShowTagModal(true);
            }}
          />

          <MutualConnectionsModal
            isOpen={showMutualModal}
            onClose={() => setShowMutualModal(false)}
            onSubmit={handleMutualSubmit}
            onSkip={handleMutualSkip}
            username={contact.name.split(' ')[0]}
            connections={contacts}
            onBack={() => {
              setShowMutualModal(false);
              setShowSocialModal(true);
            }}
          />

          <BadgeSelectionModal
            isOpen={showBadgeModal}
            onClose={() => setShowBadgeModal(false)}
            onSubmit={handleBadgeSubmit}
            onSkip={handleBadgeSkip}
            username={contact.name.split(' ')[0]}
            onBack={() => {
              setShowBadgeModal(false);
              setShowMutualModal(true);
            }}
          />

          <MeetingNoteModal
            isOpen={showNoteModal}
            onClose={() => setShowNoteModal(false)}
            onSubmit={handleNoteSubmit}
            onSkip={handleNoteSkip}
            username={contact.name.split(' ')[0]}
            onBack={() => {
              setShowNoteModal(false);
              setShowBadgeModal(true);
            }}
          />

          <TierModal
            isOpen={showTierModal}
            onClose={() => setShowTierModal(false)}
            onSubmit={handleTierSubmit}
            currentTier={contact.tier}
            contactName={contact.name.split(' ')[0]}
          />

          <DeclineConfirmation
            isOpen={showDeclineConfirm}
            onClose={() => setShowDeclineConfirm(false)}
            onConfirm={confirmDecline}
            contactName={contact.name.split(' ')[0]}
          />
        </>
      )}

      <AnimatePresence>
        {showCelebration && (
          <CelebrationConfetti 
            onComplete={() => {
              setShowCelebration(false);
              resetState();
            }} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ContactCard;