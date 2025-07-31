import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConnectionNotificationProps {
  show: boolean;
  onClose: () => void;
  name: string;
  title?: string;
  company?: string;
  image?: string;
  time: string;
}

export function ConnectionNotification({
  show,
  onClose,
  name,
  title,
  company,
  image,
  time
}: ConnectionNotificationProps) {
  const navigate = useNavigate();

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const handleClick = () => {
    navigate('/app/contacts');
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 cursor-pointer"
          onClick={handleClick}
        >
          <div className="p-4">
            <div className="flex items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {image ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={image}
                    alt={name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-indigo-600">
                      {name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New connection with {name}
                </p>
                {(title || company) && (
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Building2 className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <p>
                      {title}
                      {company && ` at ${company}`}
                    </p>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">{time}</p>
              </div>

              {/* Close Button */}
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}