import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Star } from 'lucide-react';

interface OnboardingStepProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  error?: string;
}

export function OnboardingStep({ 
  title, 
  description, 
  icon: Icon,
  children,
  step,
  totalSteps,
  error
}: OnboardingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto"
    >
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-indigo-600">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-indigo-600">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-lg text-gray-600">{description}</p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Content */}
      <div className="bg-white p-8 rounded-xl shadow-sm">
        {children}
      </div>

      {/* Floating decorations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.8
            }}
          >
            {i % 3 === 0 ? (
              <Sparkles className="h-6 w-6 text-indigo-200" />
            ) : i % 3 === 1 ? (
              <Heart className="h-6 w-6 text-pink-200" />
            ) : (
              <Star className="h-6 w-6 text-yellow-200" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}