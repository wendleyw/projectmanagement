/*
  # Add Members Table and Enhance Relationships

  1. New Tables
    - members
      - id (uuid, primary key)
      - user_id (uuid, foreign key to users)
      - department (text)
      - position (text)
      - hire_date (timestamp)
      - status (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. New Relationships
    - project_members (junction table)
      - project_id (uuid)
      - member_id (uuid)
      - role (text)
      - assigned_at (timestamp)

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  department text NOT NULL,
  position text NOT NULL,
  hire_date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Project Members junction table
CREATE TABLE IF NOT EXISTS project_members (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('lead', 'developer', 'designer', 'tester')),
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, member_id)
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Policies for members
CREATE POLICY "Users can view all active members"
  ON members
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins and managers can modify members"
  ON members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );

-- Policies for project_members
CREATE POLICY "Users can view project members they're involved with"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND (
        projects.manager_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM tasks
          WHERE tasks.project_id = projects.id
          AND tasks.assignee_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Only project managers can modify project members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.manager_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_department ON members(department);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_member_id ON project_members(member_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();