import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Coffee, Music, Dumbbell, Utensils, Plane, Palette, BookOpen, User, Clock, MessageCircle, Globe, Lock, Briefcase, Lightbulb, Check, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Need } from '../../types/need';
import { getNeedReplies, sendNeedReply, markNeedAsSatisfied } from '../../lib/needs';
import { useAuth } from '../auth/AuthProvider';
import { NeedReply } from '../../types/need';
import { NeedChatView } from './NeedChatView';

interface NeedStoryModalProps {
  need: Need;
  onClose: () => void; 
  onMarkSatisfied?: (needId: string) => void;
}

export function NeedStoryModal({ need, onClose, onMarkSatisfied }: NeedStoryModalProps) {
  const { user } = useAuth();
  const [reply, setReply] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const [replies, setReplies] = useState<NeedReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChatView, setShowChatView] = useState(false);

  // Handle mark as satisfied
  const handleMarkSatisfied = async () => {
    if (!onMarkSatisfied) return;
    
    try {
      await markNeedAsSatisfied(need.id);
      onMarkSatisfied(need.id);
    } catch (error) {
      console.error('Error marking need as satisfied:', error);
    }
  };

  useEffect(() => {
    const loadReplies = async () => {
      try {
        setLoading(true);
        // Only load replies from the current user
        const repliesData = await getNeedReplies(need.id, user?.id);
        setReplies(repliesData);
      } catch (error) {
        console.error('Error loading replies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReplies();
  }, [need.id, user?.id]);

  // Get icon based on category
  const getIcon = () => {
    switch (need.category) {
      case 'socialize':
        return Coffee;
      case 'events':
        return Music;
      case 'active':
        return Dumbbell;
      case 'food':
        return Utensils;
      case 'travel':
        return Plane;
      case 'creative':
        return Palette;
      case 'learning':
        return BookOpen;
      case 'professional':
        return Briefcase;
      case 'ideas':
        return Lightbulb;
      default:
        return Coffee;
    }
  };

  // Get color based on category
  const getColor = () => {
    switch (need.category) {
      case 'socialize':
        return 'bg-blue-500 text-white';
      case 'events':
        return 'bg-purple-500 text-white';
      case 'active':
        return 'bg-green-500 text-white';
      case 'food':
        return 'bg-yellow-500 text-white';
      case 'travel':
        return 'bg-red-500 text-white';
      case 'creative':
        return 'bg-pink-500 text-white';
      case 'learning':
        return 'bg-indigo-500 text-white';
      case 'professional':
        return 'bg-sky-500 text-white';
      case 'ideas':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const Icon = getIcon();
  const badgeColor = getColor();

  const handleReply = async () => {
    if (!reply.trim() || !user) return;
    
    try {
      const newReply = await sendNeedReply({
        needId: need.id,
        message: reply.trim(),
        userName: user.name,
        userImage: user.profileImage
      });
      
      // Add new reply to the list
      setReplies([...replies, newReply]);
      
      // Show success message
      setReplySent(true);
      
      // Clear form
      setReply('');
      setShowReplyForm(false);
      
      // Hide success message after a delay
      setTimeout(() => {
        setReplySent(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  // Check if need is expired
  const isExpired = need.expiresAt && new Date(need.expiresAt) < new Date();
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!need.expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(need.expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    // If already expired
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`;
    } else {
      return `${diffMinutes}m remaining`;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
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
  };

  // If chat view is active, show the chat interface
  if (showChatView) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white z-50 flex flex-col"
      >
        <NeedChatView 
          need={need} 
          onBack={() => setShowChatView(false)} 
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden border border-indigo-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center">
            {need.userImage ? (
              <img 
                src={need.userImage} 
                alt={need.userName || 'User'} 
                className="h-10 w-10 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{need.userName || 'Anonymous'}</h3>
              <div className="flex items-center">
                <span className="text-xs text-gray-500">
                  {formatDate(need.createdAt)}
                </span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${badgeColor}`}>
                  {need.categoryLabel}
                </span>
                {need.expiresAt && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs flex items-center ${
                    isExpired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
     \               <Clock className="h-3 w-3 mr-1" />
                    {isExpired ? 'Expired' : getTimeRemaining()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-shrink-0">
          <div className="flex items-start mb-6">
            <div className={`p-3 rounded-full ${badgeColor.replace('text-white', '')} mr-4`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-lg font-medium text-gray-900 leading-relaxed">{need.message}</p>
              {need.tags && need.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {need.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowReplyForm(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Start Conversation
              </button>
            </div>
          </div>
          
          {/* Need Status */}
          {need.isSatisfied && (
            <div className="mt-2 bg-green-50 p-3 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">This need has been satisfied</span>
            </div>
          )}
          
          {isExpired && !need.isSatisfied && (
            <div className="mt-2 bg-amber-50 p-3 rounded-lg flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-amber-700 font-medium">This need has expired</span>
            </div>
          )}
          
          {/* Privacy Indicator */}
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            need.visibility === 'private' 
              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
              : 'bg-green-50 text-green-700 border border-green-100'
          }`}>
            {need.visibility === 'private' ? (
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  <span className="font-medium">Private conversation</span> - Only you and the creator can see these messages
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  <span className="font-medium">Public thread</span> - All replies are visible to everyone
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Replies Section */}
        <div className="flex-1 overflow-y-auto border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <MessageCircle className="h-4 w-4 mr-1.5 text-indigo-500" />
              {need.visibility === 'open' ? 'Replies' : 'Your Replies'}
              {replies.length > 0 && (
                <span className="ml-1.5 bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-xs">
                  {replies.length}
                </span>
              )}
            </h4>
            
            {replies.length > 0 && (
              <button
                onClick={() => setShowChatView(true)} 
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-1.5" />
                View Full Chat
                <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            )}
          </div>
          
          {/* Mark as Satisfied Button (only for the creator) */}
          {need.userId === user?.id && !need.isSatisfied && !isExpired && onMarkSatisfied && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleMarkSatisfied}
              className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center shadow-sm"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Mark Need as Satisfied
            </motion.button>
          )}
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div> 
          ) : replies.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
              <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No replies yet</p>
              <p className="text-sm text-gray-400">Be the first to start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show replies based on visibility */}
              {need.visibility === 'open' ? (
                // For open needs, show all replies
                replies.map((replyItem) => (
                  <div key={replyItem.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-start">
                      {replyItem.userImage ? (
                        <img 
                          src={replyItem.userImage} 
                          alt={replyItem.userName || 'User'} 
                          className="h-8 w-8 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-indigo-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">
                            {replyItem.userId === user?.id ? 'You' : replyItem.userName}
                          </h5>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(replyItem.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{replyItem.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // For private needs, only show the user's own replies and responses to them
                <>
                  {/* User's own replies */}
                  {replies.filter(reply => reply.userId === user?.id).length > 0 ? (
                    replies.filter(reply => reply.userId === user?.id).map((replyItem) => (
                    <div key={replyItem.id} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-start">
                        {replyItem.userImage ? (
                          <img 
                            src={replyItem.userImage} 
                            alt={replyItem.userName || 'User'} 
                            className="h-8 w-8 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">You</h5>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeAgo(replyItem.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{replyItem.message}</p>
                        </div>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-white rounded-lg shadow-sm border border-gray-100">
                      <p className="text-gray-500">No replies yet</p>
                      <p className="text-sm text-gray-400 mt-1">Your conversation will be private</p>
                    </div>
                  )}
                  
                  {/* Replies from the need creator to this user */}
                  {replies.filter(reply => reply.userId === need.userId && reply.replyToUserId === user?.id).map((replyItem) => (
                    <div key={replyItem.id} className="bg-indigo-50 rounded-lg shadow-sm p-4">
                      <div className="flex items-start">
                        {replyItem.userImage ? (
                          <img 
                            src={replyItem.userImage} 
                            alt={replyItem.userName || 'User'} 
                            className="h-8 w-8 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">{replyItem.userName}</h5>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeAgo(replyItem.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{replyItem.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
          <AnimatePresence>
            {replySent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-4 p-3 bg-green-50 rounded-lg text-center border border-green-100"
              >
                <p className="text-green-700 font-medium flex items-center justify-center">
                  <Check className="h-4 w-4 mr-1.5" />
                  Your reply has been sent!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {showReplyForm ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <textarea
                value={reply} 
                onChange={(e) => setReply(e.target.value)}
                placeholder={`Reply to ${need.userName || 'this need'}...`}
                className="w-full p-3 border-b border-gray-200 focus:ring-0 focus:outline-none resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!reply.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  Send Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => setShowReplyForm(true)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <span className="text-gray-500">Write a reply...</span>
                  <Send className="h-4 w-4 text-gray-400" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}