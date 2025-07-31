import { logger } from './logger';
import type { Need, NeedReply } from '../types/need';
import { ANTONIO_TUBITO } from './contacts';
import { formatDistanceToNow } from 'date-fns';

// Mock data for needs
const MOCK_NEEDS: Need[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    category: 'socialize',
    categoryLabel: 'Socialize',
    message: 'Anyone up for coffee this afternoon in downtown?',
    tags: ['coffee', 'chat'],
    visibility: 'open', // Open visibility
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
    isSatisfied: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Michael Chen',
    userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    category: 'events',
    categoryLabel: 'Events',
    message: 'Got an extra ticket for tonight\'s concert at Madison Square Garden!',
    tags: ['concert', 'music'],
    visibility: 'private', // Private visibility
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // Expires in 48 hours
    isSatisfied: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Emma Rodriguez',
    userImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    category: 'learning',
    categoryLabel: 'Learning',
    message: 'Starting a Spanish study group - beginners welcome! Meeting this weekend.',
    tags: ['language', 'study'],
    visibility: 'open', // Open visibility
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
    isSatisfied: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  },
  {
    id: '4',
    userId: 'user-4',
    userName: 'David Kim',
    userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    category: 'active',
    categoryLabel: 'Active',
    message: 'Looking for a tennis partner for Sunday morning at Central Park courts.',
    tags: ['sports', 'tennis'],
    visibility: 'private', // Private visibility
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // Expires in 48 hours
    isSatisfied: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
  },
  {
    id: '5',
    userId: ANTONIO_TUBITO.id,
    userName: ANTONIO_TUBITO.name,
    userImage: ANTONIO_TUBITO.profileImage,
    category: 'food',
    categoryLabel: 'Food',
    message: 'Trying that new Italian restaurant downtown tonight. Anyone want to join?',
    tags: ['dining', 'italian'],
    visibility: 'open', // Open visibility
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires in 24 hours
    isSatisfied: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1) // 1 hour ago
  }
];

// Mock data for replies
const MOCK_REPLIES: Record<string, NeedReply[]> = {
  '1': [
    {
      id: 'reply-1-1',
      needId: '1',
      userId: 'user-2',
      userName: 'Michael Chen',
      userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      message: 'I\'m free after 3pm. Which coffee shop were you thinking?',
      createdAt: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
    },
    {
      id: 'reply-1-2',
      needId: '1',
      userId: 'user-3',
      userName: 'Emma Rodriguez',
      userImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      message: 'I\'d love to join! I know a great place on Main Street.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
    }
  ],
  '2': [
    {
      id: 'reply-2-1',
      needId: '2',
      userId: 'user-4',
      userName: 'David Kim',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      message: 'Who\'s playing? I might be interested!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    }
  ],
  '5': [
    {
      id: 'reply-5-1',
      needId: '5',
      userId: 'user-1',
      userName: 'Sarah Johnson',
      userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      message: 'I\'ve been wanting to try that place! What time are you going?',
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    }
  ]
};

/**
 * List all needs
 */
export async function listNeeds(): Promise<Need[]> {
  try {
    // In a real implementation, this would fetch needs from the database
    // Filter out expired and satisfied needs
    const now = new Date();
    return MOCK_NEEDS.filter(need => {
      // Keep needs that are not satisfied and not expired
      return !need.isSatisfied && (!need.expiresAt || new Date(need.expiresAt) > now);
    });
  } catch (error) {
    logger.error('Error listing needs:', error);
    return [];
  }
}

/**
 * Create a new need
 */
export async function createNeed(needData: Omit<Need, 'id' | 'userId' | 'createdAt'>): Promise<Need> {
  try {
    // In a real implementation, this would create a need in the database
    
    // Set default expiration if not provided (24 hours)
    if (!needData.expiresAt) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      needData.expiresAt = expiresAt;
    }
    
    // Set default isSatisfied if not provided
    if (needData.isSatisfied === undefined) {
      needData.isSatisfied = false;
    }
    
    // For now, create a mock need
    const newNeed: Need = {
      id: `need-${Date.now()}`,
      userId: ANTONIO_TUBITO.id,
      userName: ANTONIO_TUBITO.name,
      userImage: ANTONIO_TUBITO.profileImage,
      ...needData,
      createdAt: new Date()
    };

    // Add to mock data
    MOCK_NEEDS.unshift(newNeed);

    return newNeed;
  } catch (error) {
    logger.error('Error creating need:', error);
    throw error;
  }
}

