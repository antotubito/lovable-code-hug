import React from 'react';
import { Smartphone, Apple, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppStoreButtonsProps {
  className?: string;
  showTitle?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function AppStoreButtons({ 
  className = '', 
  showTitle = true,
  size = 'medium'
}: AppStoreButtonsProps) {
  // App store links - replace with actual links when available
  const APP_STORE_LINKS = {
    ios: '#', // Replace with actual iOS App Store link
    android: '#' // Replace with actual Google Play Store link
  };
  
  // Size classes
  const sizeClasses = {
    small: {
      container: 'flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2',
      button: 'px-3 py-2 text-xs',
      icon: 'h-4 w-4 mr-1.5'
    },
    medium: {
      container: 'flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4',
      button: 'px-4 py-2.5 text-sm',
      icon: 'h-5 w-5 mr-2'
    },
    large: {
      container: 'flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6',
      button: 'px-6 py-3 text-base',
      icon: 'h-6 w-6 mr-2.5'
    }
  };
  
  return (
    <div className={`${className}`}>
      {showTitle && (
        <h3 className="text-center font-medium text-gray-900 mb-4">
          Download the Dislink App
        </h3>
      )}
      
      <div className={`flex ${sizeClasses[size].container}`}>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={APP_STORE_LINKS.ios}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center ${sizeClasses[size].button} bg-black text-white rounded-xl hover:bg-gray-800 transition-colors`}
        >
          <Apple className={sizeClasses[size].icon} />
          App Store
        </motion.a>
        
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={APP_STORE_LINKS.android}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center ${sizeClasses[size].button} bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors`}
        >
          <ShoppingBag className={sizeClasses[size].icon} />
          Google Play
        </motion.a>
      </div>
    </div>
  );
}