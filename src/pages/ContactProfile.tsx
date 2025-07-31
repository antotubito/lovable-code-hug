import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContact, addNote, addFollowUp, toggleFollowUp, updateContactSharing } from '../lib/contacts';
import type { Contact } from '../types/contact';
import { ContactProfile as ContactProfileComponent } from '../components/contacts/ContactProfile';

function ContactProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContact() {
      if (!id) {
        setError('Contact ID is required');
        setLoading(false);
        return;
      }

      try {
        const data = await getContact(id);
        setContact(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contact');
      } finally {
        setLoading(false);
      }
    }

    loadContact();
  }, [id]);

  async function handleAddNote(content: string) {
    if (!contact) return;
    
    try {
      const newNote = await addNote(contact.id, content);
      setContact({
        ...contact,
        notes: [newNote, ...contact.notes]
      });
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  async function handleAddFollowUp(data: { dueDate: Date; description: string }) {
    if (!contact) return;
    
    try {
      const newFollowUp = await addFollowUp(contact.id, data);
      setContact({
        ...contact,
        followUps: [...contact.followUps, newFollowUp]
      });
      return newFollowUp;
    } catch (error) {
      console.error('Error adding follow-up:', error);
      throw error;
    }
  }

  async function handleToggleFollowUp(id: string, completed: boolean) {
    if (!contact) return;
    
    try {
      await toggleFollowUp(contact.id, id, completed);
      setContact({
        ...contact,
        followUps: contact.followUps.map(followUp => 
          followUp.id === id ? { ...followUp, completed } : followUp
        )
      });
    } catch (error) {
      console.error('Error toggling follow-up:', error);
      throw error;
    }
  }

  async function handleUpdateSharing(contactId: string, sharedLinks: Record<string, boolean>) {
    if (!contact) return;
    
    try {
      const updatedContact = await updateContactSharing(contactId, sharedLinks);
      setContact(updatedContact);
    } catch (error) {
      console.error('Error updating sharing settings:', error);
      throw error;
    }
  }

  async function handleDeleteContact() {
    // Implementation will be added when backend is ready
    navigate('/app/contacts');
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-red-700">{error || 'Contact not found'}</p>
          <button
            onClick={() => navigate('/app/contacts')}
            className="mt-4 text-sm text-red-700 hover:text-red-800"
          >
            Return to contacts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ContactProfileComponent
        contact={contact}
        onClose={() => navigate('/app/contacts')}
        onEdit={() => {/* Edit functionality */}}
        onDelete={handleDeleteContact}
        onAddNote={handleAddNote}
        onAddFollowUp={handleAddFollowUp}
        onToggleFollowUp={handleToggleFollowUp}
        onUpdateSharing={handleUpdateSharing}
      />
    </div>
  );
}

// Export the component as ContactProfile
export { ContactProfilePage as ContactProfile };