/**
 * Get a need by ID
 */
export async function getNeed(id: string): Promise<Need | null> {
  try {
    // In a real implementation, this would fetch a need from the database
    // For now, find in mock data
    const need = MOCK_NEEDS.find(n => n.id === id);
    return need || null;
  } catch (error) {
    logger.error('Error getting need:', error);
    return null;
  }
}

/**
 * Delete a need
 */
export async function deleteNeed(id: string): Promise<boolean> {
  try {
    // In a real implementation, this would delete a need from the database
    // For now, remove from mock data
    const index = MOCK_NEEDS.findIndex(n => n.id === id);
    if (index !== -1) {
      MOCK_NEEDS.splice(index, 1);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting need:', error);
    return false;
  }
}

/**
 * Get replies for a need
 * If currentUserId is provided, filter replies based on visibility and user
 */
export async function getNeedReplies(needId: string, currentUserId?: string): Promise<NeedReply[]> {
  try {
    // In a real implementation, this would fetch replies from the database
    // For now, return mock data
    const allReplies = MOCK_REPLIES[needId] || [];
    const need = MOCK_NEEDS.find(n => n.id === needId);
    
    if (!need) return [];
    
    // If currentUserId is provided, filter replies based on visibility
    if (currentUserId) {
      // If current user created the need, they can see all replies
      if (need.userId === currentUserId) {
        return allReplies;
      }
      
      // For open needs, everyone can see all replies
      if (need.visibility === 'open') {
        return allReplies;
      }
      
      // For private needs, users can only see their own replies and responses to those replies
      return allReplies.filter(reply => 
        reply.userId === currentUserId || // User's own replies
        reply.replyToUserId === currentUserId // Replies to the user
      );
    }
    
    return allReplies;
  } catch (error) {
    logger.error('Error getting need replies:', error);
    return [];
  }
}

/**
 * Send a reply to a need
 */
export async function sendNeedReply(replyData: Omit<NeedReply, 'id' | 'userId' | 'createdAt'>): Promise<NeedReply> {
  try {
    // In a real implementation, this would create a reply in the database
    // Get the need to check visibility
    const need = MOCK_NEEDS.find(n => n.id === replyData.needId);
    
    const newReply: NeedReply = {
      id: `reply-${replyData.needId}-${Date.now()}`,
      userId: ANTONIO_TUBITO.id,
      ...replyData,
      // For private needs, set replyToUserId to the need creator's ID
      // For public needs, only set if explicitly provided
      replyToUserId: need?.visibility === 'private' ? need.userId : replyData.replyToUserId,
      createdAt: new Date()
    };

    // Add to mock data
    if (!MOCK_REPLIES[replyData.needId]) {
      MOCK_REPLIES[replyData.needId] = [];
    }
    MOCK_REPLIES[replyData.needId].push(newReply);

    return newReply;
  } catch (error) {
    logger.error('Error sending need reply:', error);
    throw error;
  }
}

/**
 * Delete a reply
 */
export async function deleteNeedReply(needId: string, replyId: string): Promise<boolean> {
  try {
    // In a real implementation, this would delete a reply from the database
    // For now, remove from mock data
    if (!MOCK_REPLIES[needId]) return false;
    
    const index = MOCK_REPLIES[needId].findIndex(r => r.id === replyId);
    if (index !== -1) {
      MOCK_REPLIES[needId].splice(index, 1);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting need reply:', error);
    return false;
  }
}

/**
 * Mark a need as satisfied
 */
export async function markNeedAsSatisfied(id: string): Promise<boolean> {
  try {
    // Find the need in the mock data
    const index = MOCK_NEEDS.findIndex(n => n.id === id);
    if (index !== -1) {
      // Mark as satisfied
      MOCK_NEEDS[index].isSatisfied = true;
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error marking need as satisfied:', error);
    return false;
  }
}

/**
 * Get archived needs (satisfied or expired)
 */
export async function getArchivedNeeds(): Promise<Need[]> {
  try {
    // Get current date for comparison
    const now = new Date();
    
    // Return needs that are either satisfied or expired
    return MOCK_NEEDS.filter(need => {
      return need.isSatisfied || (need.expiresAt && new Date(need.expiresAt) <= now);
    });
  } catch (error) {
    logger.error('Error getting archived needs:', error);
    return [];
  }
}