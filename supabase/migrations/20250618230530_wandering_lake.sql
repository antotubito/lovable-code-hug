/*
  # Add Feedback Table

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `email` (text)
      - `message` (text)

  2. Security
    - No RLS needed as this is a public table
*/

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text DEFAULT '',
  message text
);

-- No RLS needed for this table as it's for anonymous feedback
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;