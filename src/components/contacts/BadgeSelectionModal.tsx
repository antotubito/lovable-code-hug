import React, { useState } from 'react';
import { X, ArrowLeft, Sparkles, Zap, Users, Brain, Eye, Sun, Shield, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BadgeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (badges: string[]) => void;
  onSkip: () => void;
  username: string;
  onBack?: () => void;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'vibe-setter',
    name: 'Vibe Setter',
    description: 'Creates the perfect atmosphere',
    icon: Sparkles
  },
  {
    id: 'energy-booster',
    name: 'Energy Booster',
    description: 'Brings energy to the group',
    icon: Zap
  },
  {
    id: 'smooth-operator',
    name: 'Smooth Operator',
    description: 'Handles things with style',
    icon: Users
  },
  {
    id: 'idea-spark',
    name: 'Idea Spark',
    description: 'Ignites brilliant conversations',
    icon: Brain
  },
  {
    id: 'detail-ninja',
    name: 'Detail Ninja',
    description: 'Catches the little things',
    icon: Eye
  },
  {
    id: 'mood-maven',
    name: 'Mood Maven',
    description: 'Shifts vibes to positive ones',
    icon: Sun
  },
  {
    id: 'reliable-one',
    name: 'The Reliable One',
    description: 'Go-to problem solver',
    icon: Shield
  },
  {
    id: 'wildcard-wizard',
    name: 'Wildcard Wizard',
    description: 'Surprises in the best way',
    icon: Wand2
  }
];

export function BadgeSelectionModal({
  isOpen,
  onClose,
  onSubmit,
  onSkip,
  username,
  onBack
}: BadgeSelectionModalProps) {
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  const toggleBadge = (badgeId: string) => {
    setSelectedBadges(prev =>
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedBadges);
    setSelectedBadges([]);
  };

  const handleSkip = () => {
    onSkip();
    setSelectedBadges([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Give a badge to {username}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose badges that reflect your interaction
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

            {/* Badge Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {AVAILABLE_BADGES.map((badge) => {
                const Icon = badge.icon;
                const isSelected = selectedBadges.includes(badge.id);
                
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleBadge(badge.id)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          isSelected ? 'text-indigo-700' : 'text-gray-900'
                        }`}>
                          {badge.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
                    onClick={handleSkip}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedBadges.length > 0
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={selectedBadges.length === 0}
                  >
                    {selectedBadges.length > 0 ? 'Give Badges' : 'Select Badges'}
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