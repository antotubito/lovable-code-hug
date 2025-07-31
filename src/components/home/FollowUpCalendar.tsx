import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FollowUp {
  id: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  contactName: string;
  contactId: string;
  createdAt: Date;
}

interface FollowUpCalendarProps {
  followUps: FollowUp[];
  onToggleFollowUp: (contactId: string, followUpId: string, completed: boolean) => Promise<void>;
  onViewContact: (contactId: string) => void;
}

export function FollowUpCalendar({ followUps, onToggleFollowUp, onViewContact }: FollowUpCalendarProps) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedFollowUp, setExpandedFollowUp] = useState<string | null>(null);
  
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get number of days in the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Create array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Create array of blank days to fill in the beginning of the month
  const blankDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  
  // Get today's date
  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };
  
  // Check if a day has follow-ups
  const getFollowUpsForDay = (day: number) => {
    return followUps.filter(followUp => {
      const followUpDate = new Date(followUp.dueDate);
      return (
        followUpDate.getDate() === day &&
        followUpDate.getMonth() === currentMonth &&
        followUpDate.getFullYear() === currentYear
      );
    });
  };
  
  // Check if a day has overdue follow-ups
  const hasOverdueFollowUps = (day: number) => {
    const dayFollowUps = getFollowUpsForDay(day);
    return dayFollowUps.some(followUp => {
      const followUpDate = new Date(followUp.dueDate);
      return !followUp.completed && followUpDate < today;
    });
  };
  
  // Check if a day has follow-ups due today
  const hasTodayFollowUps = (day: number) => {
    if (!isToday(day)) return false;
    
    const dayFollowUps = getFollowUpsForDay(day);
    return dayFollowUps.some(followUp => !followUp.completed);
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get selected day's follow-ups
  const selectedDayFollowUps = selectedDate
    ? getFollowUpsForDay(selectedDate.getDate())
    : [];
  
  // Format relative date
  const formatRelativeDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const followUpDate = new Date(date);
    followUpDate.setHours(0, 0, 0, 0);
    
    const diffTime = followUpDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 0) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
            Follow-up Calendar
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </button>
            <span className="text-sm font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day names */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
          
          {/* Blank days */}
          {blankDays.map((_, index) => (
            <div key={`blank-${index}`} className="h-10 rounded-lg"></div>
          ))}
          
          {/* Days */}
          {days.map((day) => {
            const dayFollowUps = getFollowUpsForDay(day);
            const hasFollowUps = dayFollowUps.length > 0;
            const isOverdue = hasOverdueFollowUps(day);
            const isDueToday = hasTodayFollowUps(day);
            const isSelected = selectedDate?.getDate() === day && 
                              selectedDate?.getMonth() === currentMonth && 
                              selectedDate?.getFullYear() === currentYear;
            
            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (hasFollowUps) {
                    setSelectedDate(new Date(currentYear, currentMonth, day));
                  }
                }}
                className={`h-10 flex items-center justify-center rounded-lg cursor-pointer relative ${
                  isToday(day) 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : isSelected
                    ? 'bg-indigo-500 text-white font-medium'
                    : hasFollowUps
                    ? 'hover:bg-gray-100'
                    : ''
                }`}
              >
                <span className={`text-sm ${isSelected ? 'text-white' : ''}`}>{day}</span>
                
                {/* Indicator for follow-ups */}
                {hasFollowUps && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {isOverdue && (
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    )}
                    {isDueToday && (
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                    )}
                    {!isOverdue && !isDueToday && hasFollowUps && (
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* Selected Day Follow-ups */}
        <AnimatePresence>
          {selectedDate && selectedDayFollowUps.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 border-t border-gray-200 pt-4"
            >
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {formatDate(selectedDate)}
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedDayFollowUps.map((followUp) => (
                  <motion.div
                    key={followUp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-lg border ${
                      followUp.completed
                        ? 'bg-gray-50 border-gray-200'
                        : new Date(followUp.dueDate) < today
                        ? 'bg-red-50 border-red-200'
                        : isToday(selectedDate.getDate())
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-indigo-50 border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <button
                            onClick={() => onViewContact(followUp.contactId)}
                            className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate"
                          >
                            {followUp.contactName}
                          </button>
                        </div>
                        <div 
                          className={`mt-1 text-sm ${
                            followUp.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                          }`}
                        >
                          {followUp.description}
                        </div>
                        <div className={`mt-1 flex items-center text-xs ${
                          followUp.completed
                            ? 'text-gray-400'
                            : new Date(followUp.dueDate) < today
                            ? 'text-red-600'
                            : isToday(selectedDate.getDate())
                            ? 'text-amber-600'
                            : 'text-indigo-600'
                        }`}>
                          {followUp.completed ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : new Date(followUp.dueDate) < today ? (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {formatRelativeDate(followUp.dueDate)}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex">
                        <button
                          onClick={() => onToggleFollowUp(followUp.contactId, followUp.id, !followUp.completed)}
                          className={`p-1 rounded-full ${
                            followUp.completed
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={followUp.completed ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {followUp.completed ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => onViewContact(followUp.contactId)}
                          className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full ml-1"
                          title="View contact"
                        >
                          <User className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 justify-center border-t border-gray-100 pt-4">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
            <span>Overdue</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
            <span>Due Today</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-indigo-500 mr-1"></div>
            <span>Upcoming</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-gray-300 mr-1"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}