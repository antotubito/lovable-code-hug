import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from './auth/AuthProvider';

export function ConnectionErrorBanner() {
  const { error, connectionStatus, reconnectSupabase } = useAuth();
  
  if (connectionStatus !== 'disconnected' || !error) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>Connection to Supabase lost. Please check your internet connection.</span>
        </div>
        <button
          onClick={() => reconnectSupabase()}
          className="flex items-center bg-white text-red-500 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Reconnect
        </button>
      </div>
    </motion.div>
  );
}