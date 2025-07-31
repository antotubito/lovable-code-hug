export interface ContactFilters {
  search: string;
  tags: string[];
  category?: FilterCategory;
  subCategory?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy: 'name' | 'date' | 'company' | 'meeting_date' | 'location';
  sortOrder: 'asc' | 'desc';
}

export interface FilterCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  subcategories?: {
    id: string;
    label: string;
    items: string[];
  }[];
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

export interface FollowUp {
  id: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  createdAt: Date;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: {
    location?: string;
    from?: string;
    about?: string;
  };
  interests?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    medium?: string;
    dribbble?: string;
    portfolio?: string;
    [key: string]: string | undefined;
  };
  meetingContext?: string;
  meetingDate?: Date;
  meetingLocation?: {
    name: string;
    latitude: number;
    longitude: number;
    venue?: string;
    eventContext?: string;
  };
  requestDate?: Date;
  requestLocation?: {
    name: string;
    latitude: number;
    longitude: number;
    venue?: string;
    eventContext?: string;
  };
  referralId?: string;
  tags: string[];
  notes: Note[];
  followUps: FollowUp[];
  badges?: string[];
  tier?: 1 | 2 | 3; // Added tier property for contact categorization
  createdAt: Date;
  updatedAt: Date;
}

export interface PredictiveSuggestion {
  type: 'company' | 'location' | 'tag' | 'month' | 'year';
  value: string;
  label: string;
  category?: string;
  subCategory?: string;
}