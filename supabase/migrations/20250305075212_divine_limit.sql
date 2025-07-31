/*
  # QR Code Sharing Implementation

  1. New Tables
    - `qr_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `code` (text, unique)
      - `scanned_at` (timestamptz)
      - `scanned_by` (uuid, references profiles)
      - `location` (jsonb)
      - `status` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
    - Add validation constraints

  3. Functions
    - Generate unique QR codes
    - Handle code expiration
    - Track scan events
*/

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  code text UNIQUE NOT NULL,
  scanned_at timestamptz,
  scanned_by uuid REFERENCES profiles(id),
  location jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own QR codes"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = scanned_by);

CREATE POLICY "Users can create own QR codes"
  ON qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update scanned QR codes"
  ON qr_codes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (auth.uid() = scanned_by AND status = 'active')
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_scanned_by ON qr_codes(scanned_by);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);

-- Create function to generate unique QR code
CREATE OR REPLACE FUNCTION generate_qr_code()
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
      SELECT 1 FROM qr_codes WHERE code = result
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create function to handle QR code expiration
CREATE OR REPLACE FUNCTION handle_qr_code_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.expires_at < now() THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle QR code expiration
CREATE TRIGGER handle_qr_code_expiration_trigger
  BEFORE UPDATE OR INSERT ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION handle_qr_code_expiration();

-- Create function to automatically generate QR code on insert
CREATE OR REPLACE FUNCTION auto_generate_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate QR code
CREATE TRIGGER auto_generate_qr_code_trigger
  BEFORE INSERT ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_qr_code();