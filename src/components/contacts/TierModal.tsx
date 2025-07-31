import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, ArrowLeft } from 'lucide-react';
import { TierSelector } from './TierSelector';

interface TierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tier: 1 | 2 | 3) => void;
  currentTier?: 1 | 2 | 3;
  contactName: string;
  onBack?: () => void;
}

export function TierModal({
  isOpen,
  onClose,
  onSubmit,
  currentTier,
  contactName,
  onBack
}: TierModalProps) {
  const [selectedTier, setSelectedTier] = React.useState<1 | 2 | 3 | undefined>(currentTier);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedTier(currentTier);
    }
  }, [isOpen, currentTier]);

  const handleSubmit = () => {
    if (selectedTier) {
      onSubmit(selectedTier);
    }
  };

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
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Categorize {contactName}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Select which relationship circle this contact belongs to
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <TierSelector 
                currentTier={selectedTier} 
                onChange={setSelectedTier} 
              />
              
              <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-indigo-800 mb-2">Why categorize your contacts?</h3>
                <p className="text-sm text-indigo-700">
                  Organizing your contacts into circles helps you prioritize your relationships and manage your network more effectively. This allows you to focus your time and energy on the connections that matter most to you.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </button>
                )}
                <div className="flex space-x-3 ml-auto">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedTier}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedTier
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}