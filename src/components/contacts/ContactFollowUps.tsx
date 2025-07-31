import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Plus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FollowUp } from '../../types/contact';

interface ContactFollowUpsProps {
  followUps: FollowUp[];
  onAddFollowUp?: (data: { dueDate: Date; description: string }) => Promise<void>;
  onToggleComplete?: (id: string, completed: boolean) => Promise<void>;
}

export function ContactFollowUps({
  followUps,
  onAddFollowUp,
  onToggleComplete,
}: ContactFollowUpsProps) {
  const [showForm, setShowForm] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dueDate || !description.trim()) return;
    if (!onAddFollowUp) {
      setError('Follow-up functionality not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAddFollowUp({
        dueDate: new Date(dueDate),
        description: description.trim(),
      });
      setDueDate('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add follow-up');
    } finally {
      setLoading(false);
    }
  }

  // Sort follow-ups by due date (closest first) and completion status
  const sortedFollowUps = [...followUps].sort((a, b) => {
    // Completed items go to the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Group follow-ups by status
  const pendingFollowUps = sortedFollowUps.filter(f => !f.completed);
  const completedFollowUps = sortedFollowUps.filter(f => f.completed);

  // Check if a follow-up is overdue
  const isOverdue = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  // Format due date relative to today
  const formatDueDate = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const followUpDate = new Date(dueDate);
    followUpDate.setHours(0, 0, 0, 0);
    
    if (followUpDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (followUpDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else if (followUpDate < today) {
      const diffTime = Math.abs(today.getTime() - followUpDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} overdue`;
    } else {
      return followUpDate.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Follow-ups</h3>
        {onAddFollowUp && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            {showForm ? 'Cancel' : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add Follow-up
              </>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 bg-gray-50 rounded-lg p-4 overflow-hidden"
          >
            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Follow-up'
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {sortedFollowUps.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            No follow-ups scheduled
          </p>
        ) : (
          <>
            {/* Pending Follow-ups */}
            {pendingFollowUps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Pending</h4>
                {pendingFollowUps.map((followUp) => {
                  const overdue = isOverdue(followUp.dueDate);
                  return (
                    <div
                      key={followUp.id}
                      className={`flex items-start justify-between p-4 rounded-lg ${
                        overdue 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`text-sm ${overdue ? 'text-red-800' : 'text-gray-900'}`}>
                          {followUp.description}
                        </p>
                        <div className={`mt-1 flex items-center text-sm ${
                          overdue ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {formatDueDate(followUp.dueDate)}
                        </div>
                      </div>
                      {onToggleComplete && (
                        <button
                          onClick={() => onToggleComplete(followUp.id, true)}
                          className={`ml-4 p-1 rounded-full transition-colors ${
                            overdue
                              ? 'text-red-600 hover:bg-red-100'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-green-600'
                          }`}
                        >
                          <CheckCircle className="h-6 w-6" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed Follow-ups */}
            {completedFollowUps.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-gray-700">Completed</h4>
                {completedFollowUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 line-through">
                        {followUp.description}
                      </p>
                      <div className="mt-1 flex items-center text-sm text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        Completed
                      </div>
                    </div>
                    {onToggleComplete && (
                      <button
                        onClick={() => onToggleComplete(followUp.id, false)}
                        className="ml-4 p-1 text-green-500 hover:text-gray-400 rounded-full hover:bg-gray-100"
                      >
                        <XCircle className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}