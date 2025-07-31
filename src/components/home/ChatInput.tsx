import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, placeholder = 'Type a message...', disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`flex items-center border rounded-lg shadow-sm transition-all ${
        isFocused 
          ? 'border-indigo-500 shadow-md' 
          : 'border-gray-300'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full py-3 px-4 bg-transparent focus:outline-none text-gray-700 rounded-lg"
        />
        
        {message && (
          <button
            type="button"
            onClick={() => setMessage('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex items-center pr-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!message.trim() || disabled} 
          className={`p-2 rounded-full mr-1 ${
            message.trim() && !disabled
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="h-5 w-5" />
        </motion.button>
      </div>
    </form>
  );
}