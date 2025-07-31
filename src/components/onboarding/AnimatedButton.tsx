import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader } from 'lucide-react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: React.ElementType;
  variant?: 'primary' | 'secondary';
}

export function AnimatedButton({ 
  children, 
  loading, 
  icon: Icon = ArrowRight,
  variant = 'primary',
  ...props 
}: AnimatedButtonProps) {
  const baseStyles = "w-full flex justify-center items-center px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 disabled:opacity-50";
  const variantStyles = {
    primary: "border border-transparent shadow-sm text-white bg-indigo-600 hover:bg-indigo-700",
    secondary: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader className="animate-spin h-5 w-5 mr-2" />
          Loading...
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon className="ml-2 h-5 w-5" />}
        </>
      )}
    </motion.button>
  );
}