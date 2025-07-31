import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, UserCircle as UserIcon, Building2, MapPin, Calendar } from 'lucide-react';
import type { User } from '../../types/user';
import { createConnectionRequest } from '../../lib/contacts';
import { ConnectionNotification } from '../notifications/ConnectionNotification';

interface ConnectionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User;
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  } | null;
}

export function ConnectionConfirmation({
  isOpen,
  onClose,
  onConfirm,
  user,
  location
}: ConnectionConfirmationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create connection request with location data
      await createConnectionRequest({
        userId: user.id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        company: user.company,
        profileImage: user.profileImage,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          timestamp: new Date()
        } : undefined
      });
      
      setShowNotification(true);
      onConfirm();
    } catch (error) {
      console.error('Error creating connection:', error);
      setError(error instanceof Error ? error.message : 'Failed to create connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 text-center">
                <div className="mb-4">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto">
                      <UserIcon className="h-12 w-12 text-indigo-600" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Connect with {user.name}?
                </h3>
                {(user.jobTitle || user.company) && (
                  <div className="mt-2 flex items-center justify-center text-gray-500">
                    <Building2 className="h-4 w-4 mr-1.5" />
                    <p className="text-sm">
                      {user.jobTitle}
                      {user.company && ` at ${user.company}`}
                    </p>
                  </div>
                )}
                
                {/* Location information */}
                {location && (
                  <div className="mt-2 flex items-center justify-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    <p className="text-sm">
                      Current location: {location.name || 'GPS Location'}
                    </p>
                  </div>
                )}
                
                {/* Current date */}
                <div className="mt-2 flex items-center justify-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <p className="text-sm">
                    {new Date().toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Connecting...
                    </div>
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConnectionNotification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        name={user.name}
        title={user.jobTitle}
        company={user.company}
        image={user.profileImage}
        time="just now"
      />
    </>
  );
}