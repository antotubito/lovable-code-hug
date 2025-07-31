import React, { useState, useMemo } from 'react';
import { Search, Tag, Filter, Calendar, MapPin, Briefcase, Users, Heart, Globe, ChevronDown, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ContactFilters, FilterCategory } from '../../types/contact';
import type { Contact } from '../../types/contact';

interface ContactFiltersProps {
  filters: ContactFilters;
  availableTags: string[];
  onFilterChange: (filters: ContactFilters) => void;
  contacts: Contact[]; // Add contacts prop
}

// Base categories structure
const BASE_CATEGORIES = [
  {
    id: 'all',
    label: 'All Contacts',
    icon: Users,
    color: 'text-blue-600',
    description: 'Search across all contact information'
  },
  {
    id: 'location',
    label: 'Where We Met',
    icon: MapPin,
    color: 'text-green-600',
    description: 'Search by meeting locations',
    getSubcategories: (contacts: Contact[] = []) => {
      const venues = new Set<string>();
      const cities = new Set<string>();
      const events = new Set<string>();

      contacts.forEach(contact => {
        if (contact?.meetingLocation) {
          if (contact.meetingLocation.venue) {
            venues.add(contact.meetingLocation.venue);
          }
          cities.add(contact.meetingLocation.name);
        }
        if (contact?.meetingContext?.toLowerCase().includes('conference') || 
            contact?.meetingContext?.toLowerCase().includes('meetup') ||
            contact?.meetingContext?.toLowerCase().includes('event')) {
          events.add(contact.meetingContext);
        }
      });

      return [
        { id: 'venue', label: 'Venue', items: Array.from(venues) },
        { id: 'city', label: 'City', items: Array.from(cities) },
        { id: 'event', label: 'Event', items: Array.from(events) }
      ];
    }
  },
  {
    id: 'date',
    label: 'When We Met',
    icon: Calendar,
    color: 'text-purple-600',
    description: 'Search by meeting dates',
    getSubcategories: (contacts: Contact[] = []) => {
      const months = new Set<string>();
      const years = new Set<string>();

      contacts.forEach(contact => {
        if (contact?.meetingDate) {
          const date = new Date(contact.meetingDate);
          // Use English locale for month names
          months.add(date.toLocaleString('en-US', { month: 'long' }));
          years.add(date.getFullYear().toString());
        }
      });

      return [
        { 
          id: 'recent', 
          label: 'Recent', 
          items: ['Today', 'Yesterday', 'Last Week', 'Last Month'] 
        },
        { 
          id: 'month', 
          label: 'Month', 
          items: Array.from(months) 
        },
        { 
          id: 'year', 
          label: 'Year', 
          items: Array.from(years).sort().reverse() 
        }
      ];
    }
  },
  {
    id: 'profession',
    label: 'Profession',
    icon: Briefcase,
    color: 'text-indigo-600',
    description: 'Search by professional background',
    getSubcategories: (contacts: Contact[] = []) => {
      const jobTitles = new Set<string>();
      const companies = new Set<string>();
      const industries = new Set<string>();

      contacts.forEach(contact => {
        if (contact?.jobTitle) jobTitles.add(contact.jobTitle);
        if (contact?.company) companies.add(contact.company);
        // Extract industry from tags or context
        contact.tags?.forEach(tag => {
          if (['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing'].includes(tag)) {
            industries.add(tag);
          }
        });
      });

      return [
        { id: 'job_title', label: 'Job Title', items: Array.from(jobTitles) },
        { id: 'company', label: 'Company', items: Array.from(companies) },
        { id: 'industry', label: 'Industry', items: Array.from(industries) }
      ];
    }
  },
  {
    id: 'interests',
    label: 'Interests',
    icon: Heart,
    color: 'text-pink-600',
    description: 'Find contacts by shared interests',
    getSubcategories: (contacts: Contact[] = []) => {
      const hobbies = new Set<string>();
      const professional = new Set<string>();
      const causes = new Set<string>();

      contacts.forEach(contact => {
        contact.interests?.forEach(interest => {
          // Categorize interests
          if (['Photography', 'Travel', 'Music', 'Sports', 'Art'].includes(interest)) {
            hobbies.add(interest);
          } else if (['AI', 'Design', 'Marketing', 'Development', 'Business'].includes(interest)) {
            professional.add(interest);
          } else if (['Education', 'Environment', 'Health', 'Social Impact'].includes(interest)) {
            causes.add(interest);
          }
        });
      });

      return [
        { id: 'hobbies', label: 'Hobbies', items: Array.from(hobbies) },
        { id: 'professional', label: 'Professional', items: Array.from(professional) },
        { id: 'causes', label: 'Causes', items: Array.from(causes) }
      ];
    }
  }
];

