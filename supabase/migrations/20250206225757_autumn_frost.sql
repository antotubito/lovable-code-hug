/*
  # Add Security Questions Support

  1. New Tables
    - `security_questions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `question_key` (text)
      - `answer_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `security_questions` table
    - Add policies for authenticated users
*/

-- Create security questions table
CREATE TABLE IF NOT EXISTS security_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  question_key text NOT NULL,
  answer_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE security_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own security questions"
  ON security_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security questions"
  ON security_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security questions"
  ON security_questions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX security_questions_user_id_idx ON security_questions(user_id);
CREATE INDEX security_questions_question_key_idx ON security_questions(question_key);

-- Add updated_at trigger
CREATE TRIGGER update_security_questions_updated_at
  BEFORE UPDATE ON security_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();