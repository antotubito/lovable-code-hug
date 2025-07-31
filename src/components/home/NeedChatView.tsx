import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowLeft, Coffee, Music, Dumbbell, Utensils, Plane, Palette, BookOpen, Briefcase, Lightbulb, Globe, Lock, AlertTriangle, CheckCircle, X, MessageCircle } from 'lucide-react';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { useAuth } from '../auth/AuthProvider';
import { getNeedReplies, sendNeedReply } from '../../lib/needs';
import type { Need, NeedReply } from '../../types/need';
import { formatDistanceToNow } from 'date-fns';

interface NeedChatViewProps {
  need: Need;
  onBack: () => void;
}

export function NeedChatView({ need, onBack }: NeedChatViewProps) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<NeedReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);

  useEffect(() => {
    const loadReplies = async () => {
      try {
        setLoading(true);
        // Only load replies from the current user or to the current user
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

  useEffect(() => {
    // Scroll to bottom when replies change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  const handleSendMessage = async (message: string) => {
    if (!user) return;
    
    try {
      setSending(true);
      
      // For private needs, set the replyToUserId to the need creator
      const replyToUserId = need.visibility === 'private' ? need.userId : undefined;
      
      const newReply = await sendNeedReply({
        needId: need.id,
        message,
        userName: user.name,
        userImage: user.profileImage,
        replyToUserId
      });
      
      setReplies([...replies, newReply]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Get icon based on category
  const getIcon = () => {
    switch (need.category) {
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
  };

  // Get color based on category
  const getColor = () => {
    switch (need.category) {
      case 'socialize': return 'bg-blue-500 text-white';
      case 'events': return 'bg-purple-500 text-white';
      case 'active': return 'bg-green-500 text-white';
      case 'food': return 'bg-yellow-500 text-white';
      case 'travel': return 'bg-red-500 text-white';
      case 'creative': return 'bg-pink-500 text-white';
      case 'learning': return 'bg-indigo-500 text-white';
      case 'professional': return 'bg-sky-500 text-white';
      case 'ideas': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const Icon = getIcon();
  const badgeColor = getColor();

  // Check if need is expired or satisfied
  const isExpired = need.expiresAt && new Date(need.expiresAt) < new Date();
  const isSatisfied = need.isSatisfied;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white shadow-sm">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 mr-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </motion.button>
        
        <div className="flex items-center flex-1">
          {need.userImage ? (
            <img 
              src={need.userImage} 
              alt={need.userName || 'User'} 
              className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-white shadow-sm"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 border-2 border-white shadow-sm">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
          )}
          
          <div>
            <h3 className="font-medium text-gray-900">{need.userName || 'Anonymous'}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded-full text-xs ${badgeColor}`}>
                {need.categoryLabel}
              </span>
              
              <span className={`px-2 py-0.5 rounded-full text-xs flex items-center ${
                need.visibility === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {need.visibility === 'open' ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Banner */}
      {(isExpired || isSatisfied) && (
        <div className={`p-3 ${isSatisfied ? 'bg-green-50' : 'bg-amber-50'} flex items-center justify-center`}>
          {isSatisfied ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-700 font-medium">This need has been satisfied</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
              <span className="text-sm text-amber-700 font-medium">This need has expired</span>
            </>
          )}
        </div>
      )}
      
      {/* Privacy Banner */}
      {need.visibility === 'private' && showPrivacyBanner && (
        <div className="p-3 bg-indigo-50 flex items-center justify-between">
          <div className="flex items-center">
            <Lock className="h-4 w-4 text-indigo-600 mr-2" />
            <span className="text-sm text-indigo-700">
              This is a private conversation between you and {need.userName || 'the creator'}
            </span>
          </div>
          <button 
            onClick={() => setShowPrivacyBanner(false)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Original Need */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm mb-2">
        <div className="flex items-start">
          <div className={`p-3 rounded-full ${badgeColor.replace('text-white', '')} mr-3 flex-shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-gray-900">{need.message}</p>
            {need.tags && need.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {need.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div> 
          </div>
        ) : replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center max-w-sm">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="text-gray-700 font-medium mb-2">No messages yet</p>
              <p className="text-sm text-gray-500">
                {need.visibility === 'private' 
                  ? 'This is a private conversation between you and the creator' 
                  : 'Start the conversation!'}
              </p>
              <button
                onClick={() => document.querySelector('input')?.focus()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Start Conversation
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {need.visibility === 'private' 
              // For private needs, only show the current user's replies and the creator's replies to them
              ? replies
                  .filter(reply => 
                    reply.userId === user?.id || 
                    (reply.userId === need.userId && reply.replyToUserId === user?.id)
                  )
                  .map((reply) => (
                    <ChatBubble 
                      key={reply.id} 
                      reply={reply} 
                      isCurrentUser={reply.userId === user?.id}
                    />
                  ))
              // For public needs, show all replies
              : replies.map((reply) => (
                  <ChatBubble 
                    key={reply.id} 
                    reply={reply} 
                    isCurrentUser={reply.userId === user?.id}
                  />
                ))
            }
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <ChatInput 
          onSendMessage={handleSendMessage}
          placeholder={need.visibility === 'private' 
            ? `Send a private message to ${need.userName || 'the creator'}...` 
            : `Reply to ${need.userName || 'this need'}...`}
          disabled={sending || !user}
        />
      </div>
    </div>
  );
}