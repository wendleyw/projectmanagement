/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - first_name (text)
      - last_name (text)
      - avatar_url (text, nullable)
      - role (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - clients
      - id (uuid, primary key)
      - name (text)
      - contact_name (text)
      - email (text)
      - phone (text)
      - address (text, nullable)
      - status (text)
      - created_at (timestamp)
    
    - projects
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - client_id (uuid, foreign key)
      - start_date (timestamp)
      - end_date (timestamp)
      - actual_end_date (timestamp, nullable)
      - status (text)
      - budget (numeric, nullable)
      - manager_id (uuid, foreign key)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - tasks
      - id (uuid, primary key)
      - project_id (uuid, foreign key)
      - title (text)
      - description (text)
      - assignee_id (uuid, foreign key)
      - priority (text)
      - status (text)
      - created_at (timestamp)
      - start_date (timestamp, nullable)
      - due_date (timestamp, nullable)
      - estimated_hours (numeric, nullable)
      - parent_task_id (uuid, nullable, self-referencing foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  avatar_url text,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'client')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  status text NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  actual_end_date timestamptz,
  status text NOT NULL CHECK (status IN ('planned', 'in-progress', 'completed', 'on-hold', 'cancelled')),
  budget numeric,
  manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL CHECK (status IN ('todo', 'in-progress', 'review', 'completed', 'blocked')),
  created_at timestamptz DEFAULT now(),
  start_date timestamptz,
  due_date timestamptz,
  estimated_hours numeric,
  parent_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for clients table
CREATE POLICY "All authenticated users can read clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins and managers can modify clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );

-- Policies for projects table
CREATE POLICY "Users can read projects they are involved in"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.project_id = projects.id
      AND tasks.assignee_id = auth.uid()
    )
  );

CREATE POLICY "Only admins and managers can modify projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );

-- Policies for tasks table
CREATE POLICY "Users can read tasks they are involved in"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    assignee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.manager_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assigned tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (assignee_id = auth.uid());

CREATE POLICY "Managers can modify all tasks in their projects"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.manager_id = auth.uid()
    )
  );