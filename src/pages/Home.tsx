import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Calendar, CheckCircle, XCircle, User, ArrowRight, 
  ChevronDown, ChevronUp, Plus, QrCode, Filter, Search, 
  Bell, MapPin, Tag, Briefcase, Building2, UserPlus, Users, 
  Sparkles, Zap, Globe, CalendarDays
} from 'lucide-react';
import ContactCard from '../components/contacts/ContactCard';
import { ConnectionStats } from '../components/contacts/ConnectionStats';
import { WorldwideStats } from '../components/contacts/WorldwideStats';
import { FollowUpCalendar } from '../components/home/FollowUpCalendar';
import {
  listConnectionRequests, 
  approveConnectionRequest, 
  declineConnectionRequest, 
  listRecentContacts,
  listContacts,
  createEmilyTechRequest,
  createLisbonConnectionRequest,
  updateContactTier
} from '../lib/contacts';
import type { Contact, FollowUp } from '../types/contact';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { QRModal } from '../components/qr/QRModal';
import DailyNeedSection from '../components/home/DailyNeedSection';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<Contact[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [totalConnections, setTotalConnections] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [allFollowUps, setAllFollowUps] = useState<Array<FollowUp & { contactName: string; contactId: string }>>([]);
  const [showFollowUps, setShowFollowUps] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Check authentication status directly
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [requestsData, recentContactsData, contactsData] = await Promise.all([
          listConnectionRequests(),
          listRecentContacts(3),
          listContacts()
        ]);
        
        setRequests(requestsData);
        setRecentContacts(recentContactsData);
        setAllContacts(contactsData);
        setTotalConnections(contactsData.length);
        
        // Collect all follow-ups from all contacts
        const followUps = contactsData.flatMap(contact => 
          contact.followUps.map(followUp => ({
            ...followUp,
            contactName: contact.name,
            contactId: contact.id
          }))
        );
        
        // Sort follow-ups by due date (closest first)
        const sortedFollowUps = followUps.sort((a, b) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        
        setAllFollowUps(sortedFollowUps);
        
        logger.info('Home data loaded', {
          requestsCount: requestsData.length,
          recentContactsCount: recentContactsData.length,
          totalContacts: contactsData.length,
          followUpsCount: followUps.length
        });
      } catch (error) {
        logger.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user || isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const handleAcceptRequest = async (
    contactId: string, 
    location: { name: string; latitude: number; longitude: number; venue?: string; eventContext?: string }, 
    tags: string[],
    sharedLinks: Record<string, boolean>,
    mutualConnections: string[],
    note?: string,
    badges?: string[]
  ) => {
    try {
      logger.info('Accepting connection request', { contactId });
      
      await approveConnectionRequest(
        contactId, 
        location, 
        tags, 
        sharedLinks, 
        mutualConnections, 
        note, 
        badges
      );
      
      // Update requests list
      setRequests(prev => prev.filter(request => request.id !== contactId));
      
      // Refresh recent contacts and total count after accepting a request
      const [updatedRecentContacts, updatedAllContacts] = await Promise.all([
        listRecentContacts(3),
        listContacts()
      ]);
      
      setRecentContacts(updatedRecentContacts);
      setAllContacts(updatedAllContacts);
      setTotalConnections(updatedAllContacts.length);
      
      logger.info('Connection request accepted successfully', { contactId });
    } catch (error) {
      logger.error('Error accepting connection request:', error);
    }
  };

  const handleDeclineRequest = async (contactId: string) => {
    try {
      logger.info('Declining connection request', { contactId });
      
      await declineConnectionRequest(contactId);
      
      // Update requests list
      setRequests(prev => prev.filter(request => request.id !== contactId));
      
      logger.info('Connection request declined successfully', { contactId });
    } catch (error) {
      logger.error('Error declining connection request:', error);
    }
  };

  const handleUpdateTier = async (contactId: string, tier: 1 | 2 | 3) => {
    try {
      logger.info('Updating contact tier', { contactId, tier });
      
      const updatedContact = await updateContactTier(contactId, tier);
      
      // Update contacts in state
      setAllContacts(prev => 
        prev.map(contact => contact.id === contactId ? updatedContact : contact)
      );
      
      // Update recent contacts if needed
      setRecentContacts(prev => 
        prev.map(contact => contact.id === contactId ? updatedContact : contact)
      );
      
      logger.info('Contact tier updated successfully', { contactId, tier });
    } catch (error) {
      logger.error('Error updating contact tier:', error);
      throw error;
    }
  };

  const handleToggleFollowUp = async (contactId: string, followUpId: string, completed: boolean) => {
    try {
      // In a real implementation, this would call an API to update the follow-up
      logger.info('Toggling follow-up completion', { contactId, followUpId, completed });
      
      // Update local state
      setAllFollowUps(prev => 
        prev.map(followUp => 
          followUp.id === followUpId 
            ? { ...followUp, completed } 
            : followUp
        )
      );
      
      // Update in the contacts list
      setAllContacts(prev => 
        prev.map(contact => {
          if (contact.id === contactId) {
            return {
              ...contact,
              followUps: contact.followUps.map(followUp => 
                followUp.id === followUpId 
                  ? { ...followUp, completed } 
                  : followUp
              )
            };
          }
          return contact;
        })
      );
    } catch (error) {
      logger.error('Error toggling follow-up:', error);
    }
  };

  const handleViewContact = (contactId: string) => {
    navigate(`/app/contact/${contactId}`);
  };

  const createTestRequest = async () => {
    try {
      // Create a test connection request
      const requestId = createEmilyTechRequest();
      
      // Refresh the requests list
      const requestsData = await listConnectionRequests();
      setRequests(requestsData);
      
      logger.info('Test connection request created', { requestId });
    } catch (error) {
      logger.error('Error creating test connection request:', error);
    }
  };

  const createLisbonRequest = async () => {
    try {
      // Create a Lisbon connection request
      const requestId = createLisbonConnectionRequest();
      
      // Refresh the requests list
      const requestsData = await listConnectionRequests();
      setRequests(requestsData);
      
      logger.info('Lisbon connection request created', { requestId });
    } catch (error) {
      logger.error('Error creating Lisbon connection request:', error);
    }
  };

  // Filter contacts based on search query
  const filteredContacts = recentContacts.filter(contact => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      (contact.company && contact.company.toLowerCase().includes(query)) ||
      (contact.jobTitle && contact.jobTitle.toLowerCase().includes(query)) ||
      (contact.meetingLocation?.name && contact.meetingLocation.name.toLowerCase().includes(query)) ||
      (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  // Determine if we should show authenticated UI
  const showAuthenticatedUI = user || isAuthenticated;

  if (!showAuthenticatedUI) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Connect & Share <br className="hidden sm:inline" />
          <span className="text-indigo-600">Instantly</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-8">
          Join our growing community of professionals building meaningful connections.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/app/register')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/app/login')}
            className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
          >
            Sign In
          </button>
        </div>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
          alt="Team collaboration"
          className="mt-12 rounded-xl shadow-xl max-w-4xl w-full"
        />
      </div>
    );
  }

  // Group follow-ups by due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const overdueFollowUps = allFollowUps.filter(followUp => 
    !followUp.completed && new Date(followUp.dueDate) < today
  );
  
  const todayFollowUps = allFollowUps.filter(followUp => 
    !followUp.completed && 
    new Date(followUp.dueDate) >= today && 
    new Date(followUp.dueDate) < tomorrow
  );
  
  const tomorrowFollowUps = allFollowUps.filter(followUp => 
    !followUp.completed && 
    new Date(followUp.dueDate) >= tomorrow && 
    new Date(followUp.dueDate) < new Date(tomorrow.getTime() + 86400000)
  );
  
  const upcomingFollowUps = allFollowUps.filter(followUp => 
    !followUp.completed && 
    new Date(followUp.dueDate) >= new Date(tomorrow.getTime() + 86400000) && 
    new Date(followUp.dueDate) < nextWeek
  );
  
  const laterFollowUps = allFollowUps.filter(followUp => 
    !followUp.completed && new Date(followUp.dueDate) >= nextWeek
  );
  
  const completedFollowUps = allFollowUps.filter(followUp => 
    followUp.completed
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Insights Section - Compact and Collapsible */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer bg-white p-3 rounded-xl shadow-sm border border-gray-200"
          onClick={() => setShowInsights(!showInsights)}
        >
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Network Insights</h2>
          </div>
          {showInsights ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <WorldwideStats />
                </div>
                <div className="md:col-span-2">
                  <ConnectionStats
                    totalConnections={totalConnections}
                    pendingRequests={requests.length}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Daily Need Section */}
      <DailyNeedSection />

      {/* Search and Quick Actions */}
      <div className="mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts, companies, or locations..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-300 group-hover:shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 ${
                showFilters || activeFilter
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50 shadow-sm'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              <Filter className="h-5 w-5 mr-1.5" />
              Filters
              {activeFilter && <span className="ml-1 text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full">1</span>}
            </button>
            
            <button
              onClick={() => setShowQRModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <QrCode className="h-5 w-5 mr-1.5" />
              <span className="hidden sm:inline">Show QR</span>
            </button>
          </div>
        </div>
        
        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'recent', label: 'Recent', icon: Clock },
                    { id: 'location', label: 'Location', icon: MapPin },
                    { id: 'company', label: 'Company', icon: Building2 },
                    { id: 'job', label: 'Job Title', icon: Briefcase },
                    { id: 'tags', label: 'Tags', icon: Tag }
                  ].map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.id;
                    
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(isActive ? null : filter.id)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                          isActive
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-1.5" />
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
                
                {/* Active Filter Options */}
                {activeFilter && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {activeFilter === 'recent' && (
                        <>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Today</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">This Week</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">This Month</button>
                        </>
                      )}
                      {activeFilter === 'location' && (
                        <>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">New York</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">San Francisco</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">London</button>
                        </>
                      )}
                      {activeFilter === 'company' && (
                        <>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Google</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Microsoft</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Apple</button>
                        </>
                      )}
                      {activeFilter === 'job' && (
                        <>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Developer</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Designer</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Manager</button>
                        </>
                      )}
                      {activeFilter === 'tags' && (
                        <>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Conference</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Networking</button>
                          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">Client</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connection Requests */}
      {requests.length > 0 && (
        <div id="connection-requests" className="mb-8">
          <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center"
            >
              <div className="p-2 bg-amber-500 rounded-full mr-3 shadow-sm">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  Connection Requests
                  <span className="ml-2 bg-amber-200 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {requests.length}
                  </span>
                </h2>
                <p className="text-xs text-amber-700">People waiting to connect with you</p>
              </div>
            </motion.div>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <ContactCard
                  key={request.id}
                  contact={request}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                  contacts={allContacts}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Connections */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg border border-indigo-200">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center"
          >
            <div className="p-2 bg-indigo-600 rounded-full mr-3 shadow-sm">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Connections</h2>
              <p className="text-xs text-indigo-700">People you've recently connected with</p>
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05, x: 3 }}
            onClick={() => navigate('/app/contacts')}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center bg-white px-3 py-1 rounded-lg shadow-sm"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </motion.button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
            {searchQuery ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-3 bg-amber-50 rounded-full inline-block mb-3">
                  <Search className="h-6 w-6 text-amber-500" />
                </div>
                <p className="text-gray-600 mb-3">No contacts found matching "{searchQuery}"</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery('')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2 bg-white border border-indigo-200 rounded-lg shadow-sm"
                >
                  Clear search
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-3 bg-indigo-50 rounded-full inline-block mb-3">
                  <Users className="h-6 w-6 text-indigo-500" />
                </div>
                <p className="text-gray-600 mb-3">No recent connections</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/app/contacts')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <UserPlus className="h-5 w-5 mr-1.5" />
                  Add Contact
                </motion.button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((connection) => (
              <ContactCard
                key={connection.id}
                contact={connection}
                onEdit={() => {}}
                onDelete={() => {}}
                onUpdateTier={handleUpdateTier}
              />
            ))}
          </div>
        )}
      </div>

      {/* Follow-ups Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mr-3 shadow-sm">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                Follow-up Calendar
                {(overdueFollowUps.length > 0 || todayFollowUps.length > 0) && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {overdueFollowUps.length + todayFollowUps.length}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-600">Keep track of your relationship follow-ups</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, x: 3 }}
            onClick={() => navigate('/app/contacts')}
            className="text-sm text-purple-600 hover:text-purple-800 flex items-center bg-white px-3 py-1 rounded-lg shadow-sm border border-purple-100"
          >
            Manage All
            <ArrowRight className="h-4 w-4 ml-1" />
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : allFollowUps.filter(f => !f.completed).length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending follow-ups</p>
            <p className="text-sm text-gray-400 mt-1">
              Add follow-ups to your contacts to stay in touch
            </p>
          </div>
        ) : (
          <FollowUpCalendar 
            followUps={allFollowUps}
            onToggleFollowUp={handleToggleFollowUp}
            onViewContact={handleViewContact}
          />
        )}
      </div>

      {/* Test Data Section */}
      <div className="mb-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-gray-200 rounded-full mr-3">
            <Zap className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Test Data</h2>
            <p className="text-sm text-gray-600">Try the app with sample connections</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={createTestRequest}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-1.5" />
            Tech Connection
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={createLisbonRequest}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-1.5" />
            Lisbon Connection
          </motion.button>
        </div>
      </div>

      {/* QR Code Modal */}
      {user && (
        <QRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)} 
          user={user}
        />
      )}
    </div>
  );
}