-- Create user_permissions table to store user access permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_ids UUID[] DEFAULT '{}',
  task_ids UUID[] DEFAULT '{}',
  calendar_access BOOLEAN DEFAULT FALSE,
  tracking_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_permissions_updated_at
BEFORE UPDATE ON user_permissions
FOR EACH ROW
EXECUTE FUNCTION update_user_permissions_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own permissions or admins to see all
CREATE POLICY "Users can view their own permissions"
ON user_permissions
FOR SELECT
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can insert/update/delete permissions
CREATE POLICY "Only admins can manage permissions"
ON user_permissions
FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
