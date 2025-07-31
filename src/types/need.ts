export interface Need {
  id: string;
  userId: string;
  userName?: string;
  userImage?: string;
  category: string;
  categoryLabel: string;
  message: string;
  tags: string[];
  visibility: 'open' | 'private'; // Added visibility field
  expiresAt?: Date; // When the need expires (max 48 hours) 
  duration?: 24 | 48; // Duration in hours (24 or 48)
  isSatisfied?: boolean; // Whether the need has been satisfied
  createdAt: Date;
}

export interface NeedReply {
  id: string;
  needId: string;
  userId: string;
  userName?: string;
  userImage?: string;
  replyToUserId?: string; // ID of the user this reply is directed to
  message: string;
  createdAt: Date;
}