import React from 'react';
import { motion } from 'framer-motion';
import { Circle, CheckCircle2, Users, UserCircle, UserPlus } from 'lucide-react';

interface TierSelectorProps {
  currentTier?: 1 | 2 | 3;
  onChange: (tier: 1 | 2 | 3) => void;
  disabled?: boolean;
}

export function TierSelector({ currentTier, onChange, disabled = false }: TierSelectorProps) {
  const tiers = [
    { 
      value: 1, 
      label: 'Inner Circle', 
      description: 'Close connections, frequent contact',
      icon: UserCircle,
      color: 'bg-red-100 text-red-600 border-red-200',
      activeColor: 'bg-red-500 text-white border-red-600'
    },
    { 
      value: 2, 
      label: 'Middle Circle', 
      description: 'Regular connections, occasional contact',
      icon: Users,
      color: 'bg-amber-100 text-amber-600 border-amber-200',
      activeColor: 'bg-amber-500 text-white border-amber-600'
    },
    { 
      value: 3, 
      label: 'Outer Circle', 
      description: 'Acquaintances, infrequent contact',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-600 border-blue-200',
      activeColor: 'bg-blue-500 text-white border-blue-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-3">
        {tiers.map((tier) => {
          const isSelected = currentTier === tier.value;
          const Icon = tier.icon;
          
          return (
            <motion.button
              key={tier.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(tier.value as 1 | 2 | 3)}
              disabled={disabled}
              className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
                isSelected 
                  ? tier.activeColor
                  : `${tier.color} hover:bg-opacity-80`
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex-shrink-0 mr-3">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isSelected ? 'text-white' : ''}`}>{tier.label}</p>
                <p className={`text-sm ${isSelected ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                  {tier.description}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}