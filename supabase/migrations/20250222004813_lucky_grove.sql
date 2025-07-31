/*
  # Add onboarding fields to profiles table

  1. New Fields
    - job_title (text)
    - industry (text)
    - birthday (date)
    - profile_image (text)
    - social_links (jsonb)
    - onboarding_step (text)
    - onboarding_started_at (timestamptz)
    - onboarding_completed_at (timestamptz)

  2. Changes
    - Add validation for industry values
    - Add validation for social_links structure
*/

-- Add new columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS birthday date,
ADD COLUMN IF NOT EXISTS profile_image text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS onboarding_step text,
ADD COLUMN IF NOT EXISTS onboarding_started_at timestamptz,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Add industry validation
ALTER TABLE profiles
ADD CONSTRAINT valid_industry CHECK (
  industry IS NULL OR industry IN (
    'technology', 'healthcare', 'finance', 'education', 'retail',
    'manufacturing', 'media', 'entertainment', 'hospitality',
    'real_estate', 'construction', 'transportation', 'energy',
    'agriculture', 'government', 'legal', 'consulting', 'nonprofit',
    'social_services', 'arts', 'sports', 'science', 'environmental',
    'volunteer', 'other'
  )
);

-- Add social_links validation
ALTER TABLE profiles
ADD CONSTRAINT valid_social_links CHECK (
  social_links IS NULL OR (
    jsonb_typeof(social_links) = 'object' AND
    (social_links->>'linkedin' IS NULL OR jsonb_typeof(social_links->'linkedin') = 'string') AND
    (social_links->>'twitter' IS NULL OR jsonb_typeof(social_links->'twitter') = 'string') AND
    (social_links->>'github' IS NULL OR jsonb_typeof(social_links->'github') = 'string')
  )
);