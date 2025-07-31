import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { Industry, INDUSTRY_LABELS } from '../../types/industry';

interface IndustrySelectProps {
  value: Industry | undefined;
  onChange: (value: Industry) => void;
  required?: boolean;
  className?: string;
}

export function IndustrySelect({ 
  value, 
  onChange, 
  required = false,
  className = ""
}: IndustrySelectProps) {
  return (
    <div className={className}>
      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
        Industry
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select
          id="industry"
          value={value || ''}
          onChange={(e) => onChange(e.target.value as Industry)}
          className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
          required={required}
        >
          <option value="">Select an industry</option>
          {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}