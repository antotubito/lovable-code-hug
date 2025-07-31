import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Building2, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'connection' | 'message' | 'reminder';
  title: string;
  description?: string;
  image?: string;
  time: string;
  read: boolean;
  contactId?: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll
}: NotificationDropdownProps) {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    onMarkAsRead(notification.id);
    
    // For connection notifications, navigate to the home page requests section
    if (notification.type === 'connection') {
      navigate('/app');
      // Add a small delay to ensure the page loads before scrolling
      setTimeout(() => {
        const requestsSection = document.getElementById('connection-requests');
        if (requestsSection) {
          requestsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-indigo-600" />
                  <h3 className="ml-2 text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No new notifications
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                          {notification.image ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={notification.image}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-lg font-medium text-indigo-600">
                                {notification.title.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          {notification.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {notification.description}
                            </p>
                          )}
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {notification.time}
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="ml-3">
                            <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}