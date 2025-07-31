import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, ChevronRight, MoreVertical, Clock, Tag, Calendar, MapPin, Building2, Briefcase, Users, X, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Contact, ContactFilters } from '../../types/contact';
import ContactCard from './ContactCard';
import { ContactForm } from './ContactForm';
import { ContactFilters as ContactFiltersComponent } from './ContactFilters';
import { listContacts, createContact, updateContact, deleteContact, listRecentContacts, updateContactTier } from '../../lib/contacts';
import { TierSelector } from './TierSelector';

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'tier1' | 'tier2' | 'tier3'>('all');
  const [filters, setFilters] = useState<ContactFilters>({
    search: '',
    tags: [],
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showTierFilter, setShowTierFilter] = useState(false);
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | undefined>(undefined);

  const lastScrollY = useRef(0);
  const pullToRefreshRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    loadData();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = () => {
    lastScrollY.current = window.scrollY;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = async (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const pull = touchY - touchStartY.current;

    if (window.scrollY === 0 && pull > 0) {
      setIsPulling(true);
      if (pull > 100 && !refreshing) {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPulling(false);
  };

  async function loadData() {
    try {
      const [allContacts, recentContactsData] = await Promise.all([
        listContacts(),
        listRecentContacts(3)
      ]);
      setContacts(allContacts);
      setRecentContacts(recentContactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(contactData: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'notes' | 'followUps'>) {
    try {
      const newContact = await createContact(contactData);
      setContacts([newContact, ...contacts]);
      await loadData(); // Refresh both lists
      setShowForm(false);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  }

  async function handleUpdate(contactData: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'notes' | 'followUps'>) {
    if (!editingContact) return;
    
    try {
      const updatedContact = await updateContact(editingContact.id, contactData);
      setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
      await loadData(); // Refresh both lists
      setEditingContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await deleteContact(id);
      setContacts(contacts.filter(c => c.id !== id));
      await loadData(); // Refresh both lists
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }

  async function handleUpdateTier(contactId: string, tier: 1 | 2 | 3): Promise<void> {
    try {
      const updatedContact = await updateContactTier(contactId, tier);
      setContacts(contacts.map(c => c.id === contactId ? updatedContact : c));
      await loadData(); // Refresh both lists
    } catch (error) {
      console.error('Error updating contact tier:', error);
      throw error;
    }
  }

  const filteredContacts = contacts
    .filter((contact) => {
      // Filter by tier if active tab is tier-specific
      if (activeTab === 'tier1' && contact.tier !== 1) return false;
      if (activeTab === 'tier2' && contact.tier !== 2) return false;
      if (activeTab === 'tier3' && contact.tier !== 3) return false;
      
      // Base search match across multiple fields
      const searchMatch =
        !filters.search ||
        contact.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        contact.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        contact.company?.toLowerCase().includes(filters.search.toLowerCase()) ||
        contact.jobTitle?.toLowerCase().includes(filters.search.toLowerCase()) ||
        contact.meetingContext?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (contact.meetingLocation?.name && contact.meetingLocation.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (contact.meetingLocation?.venue && contact.meetingLocation.venue.toLowerCase().includes(filters.search.toLowerCase()));

      // Tag filtering
      const tagMatch =
        filters.tags.length === 0 ||
        filters.tags.every((tag) => contact.tags.includes(tag));

      // Category-specific filtering
      let categoryMatch = true;
      if (filters.category) {
        switch (filters.category.id) {
          case 'date':
            if (filters.subCategory === 'year' && filters.search) {
              // Year filtering
              categoryMatch = contact.meetingDate ? 
                new Date(contact.meetingDate).getFullYear().toString() === filters.search : false;
            } else if (filters.subCategory === 'month' && filters.search) {
              // Month filtering - ensure we're using English locale for comparison
              if (contact.meetingDate) {
                const meetingMonth = new Date(contact.meetingDate).toLocaleString('en-US', { month: 'long' });
                categoryMatch = meetingMonth === filters.search;
              } else {
                categoryMatch = false;
              }
            } else if (filters.subCategory === 'recent' && filters.search) {
              // Recent filtering
              const now = new Date();
              const meetingDate = contact.meetingDate ? new Date(contact.meetingDate) : null;
              
              if (!meetingDate) {
                categoryMatch = false;
              } else {
                const daysDiff = Math.floor((now.getTime() - meetingDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (filters.search === 'Today') {
                  categoryMatch = daysDiff === 0;
                } else if (filters.search === 'Yesterday') {
                  categoryMatch = daysDiff === 1;
                } else if (filters.search === 'Last Week') {
                  categoryMatch = daysDiff <= 7;
                } else if (filters.search === 'Last Month') {
                  categoryMatch = daysDiff <= 30;
                }
              }
            }
            break;
            
          case 'location':
            if (filters.subCategory === 'city' && filters.search) {
              // City filtering
              categoryMatch = contact.meetingLocation ? 
                contact.meetingLocation.name.toLowerCase().includes(filters.search.toLowerCase()) : false;
            } else if (filters.subCategory === 'venue' && filters.search) {
              // Venue filtering
              categoryMatch = contact.meetingLocation?.venue ? 
                contact.meetingLocation.venue.toLowerCase().includes(filters.search.toLowerCase()) : false;
            } else if (filters.subCategory === 'event' && filters.search) {
              // Event filtering
              categoryMatch = contact.meetingContext ? 
                contact.meetingContext.toLowerCase().includes(filters.search.toLowerCase()) : false;
            }
            break;
            
          case 'profession':
            if (filters.subCategory === 'job_title' && filters.search) {
              // Job title filtering
              categoryMatch = contact.jobTitle ? 
                contact.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) : false;
            } else if (filters.subCategory === 'company' && filters.search) {
              // Company filtering
              categoryMatch = contact.company ? 
                contact.company.toLowerCase().includes(filters.search.toLowerCase()) : false;
            } else if (filters.subCategory === 'industry' && filters.search) {
              // Industry filtering (from tags)
              categoryMatch = contact.tags.some(tag => 
                tag.toLowerCase().includes(filters.search.toLowerCase())
              );
            }
            break;
            
          case 'interests':
            // Interests filtering
            categoryMatch = contact.interests ? 
              contact.interests.some(interest => 
                interest.toLowerCase().includes(filters.search.toLowerCase())
              ) : false;
            break;
        }
      }

      return searchMatch && tagMatch && categoryMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'meeting_date':
          const dateA = a.meetingDate ? new Date(a.meetingDate).getTime() : 0;
          const dateB = b.meetingDate ? new Date(b.meetingDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'company':
          comparison = (a.company || '').localeCompare(b.company || '');
          break;
        case 'location':
          comparison = (a.meetingLocation?.name || '').localeCompare(b.meetingLocation?.name || '');
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

  const availableTags = Array.from(
    new Set(contacts.flatMap((contact) => contact.tags))
  ).sort();

  const displayedContacts = activeTab === 'recent' ? recentContacts : filteredContacts;

  // Count contacts by tier
  const tier1Count = contacts.filter(c => c.tier === 1).length;
  const tier2Count = contacts.filter(c => c.tier === 2).length;
  const tier3Count = contacts.filter(c => c.tier === 3).length;
  const uncategorizedCount = contacts.filter(c => !c.tier).length;

  return (
    <div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        ref={pullToRefreshRef}
        className={`fixed top-0 left-0 right-0 flex justify-center transition-transform duration-300 z-50 ${
          isPulling ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-b-lg shadow-lg">
          {refreshing ? 'Refreshing...' : 'Pull to refresh'}
        </div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contacts</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Contact
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={() => {
            setActiveTab('all');
            setSelectedTier(undefined);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Contacts
        </button>
        <button
          onClick={() => {
            setActiveTab('recent');
            setSelectedTier(undefined);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
            activeTab === 'recent'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="h-4 w-4 mr-1.5" />
          Recent
        </button>
        <button
          onClick={() => {
            setActiveTab('tier1');
            setSelectedTier(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
            activeTab === 'tier1'
              ? 'bg-red-100 text-red-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Circle className="h-4 w-4 mr-1.5" />
          Inner Circle
          {tier1Count > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === 'tier1' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {tier1Count}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('tier2');
            setSelectedTier(2);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
            activeTab === 'tier2'
              ? 'bg-amber-100 text-amber-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Circle className="h-4 w-4 mr-1.5" />
          Middle Circle
          {tier2Count > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === 'tier2' ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {tier2Count}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('tier3');
            setSelectedTier(3);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap ${
            activeTab === 'tier3'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Circle className="h-4 w-4 mr-1.5" />
          Outer Circle
          {tier3Count > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === 'tier3' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {tier3Count}
            </span>
          )}
        </button>
        {uncategorizedCount > 0 && (
          <button
            onClick={() => {
              setShowTierFilter(true);
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center whitespace-nowrap text-gray-500 hover:text-gray-700"
          >
            <Circle className="h-4 w-4 mr-1.5" />
            Uncategorized
            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
              {uncategorizedCount}
            </span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      {activeTab !== 'recent' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium ${
                showFilters
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ContactFiltersComponent
                  filters={filters}
                  availableTags={availableTags}
                  onFilterChange={setFilters}
                  contacts={contacts}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Contact Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {displayedContacts.map((contact) => (
              <motion.div
                key={`${contact.id}-${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <ContactCard
                  contact={contact}
                  onEdit={setEditingContact}
                  onDelete={(id) => setShowDeleteConfirm(id)}
                  onUpdateTier={handleUpdateTier}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && displayedContacts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No contacts found</h3>
          <p className="mt-1 text-gray-500">
            {activeTab === 'recent'
              ? "No recent connections"
              : activeTab.startsWith('tier')
              ? `No contacts in ${
                  activeTab === 'tier1' ? 'Inner Circle' : 
                  activeTab === 'tier2' ? 'Middle Circle' : 'Outer Circle'
                }`
              : contacts.length === 0
              ? "Get started by creating a new contact"
              : "Try adjusting your search or filters"}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-1.5" />
              Add Contact
            </button>
          </div>
        </motion.div>
      )}

      {/* Contact Form Modal */}
      <AnimatePresence>
        {(showForm || editingContact) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingContact ? 'Edit Contact' : 'Add Contact'}
              </h2>
              <ContactForm
                contact={editingContact || undefined}
                onSubmit={editingContact ? handleUpdate : handleCreate}
                onCancel={() => {
                  setShowForm(false);
                  setEditingContact(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Contact</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this contact? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier Filter Modal */}
      <AnimatePresence>
        {showTierFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">Categorize Uncategorized Contacts</h2>
              <p className="text-gray-600 mb-6">
                You have {uncategorizedCount} uncategorized contacts. Select a relationship circle to categorize them.
              </p>
              
              <TierSelector 
                currentTier={selectedTier}
                onChange={setSelectedTier}
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTierFilter(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedTier) {
                      setActiveTab(selectedTier === 1 ? 'tier1' : selectedTier === 2 ? 'tier2' : 'tier3');
                    }
                    setShowTierFilter(false);
                  }}
                  disabled={!selectedTier}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  View Contacts
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}