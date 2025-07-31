import React from 'react';
import { ContactList } from '../components/contacts/ContactList';
import { ConnectionCircles } from '../components/home/ConnectionCircles';
import { listContacts } from '../lib/contacts';
import { useState, useEffect } from 'react';
import type { Contact } from '../types/contact';

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContacts() {
      try {
        setLoading(true);
        const contactsData = await listContacts();
        setContacts(contactsData);
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, []);

  return (
    <div className="py-8">
      <ContactList />
      
      {/* Connection Circles at the bottom */}
      {!loading && contacts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <ConnectionCircles contacts={contacts} />
        </div>
      )}
    </div>
  );
}