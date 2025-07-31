/*
  # Add Connection Requests Table

  1. New Tables
    - `connection_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `requester_id` (uuid, references profiles)
      - `code_id` (uuid, references connection_codes)
      - `status` (text, check: pending/accepted/declined)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on connection_requests table
    - Add policies for authenticated users to:
      - Create requests
      - Read own requests
      - Update own requests
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create connection requests" ON connection_requests;
  DROP POLICY IF EXISTS "Users can read own connection requests" ON connection_requests;
  DROP POLICY IF EXISTS "Users can update own connection requests" ON connection_requests;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create connection_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  code_id uuid REFERENCES connection_codes(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create connection requests"
  ON connection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can read own connection requests"
  ON connection_requests
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) OR (auth.uid() = requester_id));

CREATE POLICY "Users can update own connection requests"
  ON connection_requests
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id) OR (auth.uid() = requester_id));

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_connection_requests_user_id ON connection_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_requester_id ON connection_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);

-- Create or replace update timestamp function
CREATE OR REPLACE FUNCTION update_connection_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_connection_request_timestamp ON connection_requests;

-- Create trigger
CREATE TRIGGER update_connection_request_timestamp
  BEFORE UPDATE ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_connection_request_timestamp();