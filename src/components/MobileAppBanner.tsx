import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';
import { isMobileApp, isIOS, isAndroid } from '../lib/mobileUtils';

interface MobileAppBannerProps {
  onClose?: () => void;
}

export function MobileAppBanner({ onClose }: MobileAppBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Don't show banner if already in the mobile app
    if (isMobileApp()) {
      return;
    }
    
    // Check if banner was previously dismissed
    const bannerDismissed = localStorage.getItem('mobile_banner_dismissed');
    const dismissedTime = bannerDismissed ? parseInt(bannerDismissed, 10) : 0;
    const currentTime = Date.now();
    
    // Show banner if never dismissed or dismissed more than 7 days ago
    if (!bannerDismissed || (currentTime - dismissedTime > 7 * 24 * 60 * 60 * 1000)) {
      setIsVisible(true);
    }
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('mobile_banner_dismissed', Date.now().toString());
    if (onClose) onClose();
  };
  
  const getAppStoreLink = () => {
    // Replace with actual App Store link when available
    return '#';
  };
  
  const getPlayStoreLink = () => {
    // Replace with actual Play Store link when available
    return '#';
  };
  
  const getAppLink = () => {
    // Detect device and return appropriate store link
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      return getAppStoreLink();
    } else if (/Android/i.test(navigator.userAgent)) {
      return getPlayStoreLink();
    }
    
    // Default to website with both options
    return '#download';
  };
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 bg-indigo-600 text-white z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center">
              <span className="flex p-2 rounded-lg bg-indigo-800">
                <Smartphone className="h-6 w-6" />
              </span>
              <p className="ml-3 font-medium truncate">
                <span className="md:hidden">Get the Dislink app!</span>
                <span className="hidden md:inline">Get a better experience with the Dislink mobile app</span>
              </p>
            </div>
            <div className="flex-shrink-0 order-2 sm:order-3 sm:ml-3">
              <button
                onClick={handleClose}
                type="button"
                className="-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <a
                href={getAppLink()}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Now
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}