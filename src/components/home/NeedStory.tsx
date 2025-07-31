import React, { useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Coffee, Music, Dumbbell, Utensils, Plane, Palette, BookOpen, Globe, Lock, Briefcase, Lightbulb, Sparkles, CheckCircle, Clock } from 'lucide-react';
import type { Need } from '../../types/need';

interface NeedStoryProps {
  need: Need;
  onClick: () => void;
}

export function NeedStory({ need, onClick }: NeedStoryProps) {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  
  // Add pulse animation on hover
  const handleHover = () => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.5 }
    });
  };

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
        return 'from-blue-500 to-blue-300';
      case 'events':
        return 'from-purple-500 to-purple-300';
      case 'active':
        return 'from-green-500 to-green-300';
      case 'food':
        return 'from-yellow-500 to-yellow-300';
      case 'travel':
        return 'from-red-500 to-red-300';
      case 'creative':
        return 'from-pink-500 to-pink-300';
      case 'learning':
        return 'from-indigo-500 to-indigo-300';
      case 'professional':
        return 'from-sky-500 to-sky-300';
      case 'ideas':
        return 'from-amber-500 to-amber-300';
      default:
        return 'from-gray-500 to-gray-300';
    }
  };

  const Icon = getIcon();
  const gradientColor = getColor();

  // Calculate time ago
  const getTimeAgo = () => {
    const now = new Date();
    const createdAt = new Date(need.createdAt);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h`;
    } else {
      return `${Math.floor(diffMins / 1440)}d`;
    }
  };

  // Check if need is expired or satisfied
  const isExpired = need.expiresAt && new Date(need.expiresAt) < new Date();
  const isSatisfied = need.isSatisfied;

  return (
    <div className="flex-shrink-0 w-20 flex flex-col items-center">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick} 
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={controls}
        className="cursor-pointer relative"
      >
        <div className="w-16 h-16 rounded-full relative mb-2 shadow-md">
          {/* Animated gradient border with status */}
          <div className={`absolute inset-0 rounded-full ${
            isSatisfied 
              ? 'bg-green-500' 
              : isExpired 
                ? 'bg-gray-400' 
                : `bg-gradient-to-tr ${gradientColor}`
          } p-0.5 ${isHovered ? 'animate-pulse' : ''} shadow-md`}>
            <div className="absolute inset-0.5 rounded-full bg-white"></div>
          </div>
          
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isSatisfied ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : isExpired ? (
              <Clock className="h-8 w-8 text-gray-400" />
            ) : (
              <Icon className="h-8 w-8 text-gray-700" />
            )}
          </div>
          
          {/* Visibility indicator */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-white shadow-sm z-10">
            {need.visibility === 'open' ? (
              <Globe className="h-4 w-4 text-green-600" />
            ) : (
              <Lock className="h-4 w-4 text-amber-600" />
            )}
          </div>
          
          {/* Time indicator */}
          {!isSatisfied && (
            <div className="absolute -bottom-1 -left-1 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm z-10">
              {getTimeAgo()}
            </div>
          )}
          
          {/* Hover effect */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <span className="text-xs text-gray-700 font-medium truncate w-full text-center leading-tight">
          {isSatisfied ? 'Satisfied' : isExpired ? 'Expired' : (need.userName || need.categoryLabel)}
        </span>
      </motion.div>
    </div>
  );
}