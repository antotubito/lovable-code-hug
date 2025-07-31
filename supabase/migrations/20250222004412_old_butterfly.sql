/*
  # Add invitation and connection tables

  1. New Tables
    - `invitation_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `code` (text, unique)
      - `used` (boolean)
      - `used_by` (uuid, references profiles)
      - `used_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

    - `connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `connected_user_id` (uuid, references profiles)
      - `invitation_code_id` (uuid, references invitation_codes)
      - `connection_date` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add indexes for performance

  3. Functions
    - Add function to generate unique invitation codes
    - Add function to validate and use invitation codes
*/

-- Create invitation_codes table
CREATE TABLE IF NOT EXISTS invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  code text UNIQUE NOT NULL,
  used boolean DEFAULT false,
  used_by uuid REFERENCES profiles(id),
  used_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  connected_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invitation_code_id uuid REFERENCES invitation_codes(id),
  connection_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- Enable Row Level Security
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Create policies for invitation_codes
CREATE POLICY "Users can read own invitation codes"
  ON invitation_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invitation codes"
  ON invitation_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invitation codes"
  ON invitation_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for connections
CREATE POLICY "Users can read own connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connections"
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX invitation_codes_user_id_idx ON invitation_codes(user_id);
CREATE INDEX invitation_codes_code_idx ON invitation_codes(code);
CREATE INDEX invitation_codes_used_by_idx ON invitation_codes(used_by);
CREATE INDEX connections_user_id_idx ON connections(user_id);
CREATE INDEX connections_connected_user_id_idx ON connections(connected_user_id);

-- Function to generate unique invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
  code_exists boolean;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || chars[1+random()*(array_length(chars, 1)-1)];
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM invitation_codes WHERE code = result
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;