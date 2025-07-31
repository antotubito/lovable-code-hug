/*
  # Add onboarding fields to profiles table

  1. Changes
    - Add onboarding_complete boolean column
    - Add onboarding_completed_at timestamp column
    - Add default values and constraints
  
  2. Security
    - No changes to RLS policies needed
*/

-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;