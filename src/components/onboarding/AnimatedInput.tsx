import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
  error?: string;
}

export function AnimatedInput({ 
  label, 
  icon: Icon, 
  error,
  type,
  ...props 
}: AnimatedInputProps) {
  // Special handling for date inputs
  if (type === 'date') {
    // Calculate minimum date (12 years ago)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100); // Allow up to 100 years old
    
    // Calculate maximum date (12 years ago)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 12); // Must be at least 12 years old

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            className={`
              block w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm
              text-gray-900 placeholder-gray-400
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              ${error ? 'border-red-300' : 'border-gray-300'}
              appearance-none
              bg-white
              cursor-pointer
              transition-colors
              hover:border-indigo-300
            `}
            style={{
              // Override default date input appearance
              backgroundImage: 'none'
            }}
            min={minDate.toISOString().split('T')[0]}
            max={maxDate.toISOString().split('T')[0]}
            {...props}
          />
          <div 
            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            aria-hidden="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-400"
            >
              {props.value ? (
                new Date(props.value as string).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              ) : null}
            </motion.div>
          </div>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
        <p className="text-xs text-gray-500">
          You must be at least 12 years old to use Dislink
        </p>
      </motion.div>
    );
  }

  // Regular input rendering
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={`
            block w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg shadow-sm
            text-gray-900 placeholder-gray-400
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}