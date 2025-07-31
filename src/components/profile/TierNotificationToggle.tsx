import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Circle, Users, UserCircle, UserPlus, Info, Check } from 'lucide-react';

interface TierNotificationToggleProps {
  onChange: (tiers: number[]) => void;
  selectedTiers: number[];
  disabled?: boolean;
}

export function TierNotificationToggle({ 
  onChange, 
  selectedTiers, 
  disabled = false 
}: TierNotificationToggleProps) {
  const [showInfo, setShowInfo] = useState(false);

  const tiers = [
    {
      id: 1,
      name: 'Inner Circle',
      description: 'Close connections, frequent contact',
      icon: UserCircle,
      color: 'text-red-600 bg-red-100 border-red-200',
      activeColor: 'text-white bg-gradient-to-r from-red-600 to-red-500 border-red-700',
      hoverColor: 'hover:bg-red-50'
    },
    {
      id: 2,
      name: 'Middle Circle',
      description: 'Regular connections, occasional contact',
      icon: Users,
      color: 'text-amber-600 bg-amber-100 border-amber-200',
      activeColor: 'text-white bg-gradient-to-r from-amber-600 to-amber-500 border-amber-700',
      hoverColor: 'hover:bg-amber-50'
    },
    {
      id: 3,
      name: 'Outer Circle',
      description: 'Acquaintances, infrequent contact',
      icon: UserPlus,
      color: 'text-blue-600 bg-blue-100 border-blue-200',
      activeColor: 'text-white bg-gradient-to-r from-blue-600 to-blue-500 border-blue-700',
      hoverColor: 'hover:bg-blue-50'
    }
  ];

  const toggleTier = (tierId: number) => {
    if (selectedTiers.includes(tierId)) {
      onChange(selectedTiers.filter(id => id !== tierId));
    } else {
      onChange([...selectedTiers, tierId]);
    }
  };

  const toggleAll = () => {
    if (selectedTiers.length === tiers.length) {
      onChange([]);
    } else {
      onChange(tiers.map(tier => tier.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Bell className="h-4 w-4 mr-2 text-gray-400" />
          Notify Relationship Circles
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="ml-2 text-gray-400 hover:text-gray-500"
          >
            <Info className="h-4 w-4" />
          </button>
        </h3>
        <button
          type="button"
          onClick={toggleAll}
          disabled={disabled}
          className={`text-sm font-medium ${
            disabled ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700 hover:underline'
          }`}
        >
          {selectedTiers.length === tiers.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-700"
          >
            When you update your profile information, notifications will be sent to the selected relationship circles.
            This helps keep your connections informed about your latest changes.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const isSelected = selectedTiers.includes(tier.id);
          const Icon = tier.icon;
          
          return (
            <motion.button
              key={tier.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleTier(tier.id)}
              disabled={disabled}
              className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected 
                  ? tier.activeColor + ' shadow-md'
                  : `${tier.color} ${tier.hoverColor}`
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex-shrink-0 mr-3">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                {isSelected && (
                  <span className="absolute top-2 right-2 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">Active</span>
                )}
                <p className={`font-medium text-sm ${isSelected ? 'text-white' : ''}`}>{tier.name}</p>
              </div>
              <div className="flex-shrink-0 ml-2">
                {isSelected ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}