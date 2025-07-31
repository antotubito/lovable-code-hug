import React, { useState } from 'react';
import { Clock, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Note } from '../../types/contact';

interface ContactNotesProps {
  notes: Note[];
  onAddNote?: (content: string) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteName: string;
}

function DeleteConfirmation({ isOpen, onClose, onConfirm, noteName }: DeleteConfirmationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Delete Note
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ContactNotes({ notes, onAddNote, onDeleteNote }: ContactNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = newNote.trim();
    
    if (!content) {
      setError('Note cannot be empty');
      return;
    }

    if (!onAddNote) {
      setError('Note adding functionality not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAddNote(content);
      setNewNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete || !onDeleteNote) return;

    try {
      await onDeleteNote(noteToDelete);
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
    }
  };

  // Sort notes by date (newest first)
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Note Form */}
      {onAddNote && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="note" className="sr-only">
              Add a note
            </label>
            <div className="relative">
              <textarea
                id="note"
                rows={3}
                placeholder="Add a note..."
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                value={newNote}
                onChange={(e) => {
                  setNewNote(e.target.value);
                  setError(null);
                }}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newNote.trim()}
                className="absolute bottom-2 right-2 inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="ml-2">Adding...</span>
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1.5" />
                    Add Note
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {sortedNotes.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No notes yet</p>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-50 rounded-lg p-4 space-y-2 relative group"
            >
              <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <time dateTime={note.createdAt.toISOString()}>
                    {new Date(note.createdAt).toLocaleString()}
                  </time>
                </div>
                {onDeleteNote && (
                  <button
                    onClick={() => handleDeleteClick(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setNoteToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        noteName="this note"
      />
    </div>
  );
}