import { supabase } from './supabase';
import type { User } from '../types/user';
import type { Contact, Note, FollowUp } from '../types/contact';
import { logger } from './logger';

// Test data for development
const TEST_CONTACTS: Contact[] = [
  {
    id: '1',
    userId: 'test-user-id',
    name: 'William James Sidis',
    email: 'william.sidis@example.com',
    phone: '+1 (555) 987-6543',
    jobTitle: 'Mathematician & Polymath',
    company: 'Harvard University',
    profileImage: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverImage: 'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?auto=format&fit=crop&w=1920&q=80',
    bio: {
      location: 'Cambridge, Massachusetts',
      from: 'New York City',
      about: `Child prodigy and the most intelligent person ever measured. Mastered multiple languages by age 6, became the youngest person to enroll at Harvard at age 11.`
    },
    interests: [
      'Mathematics',
      'Physics',
      'Linguistics',
      'Philosophy',
      'Cosmology'
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/williamsidis',
      github: 'https://github.com/williamsidis',
      medium: '@williamsidis'
    },
    meetingDate: new Date('2024-01-14'),
    meetingLocation: {
      name: 'Harvard University',
      latitude: 42.3744,
      longitude: -71.1169,
      venue: 'Mathematics Department',
      eventContext: 'Mathematics Symposium'
    },
    meetingContext: 'Connected during a mathematics symposium where William presented his revolutionary theories.',
    tags: ['Genius', 'Polymath', 'Researcher'],
    tier: 1,
    notes: [
      {
        id: 'note-1-1',
        content: 'Discussed his theories on dark matter and the expansion of the universe. He has some fascinating insights that challenge conventional thinking.',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 'note-1-2',
        content: "William mentioned he's working on a new paper about quantum gravity. Asked if I'd be interested in reviewing it before submission.",
        createdAt: new Date('2024-02-01')
      }
    ],
    followUps: [
      {
        id: 'followup-1-1',
        description: 'Review William\'s quantum gravity paper',
        dueDate: new Date('2024-03-15'),
        completed: false,
        createdAt: new Date('2024-02-01')
      },
      {
        id: 'followup-1-2',
        description: 'Introduce William to Dr. Feynman at Caltech',
        dueDate: new Date('2024-04-01'),
        completed: false,
        createdAt: new Date('2024-02-10')
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    userId: 'test-user-id',
    name: 'Star Dislink',
    email: 'star@dislink.com',
    jobTitle: 'Community Lead',
    company: 'Dislink',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80',
    bio: {
      location: 'Lisbon, Portugal',
      from: 'Porto, Portugal',
      about: 'Passionate about building meaningful connections and fostering vibrant communities. Leading Dislink\'s community initiatives and ensuring every member feels welcomed and supported.'
    },
    interests: [
      'Community Building',
      'User Experience',
      'Digital Connections',
      'Event Planning',
      'Technology'
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/stardislink',
      twitter: '@stardislink'
    },
    meetingDate: new Date('2024-01-15'),
    meetingLocation: {
      name: 'Community Meetup',
      latitude: 38.7223,
      longitude: -9.1393,
      venue: 'Dislink Community Hub',
      eventContext: 'Monthly Community Gathering'
    },
    meetingContext: 'Met during the monthly Dislink community gathering where Star shared insights about building meaningful professional relationships.',
    tags: ['Community', 'Leadership', 'Innovator'],
    tier: 1,
    notes: [
      {
        id: 'note-2-1',
        content: 'Star offered to help me connect with other professionals in the tech industry. Very generous with her network!',
        createdAt: new Date('2024-01-16')
      }
    ],
    followUps: [
      {
        id: 'followup-2-1',
        description: 'Attend next Dislink community event',
        dueDate: new Date(new Date().getTime() + 86400000), // Tomorrow
        completed: false,
        createdAt: new Date('2024-01-20')
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    userId: 'test-user-id',
    name: 'Alex Johnson',
    email: 'alex.johnson@techcorp.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Senior Developer',
    company: 'TechCorp',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: {
      location: 'San Francisco, CA',
      from: 'Chicago, IL',
      about: 'Full-stack developer with a passion for creating elegant solutions to complex problems.'
    },
    interests: [
      'JavaScript',
      'React',
      'Node.js',
      'Hiking',
      'Photography'
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/alexjohnson',
      github: 'https://github.com/alexjohnson',
      twitter: '@alexjdev'
    },
    meetingDate: new Date('2025-01-10'),
    meetingLocation: {
      name: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      venue: 'TechConf 2025',
      eventContext: 'React Workshop'
    },
    meetingContext: 'Met at TechConf 2025 during the React workshop. Alex gave an impressive presentation on performance optimization.',
    tags: ['Developer', 'React', 'Technology'],
    tier: 2,
    notes: [
      {
        id: 'note-3-1',
        content: 'Alex mentioned working on an open-source project for state management. Follow up to learn more.',
        createdAt: new Date('2025-01-11')
      }
    ],
    followUps: [
      {
        id: 'followup-3-1',
        description: 'Share article on React performance',
        dueDate: new Date(new Date().getTime() - 86400000), // Yesterday (overdue)
        completed: false,
        createdAt: new Date('2025-01-11')
      },
      {
        id: 'followup-3-2',
        description: 'Discuss potential collaboration on open-source project',
        dueDate: new Date(new Date().getTime() + 3 * 86400000), // 3 days from now
        completed: false,
        createdAt: new Date('2025-01-15')
      }
    ],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-11')
  },
  {
    id: '4',
    userId: 'test-user-id',
    name: 'Maria Rodriguez',
    email: 'maria@designstudio.co',
    phone: '+1 (555) 987-6543',
    jobTitle: 'UX Designer',
    company: 'Design Studio',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: {
      location: 'New York, NY',
      from: 'Barcelona, Spain',
      about: 'Award-winning designer focused on creating intuitive and beautiful user experiences.'
    },
    interests: [
      'UX Design',
      'Typography',
      'Art',
      'Travel',
      'Cooking'
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/mariarodriguez',
      dribbble: 'https://dribbble.com/mariarodriguez',
      portfolio: 'https://mariarodriguez.design'
    },
    meetingDate: new Date('2025-02-15'),
    meetingLocation: {
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      venue: 'Design Week NYC',
      eventContext: 'Accessibility Workshop'
    },
    meetingContext: 'Connected at Design Week NYC. Maria gave an insightful talk on designing for accessibility.',
    tags: ['Designer', 'UX', 'Creative'],
    tier: 3,
    notes: [
      {
        id: 'note-4-1',
        content: 'Maria is looking for collaboration opportunities on healthcare UX projects.',
        createdAt: new Date('2025-02-16')
      }
    ],
    followUps: [
      {
        id: 'followup-4-1',
        description: 'Send Maria portfolio of healthcare projects',
        dueDate: new Date(new Date().getTime() + 10 * 86400000), // 10 days from now
        completed: false,
        createdAt: new Date('2025-02-16')
      },
      {
        id: 'followup-4-2',
        description: 'Introduce Maria to healthcare clients',
        dueDate: new Date(new Date().getTime() + 14 * 86400000), // 14 days from now
        completed: false,
        createdAt: new Date('2025-02-18')
      },
      {
        id: 'followup-4-3',
        description: 'Follow up on Design Week connections',
        dueDate: new Date(new Date().getTime() - 5 * 86400000), // 5 days ago (completed)
        completed: true,
        createdAt: new Date('2025-02-17')
      }
    ],
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-02-16')
  }
];

// Test data for connection requests
const TEST_REQUESTS: Contact[] = [];

// Test user profile for Sir Dislink
const ANTONIO_TUBITO: User = {
  id: 'antonio-tubito',
  email: 'antonio@tubito.com',
  firstName: 'Antonio',
  lastName: 'Tubito',
  name: 'Antonio Tubito',
  jobTitle: 'Founder',
  company: 'Dislink',
  industry: 'technology',
  profileImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=80',
  bio: {
    location: 'Lisbon, Portugal',
    from: 'Milan, Italy',
    about: 'Passionate entrepreneur dedicated to revolutionizing how professionals build and maintain meaningful connections. Founded Dislink to solve the problem of forgotten relationships and missed opportunities. Based in Lisbon, originally from Milan.'
  },
  interests: [
    'Networking',
    'Relationship Building',
    'Technology',
    'Entrepreneurship',
    'Product Design',
    'AI',
    'Travel'
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/antoniotubito',
    twitter: '@antoniotubito',
    github: 'https://github.com/antoniotubito',
    medium: '@antoniotubito',
    portfolio: 'https://dislink.com'
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  twoFactorEnabled: false,
  publicProfile: {
    enabled: true,
    defaultSharedLinks: {
      linkedin: true,
      twitter: true,
      github: true,
      portfolio: true
    },
    allowedFields: {
      email: false,
      phone: false,
      company: true,
      jobTitle: true,
      bio: true,
      interests: true,
      location: true
    }
  }
};

export async function listContacts(): Promise<Contact[]> {
  try {
    // For development, return test data
    return TEST_CONTACTS;
  } catch (error) {
    logger.error('Error listing contacts:', error);
    throw error;
  }
}

export async function listRecentContacts(limit: number = 3): Promise<Contact[]> {
  try {
    // Return the most recent contacts based on meetingDate
    return TEST_CONTACTS
      .filter(contact => contact.meetingDate)
      .sort((a, b) => {
        const dateA = new Date(a.meetingDate!).getTime();
        const dateB = new Date(b.meetingDate!).getTime();
        return dateB - dateA; // Sort in descending order (newest first)
      })
      .slice(0, limit);
  } catch (error) {
    logger.error('Error listing recent contacts:', error);
    throw error;
  }
}

export async function listConnectionRequests(): Promise<Contact[]> {
  try {
    // For development, return test data
    return TEST_REQUESTS;
  } catch (error) {
    logger.error('Error listing connection requests:', error);
    throw error;
  }
}

export async function getContact(id: string): Promise<Contact> {
  try {
    // First check in contacts
    const contact = TEST_CONTACTS.find(c => c.id === id);
    if (contact) return contact;

    // Then check in requests
    const request = TEST_REQUESTS.find(r => r.id === id);
    if (!request) throw new Error('Contact not found');

    return request;
  } catch (error) {
    logger.error('Error getting contact:', error);
    throw error;
  }
}

export async function createContact(contactData: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'notes' | 'followUps'>): Promise<Contact> {
  try {
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      userId: 'test-user-id',
      notes: [],
      followUps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...contactData
    };

    TEST_CONTACTS.unshift(newContact);
    return newContact;
  } catch (error) {
    logger.error('Error creating contact:', error);
    throw error;
  }
}

export async function updateContactTier(contactId: string, tier: 1 | 2 | 3): Promise<Contact> {
  try {
    const contact = TEST_CONTACTS.find(c => c.id === contactId);
    if (!contact) throw new Error('Contact not found');

    contact.tier = tier;
    contact.updatedAt = new Date();

    return contact;
  } catch (error) {
    logger.error('Error updating contact tier:', error);
    throw error;
  }
}

export async function updateContactSharing(contactId: string, sharedLinks: Record<string, boolean>): Promise<Contact> {
  try {
    const contact = TEST_CONTACTS.find(c => c.id === contactId);
    if (!contact) throw new Error('Contact not found');

    // Get the current user's social links
    // In a real implementation, this would come from the current user's profile
    const userSocialLinks = ANTONIO_TUBITO.socialLinks || {};

    // Create a new socialLinks object with only the links that should be shared
    const newSocialLinks: Record<string, string> = {};
    
    // For each platform that should be shared, copy the link from the user's profile
    Object.entries(sharedLinks).forEach(([platform, isShared]) => {
      if (isShared && userSocialLinks[platform]) {
        newSocialLinks[platform] = userSocialLinks[platform] as string;
      }
    });

    // Update the contact's socialLinks
    contact.socialLinks = newSocialLinks;
    contact.updatedAt = new Date();

    logger.info('Updated contact sharing settings', { 
      contactId, 
      sharedLinksCount: Object.keys(newSocialLinks).length 
    });

    return contact;
  } catch (error) {
    logger.error('Error updating contact sharing settings:', error);
    throw error;
  }
}

export async function addNote(contactId: string, content: string): Promise<Note> {
  try {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      content,
      createdAt: new Date(),
    };

    const contact = TEST_CONTACTS.find(c => c.id === contactId);
    if (!contact) throw new Error('Contact not found');

    contact.notes.unshift(newNote);
    contact.updatedAt = new Date();

    return newNote;
  } catch (error) {
    logger.error('Error adding note:', error);
    throw error;
  }
}

export async function deleteNote(contactId: string, noteId: string): Promise<void> {
  try {
    const contact = TEST_CONTACTS.find(c => c.id === contactId);
    if (!contact) throw new Error('Contact not found');

    const noteIndex = contact.notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) throw new Error('Note not found');

    contact.notes.splice(noteIndex, 1);
    contact.updatedAt = new Date();
  } catch (error) {
    logger.error('Error deleting note:', error);
    throw error;
  }
}

export async function addFollowUp(contactId: string, data: { dueDate: Date; description: string }): Promise<FollowUp> {
  try {
    const newFollowUp: FollowUp = {
      id: `followup-${Date.now()}`,
      description: data.description,
      dueDate: data.dueDate,
      completed: false,
      createdAt: new Date(),
    };

    const contact = TEST_CONTACTS.find(c => c.id === contactId);
    if (!contact) throw new Error('Contact not found');

    contact.followUps.push(newFollowUp);
    contact.updatedAt = new Date();

    return newFollowUp;
  } catch (error) {
    logger.error('Error adding follow-up:', error);
    throw error;
  }
}

export async function toggleFollowUp(contactId: string, followUpId: string, completed: boolean): Promise<void> {
  try {
    const contact = TEST_CONTACTS.find(c => c.id === contactId);
    if (!contact) throw new Error('Contact not found');

    const followUp = contact.followUps.find(f => f.id === followUpId);
    if (!followUp) throw new Error('Follow-up not found');

    followUp.completed = completed;
    contact.updatedAt = new Date();
  } catch (error) {
    logger.error('Error toggling follow-up:', error);
    throw error;
  }
}

export async function approveConnectionRequest(
  requestId: string, 
  location: { name: string; latitude: number; longitude: number; venue?: string; eventContext?: string }, 
  tags: string[],
  sharedLinks: Record<string, boolean>,
  mutualConnections: string[],
  note?: string,
  badges?: string[]
): Promise<Contact> {
  try {
    logger.info('Approving connection request', { 
      requestId, 
      location, 
      tags, 
      sharedLinksCount: Object.keys(sharedLinks).length,
      mutualConnectionsCount: mutualConnections.length,
      hasNote: !!note,
      hasBadges: !!badges
    });
    
    // Find the request
    const requestIndex = TEST_REQUESTS.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      logger.error('Request not found', { requestId });
      throw new Error('Request not found');
    }
    
    const request = TEST_REQUESTS[requestIndex];

    // Create new contact from request with connection timestamp
    const newContact: Contact = {
      ...request,
      id: `contact-${Date.now()}`,
      meetingDate: new Date(), // Set meeting date to now
      meetingLocation: location,
      tags,
      tier: 3, // Default to outer circle for new connections
      socialLinks: Object.entries(sharedLinks)
        .filter(([_, isShared]) => isShared)
        .reduce((acc, [key]) => ({
          ...acc,
          [key]: request.socialLinks?.[key as keyof typeof request.socialLinks]
        }), {}),
      notes: note ? [{ id: `note-${Date.now()}`, content: note, createdAt: new Date() }] : [],
      followUps: [],
      badges,
      updatedAt: new Date()
    };

    // Remove request properties
    delete (newContact as any).requestDate;
    delete (newContact as any).requestLocation;

    // Add to beginning of contacts array to show as most recent
    TEST_CONTACTS.unshift(newContact);
    
    // Remove from requests
    TEST_REQUESTS.splice(requestIndex, 1);
    
    logger.info('Connection request approved successfully', { 
      newContactId: newContact.id,
      requestId
    });

    return newContact;
  } catch (error) {
    logger.error('Error approving connection request:', error);
    throw error;
  }
}

export async function declineConnectionRequest(requestId: string): Promise<void> {
  try {
    logger.info('Declining connection request', { requestId });
    
    const index = TEST_REQUESTS.findIndex(r => r.id === requestId);
    if (index === -1) {
      logger.error('Request not found', { requestId });
      throw new Error('Request not found');
    }

    TEST_REQUESTS.splice(index, 1);
    
    logger.info('Connection request declined successfully', { requestId });
  } catch (error) {
    logger.error('Error declining connection request:', error);
    throw error;
  }
}

export async function validateQRCode(data: string): Promise<User | null> {
  try {
    // Parse the QR code data
    const qrData = JSON.parse(data);

    // Validate required fields (using shortened keys)
    if (!qrData.i || !qrData.n) {
      console.error('Invalid QR code data: missing required fields');
      return null;
    }

    // For testing, return Dislink Team profile when scanning test QR code
    if (qrData.i === 'test-qr-code') {
      return DISLINK_TEAM;
    }

    // In a real implementation, this would validate the QR code format
    // and fetch the user profile from the backend
    return {
      id: qrData.i, // id
      name: qrData.n, // name
      jobTitle: qrData.j, // job title
      company: qrData.o, // company
      profileImage: qrData.p, // profile image
      coverImage: qrData.c, // cover image
      bio: qrData.b, // bio
      interests: qrData.in, // interests
      socialLinks: qrData.s, // social links
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      publicProfile: {
        enabled: true,
        defaultSharedLinks: {},
        allowedFields: {
          email: false,
          phone: false,
          company: true,
          jobTitle: true,
          bio: true,
          interests: true,
          location: true
        }
      }
    };
  } catch (error) {
    console.error('Error validating QR code:', error);
    return null;
  }
}

export async function createConnectionRequest(user: User | any): Promise<void> {
  try {
    // Generate a unique request ID using timestamp
    const timestamp = Date.now();
    const requestId = `request-${timestamp}`;
    
    const now = new Date();
    
    // Get location data if provided
    const requestLocation = user.location ? {
      name: user.location.name || 'Unknown Location',
      latitude: user.location.latitude,
      longitude: user.location.longitude,
      venue: user.location.venue,
      eventContext: user.location.eventContext
    } : {
      name: 'Tech Conference 2024',
      latitude: 37.7749,
      longitude: -122.4194,
      venue: 'Innovation Center',
      eventContext: 'Tech Conference'
    };
    
    const newRequest = {
      id: requestId,
      userId: 'test-user-id',
      name: user.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: user.jobTitle,
      company: user.company,
      industry: user.industry,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
      bio: user.bio,
      interests: user.interests,
      socialLinks: user.socialLinks,
      requestDate: now,
      requestLocation,
      tags: [],
      notes: [],
      followUps: [],
      createdAt: now,
      updatedAt: now
    };

    // Add to the beginning of requests array (newest first)
    TEST_REQUESTS.unshift(newRequest);
    
    logger.info('Connection request created', { requestId });
  } catch (error) {
    logger.error('Error creating connection request:', error);
    throw error;
  }
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  try {
    const index = TEST_CONTACTS.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');

    const updatedContact = {
      ...TEST_CONTACTS[index],
      ...updates,
      updatedAt: new Date()
    };

    TEST_CONTACTS[index] = updatedContact;
    return updatedContact;
  } catch (error) {
    logger.error('Error updating contact:', error);
    throw error;
  }
}

export async function deleteContact(id: string): Promise<void> {
  try {
    const index = TEST_CONTACTS.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');

    TEST_CONTACTS.splice(index, 1);
  } catch (error) {
    logger.error('Error deleting contact:', error);
    throw error;
  }
}

export function getTestUsers() {
  return [
    { email: "john@techinnovations.dev", name: "John Developer" },
    { email: "user1@example.com", name: "User One" },
    { email: "user2@example.com", name: "User Two" }
  ];
}

export function getPredictiveFilters(contacts: Contact[]) {
  if (!contacts.length) return [];
  
  // Count occurrences of various attributes
  const companyCounts = new Map<string, number>();
  const locationCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  const monthCounts = new Map<string, number>();
  
  contacts.forEach(contact => {
    // Count companies
    if (contact.company) {
      companyCounts.set(
        contact.company, 
        (companyCounts.get(contact.company) || 0) + 1
      );
    }
    
    // Count locations
    if (contact.meetingLocation?.name) {
      locationCounts.set(
        contact.meetingLocation.name,
        (locationCounts.get(contact.meetingLocation.name) || 0) + 1
      );
    }
    
    // Count tags
    contact.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
    
    // Count months
    if (contact.meetingDate) {
      const month = new Date(contact.meetingDate).toLocaleString('en-US', { month: 'long' });
      monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    }
  });
  
  // Sort by frequency and get top items
  const topCompanies = Array.from(companyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([company]) => company);
    
  const topLocations = Array.from(locationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([location]) => location);
    
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
    
  const topMonths = Array.from(monthCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([month]) => month);
  
  // Build suggestions
  const suggestions = [
    ...topCompanies.map(company => ({
      type: 'company',
      value: company,
      label: `${company} (Company)`,
      category: 'profession',
      subCategory: 'company'
    })),
    ...topLocations.map(location => ({
      type: 'location',
      value: location,
      label: `${location} (Location)`,
      category: 'location',
      subCategory: 'city'
    })),
    ...topTags.map(tag => ({
      type: 'tag',
      value: tag,
      label: `${tag} (Tag)`,
      category: 'all'
    })),
    ...topMonths.map(month => ({
      type: 'month',
      value: month,
      label: `${month} (Month)`,
      category: 'date',
      subCategory: 'month'
    }))
  ];
  
  return suggestions;
}

// Create a new test profile for connection request testing
const EMILY_TECH: User = {
  id: 'emily-tech',
  email: 'emily@techventures.co',
  firstName: 'Emily',
  lastName: 'Tech',
  name: 'Emily Tech',
  jobTitle: 'Product Manager',
  company: 'Tech Ventures',
  industry: 'technology',
  profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=80',
  bio: {
    location: 'Boston, MA',
    from: 'Denver, CO',
    about: 'Product leader with a passion for creating innovative solutions that solve real user problems. Experienced in leading cross-functional teams and bringing products from concept to market.'
  },
  interests: [
    'Product Management',
    'User Research',
    'Agile Methodologies',
    'Tech Innovation',
    'Startup Ecosystem',
    'Hiking',
    'Travel Photography'
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/emilytech',
    twitter: '@emilytech',
    github: 'https://github.com/emilytech',
    medium: '@emilytech',
    portfolio: 'https://emilytech.co'
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  twoFactorEnabled: false,
  publicProfile: {
    enabled: true,
    defaultSharedLinks: {
      linkedin: true,
      twitter: true,
      portfolio: true
    },
    allowedFields: {
      email: false,
      phone: false,
      company: true,
      jobTitle: true,
      bio: true,
      interests: true,
      location: true
    }
  }
};

// Function to create a connection request from Emily Tech
export function createEmilyTechRequest() {
  const now = new Date();
  const requestId = `request-emily-${Date.now()}`;
  
  const newRequest = {
    id: requestId,
    userId: 'test-user-id',
    name: EMILY_TECH.name,
    email: EMILY_TECH.email,
    firstName: EMILY_TECH.firstName,
    lastName: EMILY_TECH.lastName,
    jobTitle: EMILY_TECH.jobTitle,
    company: EMILY_TECH.company,
    industry: EMILY_TECH.industry,
    profileImage: EMILY_TECH.profileImage,
    coverImage: EMILY_TECH.coverImage,
    bio: EMILY_TECH.bio,
    interests: EMILY_TECH.interests,
    socialLinks: EMILY_TECH.socialLinks,
    requestDate: now,
    requestLocation: {
      name: 'Product Management Summit',
      latitude: 42.3601,
      longitude: -71.0589,
      venue: 'Boston Convention Center',
      eventContext: 'Product Innovation Panel'
    },
    tags: [],
    notes: [],
    followUps: [],
    createdAt: now,
    updatedAt: now
  };

  // Add to the beginning of requests array (newest first)
  TEST_REQUESTS.unshift(newRequest);
  
  logger.info('Emily Tech connection request created', { requestId });
  return requestId;
}

// Create a Lisbon connection request
export function createLisbonConnectionRequest() {
  const now = new Date();
  const requestId = `request-lisbon-${Date.now()}`;
  
  // Create a fictional person from Lisbon
  const LISBON_CONTACT: User = {
    id: 'joao-lisbon',
    email: 'joao.silva@lisbon.pt',
    firstName: 'João',
    lastName: 'Silva',
    name: 'João Silva',
    jobTitle: 'Tech Entrepreneur',
    company: 'Lisbon Startups',
    industry: 'technology',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverImage: 'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?auto=format&fit=crop&w=1920&q=80',
    bio: {
      location: 'Lisbon, Portugal',
      from: 'Porto, Portugal',
      about: 'Passionate tech entrepreneur building innovative solutions in the heart of Lisbon. Focused on sustainable technology and community building.'
    },
    interests: [
      'Startups',
      'Sustainable Tech',
      'Community Building',
      'Portuguese Cuisine',
      'Surfing',
      'Urban Photography',
      'Fado Music'
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/joaosilva',
      twitter: '@joaosilvalx',
      github: 'https://github.com/joaosilva',
      portfolio: 'https://joaosilva.dev'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    twoFactorEnabled: false,
    publicProfile: {
      enabled: true,
      defaultSharedLinks: {
        linkedin: true,
        twitter: true,
        portfolio: true
      },
      allowedFields: {
        email: false,
        phone: false,
        company: true,
        jobTitle: true,
        bio: true,
        interests: true,
        location: true
      }
    }
  };
  
  const newRequest = {
    id: requestId,
    userId: 'test-user-id',
    name: LISBON_CONTACT.name,
    email: LISBON_CONTACT.email,
    firstName: LISBON_CONTACT.firstName,
    lastName: LISBON_CONTACT.lastName,
    jobTitle: LISBON_CONTACT.jobTitle,
    company: LISBON_CONTACT.company,
    industry: LISBON_CONTACT.industry,
    profileImage: LISBON_CONTACT.profileImage,
    coverImage: LISBON_CONTACT.coverImage,
    bio: LISBON_CONTACT.bio,
    interests: LISBON_CONTACT.interests,
    socialLinks: LISBON_CONTACT.socialLinks,
    requestDate: now,
    requestLocation: {
      name: 'Praça das Flores',
      latitude: 38.7156,
      longitude: -9.1470,
      venue: 'Café Jardim das Flores',
      eventContext: 'Lisbon Tech Meetup'
    },
    tags: [],
    notes: [],
    followUps: [],
    createdAt: now,
    updatedAt: now
  };

  // Add to the beginning of requests array (newest first)
  TEST_REQUESTS.unshift(newRequest);
  
  logger.info('Lisbon connection request created', { requestId });
  return requestId;
}

export { ANTONIO_TUBITO, EMILY_TECH };