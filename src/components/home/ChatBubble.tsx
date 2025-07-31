import React from 'react';
import { motion } from 'framer-motion';
import { User, Clock } from 'lucide-react';
import type { NeedReply } from '../../types/need';

interface ChatBubbleProps {
  reply: NeedReply;
  isCurrentUser: boolean;
}

export function ChatBubble({ reply, isCurrentUser }: ChatBubbleProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          {reply.userImage ? (
            <img 
              src={reply.userImage} 
              alt={reply.userName || 'User'} 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
          )}
        </div>
      )}
      
      <div className={`max-w-[75%]`}>
        {!isCurrentUser && (
          <div className="text-sm font-medium text-gray-900 mb-1">
            {reply.userName || 'Anonymous'}
          </div>
        )}
        <div className="flex-shrink-0 ml-3">
          {reply.userImage ? (
            <img 
              src={reply.userImage} 
              alt={reply.userName || 'User'} 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}