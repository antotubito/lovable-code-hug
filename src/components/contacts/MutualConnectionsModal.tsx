import React, { useState, useMemo } from 'react';
import { Search, Users, UserPlus, Check, X, ArrowLeft, Building2, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Contact } from '../../types/contact';

interface MutualConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedConnections: string[]) => void;
  username: string;
  connections: Contact[];
  onBack?: () => void;
}

export function MutualConnectionsModal({
  isOpen,
  onClose,
  onSubmit,
  username,
  connections,
  onBack
}: MutualConnectionsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');

  // Group connections by company
  const groupedConnections = useMemo(() => {
    const filtered = connections.filter(connection =>
      connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort connections
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.meetingDate || 0).getTime() - new Date(a.meetingDate || 0).getTime();
      }
      return a.name.localeCompare(b.name);
    });

    // Group by company
    return sorted.reduce((groups, connection) => {
      const company = connection.company || 'Other';
      if (!groups[company]) {
        groups[company] = [];
      }
      groups[company].push(connection);
      return groups;
    }, {} as Record<string, Contact[]>);
  }, [connections, searchQuery, sortBy]);

  const toggleConnection = (connectionId: string) => {
    setSelectedConnections(prev =>
      prev.includes(connectionId)
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedConnections);
    setSelectedConnections([]);
  };

  const handleSkip = () => {
    onSubmit([]);
    setSelectedConnections([]);
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
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mutual Connections
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Select connections you share with {username}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Search and Sort */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search connections..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                  className="pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                >
                  <option value="date">Most Recent</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {/* Connections List */}
            <div className="flex-1 overflow-y-auto p-6">
              {Object.entries(groupedConnections).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No connections found
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedConnections).map(([company, companyConnections]) => (
                    <div key={company}>
                      <h3 className="text-sm font-medium text-gray-900 mb-4">
                        {company} ({companyConnections.length})
                      </h3>
                      <div className="space-y-3">
                        {companyConnections.map((connection) => (
                          <div
                            key={connection.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              selectedConnections.includes(connection.id)
                                ? 'border-indigo-200 bg-indigo-50'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            } transition-colors`}
                          >
                            <div className="flex items-center space-x-4">
                              {connection.profileImage ? (
                                <img
                                  src={connection.profileImage}
                                  alt={connection.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-lg font-medium text-indigo-600">
                                    {connection.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {connection.name}
                                </h4>
                                {connection.jobTitle && (
                                  <p className="text-sm text-gray-500">
                                    {connection.jobTitle}
                                  </p>
                                )}
                                {connection.meetingDate && (
                                  <p className="text-xs text-gray-400 flex items-center mt-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Connected {new Date(connection.meetingDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleConnection(connection.id)}
                              className={`flex items-center p-2 rounded-full transition-colors ${
                                selectedConnections.includes(connection.id)
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              {selectedConnections.includes(connection.id) ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <UserPlus className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    Continue
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