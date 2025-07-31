/*
  # Add location tracking for contacts

  1. Changes
    - Add meeting_location JSONB column to contacts table to store:
      - name (text): Location name
      - latitude (numeric): GPS latitude
      - longitude (numeric): GPS longitude
      - venue (text): Optional venue name

  2. Security
    - Maintain existing RLS policies
*/

-- Add meeting_location column to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS meeting_location JSONB;

-- Create index for meeting_location to improve query performance
CREATE INDEX IF NOT EXISTS contacts_meeting_location_idx ON contacts USING gin(meeting_location);

-- Add validation for meeting_location JSON structure
ALTER TABLE contacts
ADD CONSTRAINT meeting_location_validation
CHECK (
  meeting_location IS NULL OR (
    meeting_location ? 'name' AND
    meeting_location ? 'latitude' AND
    meeting_location ? 'longitude' AND
    jsonb_typeof(meeting_location->'name') = 'string' AND
    (jsonb_typeof(meeting_location->'latitude') = 'number' OR jsonb_typeof(meeting_location->'latitude') = 'string') AND
    (jsonb_typeof(meeting_location->'longitude') = 'number' OR jsonb_typeof(meeting_location->'longitude') = 'string')
  )
);