import React, { useState } from 'react';
import { X, ArrowLeft, FileText, Calendar, Plus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MeetingNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string, followUp?: { date: string; description: string }) => void;
  onSkip: () => void;
  username: string;
  onBack?: () => void;
}

export function MeetingNoteModal({
  isOpen,
  onClose,
  onSubmit,
  onSkip,
  username,
  onBack
}: MeetingNoteModalProps) {
  const [note, setNote] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpDescription, setFollowUpDescription] = useState('');

  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = () => {
    const followUp = showFollowUp && followUpDate && followUpDescription ? {
      date: followUpDate,
      description: followUpDescription
    } : undefined;

    onSubmit(note.trim(), followUp);
    resetForm();
  };

  const handleSkip = () => {
    onSkip();
    resetForm();
  };

  const resetForm = () => {
    setNote('');
    setShowFollowUp(false);
    setFollowUpDate(defaultDate);
    setFollowUpDescription('');
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
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Add Meeting Notes
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Add some notes about your meeting with {username}
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

            {/* Note Input */}
            <div className="p-6">
              <div className="relative">
                <div className="absolute top-3 left-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={`What did you discuss with ${username}?`}
                  className="w-full pl-10 pr-4 py-2 h-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                These notes will help you remember the context of your meeting.
              </p>

              {/* Follow-up Section */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowFollowUp(!showFollowUp)}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {showFollowUp ? 'Remove follow-up' : 'Add follow-up reminder'}
                </button>

                <AnimatePresence>
                  {showFollowUp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Follow-up Date
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              value={followUpDate}
                              onChange={(e) => setFollowUpDate(e.target.value)}
                              min={defaultDate}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Follow-up Description
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Clock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={followUpDescription}
                              onChange={(e) => setFollowUpDescription(e.target.value)}
                              placeholder="What needs to be done?"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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