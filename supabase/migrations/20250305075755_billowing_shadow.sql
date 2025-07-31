-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own QR codes" ON qr_codes;
  DROP POLICY IF EXISTS "Users can create own QR codes" ON qr_codes;
  DROP POLICY IF EXISTS "Users can update scanned QR codes" ON qr_codes;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create connection_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS connection_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scanned_by uuid REFERENCES profiles(id),
  scanned_at timestamptz,
  location jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS if not already enabled
ALTER TABLE connection_codes ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Connection codes can be read by owner or scanner"
  ON connection_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = scanned_by);

CREATE POLICY "Connection codes can be created by owner"
  ON connection_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Connection codes can be updated by owner or scanner"
  ON connection_codes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (auth.uid() = scanned_by AND status = 'active')
  );

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_connection_codes_user_id ON connection_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_codes_scanned_by ON connection_codes(scanned_by);
CREATE INDEX IF NOT EXISTS idx_connection_codes_status ON connection_codes(status);
CREATE INDEX IF NOT EXISTS idx_connection_codes_code ON connection_codes(code);

-- Create or replace functions
CREATE OR REPLACE FUNCTION generate_connection_code()
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
      SELECT 1 FROM connection_codes WHERE code = result
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create function to handle code expiration
CREATE OR REPLACE FUNCTION handle_code_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.expires_at < now() THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace triggers
DROP TRIGGER IF EXISTS handle_code_expiration_trigger ON connection_codes;
CREATE TRIGGER handle_code_expiration_trigger
  BEFORE UPDATE OR INSERT ON connection_codes
  FOR EACH ROW
  EXECUTE FUNCTION handle_code_expiration();

-- Create function to auto-generate code
CREATE OR REPLACE FUNCTION auto_generate_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_connection_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating codes
DROP TRIGGER IF EXISTS auto_generate_code_trigger ON connection_codes;
CREATE TRIGGER auto_generate_code_trigger
  BEFORE INSERT ON connection_codes
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_code();