export function ContactFilters({ filters, availableTags, onFilterChange, contacts = [] }: ContactFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPredictive, setShowPredictive] = useState(true);

  // Generate search categories with dynamic data
  const SEARCH_CATEGORIES = useMemo(() => {
    return BASE_CATEGORIES.map(category => ({
      ...category,
      subcategories: category.getSubcategories ? category.getSubcategories(contacts) : undefined
    }));
  }, [contacts]);

  // Generate predictive suggestions based on contact profiles
  const predictiveSuggestions = useMemo(() => {
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
  }, [contacts]);

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSelectedItem(null);
      onFilterChange({
        ...filters,
        category: undefined,
        subCategory: undefined,
        search: ''
      });
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
      setSelectedItem(null);
      onFilterChange({
        ...filters,
        category: SEARCH_CATEGORIES.find(cat => cat.id === categoryId),
        subCategory: undefined,
        search: ''
      });
    }
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSelectedItem(null);
    onFilterChange({
      ...filters,
      subCategory: subcategoryId,
      search: ''
    });
  };

  const handleItemSelect = (item: string) => {
    setSelectedItem(item);
    setSearchQuery(item);
    onFilterChange({
      ...filters,
      search: item
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({
      ...filters,
      search: value
    });
  };

  const handlePredictiveSelect = (suggestion: any) => {
    // Set the appropriate category and subcategory
    if (suggestion.category) {
      const category = SEARCH_CATEGORIES.find(cat => cat.id === suggestion.category);
      setSelectedCategory(suggestion.category);
      
      if (suggestion.subCategory) {
        setSelectedSubcategory(suggestion.subCategory);
      }
      
      setSelectedItem(suggestion.value);
      setSearchQuery(suggestion.value);
      
      onFilterChange({
        ...filters,
        category,
        subCategory: suggestion.subCategory,
        search: suggestion.value
      });
    } else {
      // Just set the search term
      setSearchQuery(suggestion.value);
      onFilterChange({
        ...filters,
        search: suggestion.value
      });
    }
  };

  const selectedCategoryData = SEARCH_CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Predictive Suggestions */}
      {showPredictive && predictiveSuggestions.length > 0 && !selectedCategory && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Star className="h-4 w-4 mr-1.5 text-amber-500" />
              Suggested Filters
            </h3>
            <button 
              onClick={() => setShowPredictive(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {predictiveSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handlePredictiveSelect(suggestion)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Categories Bar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center overflow-x-auto p-1">
          {SEARCH_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <category.icon className={`h-4 w-4 mr-2 ${
                selectedCategory === category.id ? category.color : 'text-gray-400'
              }`} />
              {category.label}
              {category.subcategories && (
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                  selectedCategory === category.id ? 'rotate-180' : ''
                }`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories and Search */}
      <AnimatePresence>
        {selectedCategory && selectedCategoryData?.subcategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              {/* Subcategories */}
              <div className="flex flex-wrap gap-2">
                {selectedCategoryData.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategorySelect(subcategory.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedSubcategory === subcategory.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {subcategory.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search in ${selectedCategoryData.label.toLowerCase()}`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              {/* Quick Filters */}
              {selectedSubcategory && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {selectedCategoryData.subcategories.find(sub => sub.id === selectedSubcategory)?.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategoryData.subcategories
                      .find(sub => sub.id === selectedSubcategory)
                      ?.items.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleItemSelect(item)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedItem === item
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {(selectedCategory || searchQuery) && (
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">Active filters:</div>
          {selectedCategory && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {selectedCategoryData?.label}
              {selectedSubcategory && (
                <span className="mx-1">
                  →{' '}
                  {selectedCategoryData?.subcategories.find(
                    sub => sub.id === selectedSubcategory
                  )?.label}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setSelectedItem(null);
                  setSearchQuery('');
                  onFilterChange({
                    ...filters,
                    category: undefined,
                    subCategory: undefined,
                    search: ''
                  });
                }}
                className="ml-2 hover:text-indigo-600"
              >
                ×
              </button>
            </div>
          )}
          {searchQuery && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              "{searchQuery}"
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedItem(null);
                  onFilterChange({
                    ...filters,
                    search: ''
                  });
                }}
                className="ml-2 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}