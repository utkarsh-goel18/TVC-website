-- ============================================================================
-- TVC EXCLUSIVE — PRIVATE MEMBER ECOSYSTEM
-- PostgreSQL / Supabase Migration & Row-Level Security (RLS) Schema
-- Thapar Venture Club (TIET Patiala)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. POSITIONS
CREATE TABLE IF NOT EXISTS positions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  organisational_level INTEGER NOT NULL CHECK (organisational_level IN (1, 2, 3)),
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);

-- 3. POSITION_PERMISSIONS
CREATE TABLE IF NOT EXISTS position_permissions (
  position_id TEXT NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (position_id, permission_id)
);

-- 4. MEMBERS
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  academic_year TEXT NOT NULL DEFAULT '3rd Year',
  position_id TEXT NOT NULL REFERENCES positions(id),
  membership_status TEXT NOT NULL DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive', 'suspended')),
  profile_image TEXT,
  bio TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  linkedin TEXT,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_level ON members(level);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(membership_status);
CREATE INDEX IF NOT EXISTS idx_members_roll ON members(roll_number);

-- 5. MEMBER_PERMISSIONS (Explicit per-member permission overrides/grants)
CREATE TABLE IF NOT EXISTS member_permissions (
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by TEXT REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (member_id, permission_id)
);

-- 6. DEPARTMENTS (7 Official TVC Departments)
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  accent_color TEXT NOT NULL DEFAULT '#f5ed00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MEMBER_DEPARTMENTS (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS member_departments (
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  assigned_by TEXT REFERENCES members(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (member_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_member_departments_dept ON member_departments(department_id);

-- 8. MEMBER_POSITION_HISTORY (Audit trail for Core promotions & position changes)
CREATE TABLE IF NOT EXISTS member_position_history (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  previous_position_id TEXT NOT NULL REFERENCES positions(id),
  new_position_id TEXT NOT NULL REFERENCES positions(id),
  previous_level INTEGER NOT NULL,
  new_level INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  changed_by TEXT NOT NULL REFERENCES members(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. MEMBERSHIP_APPLICATIONS
CREATE TABLE IF NOT EXISTS membership_applications (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  requested_level INTEGER NOT NULL CHECK (requested_level IN (1, 2)),
  department_interests TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  previous_experience TEXT NOT NULL DEFAULT '',
  motivation TEXT NOT NULL,
  additional_info TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT REFERENCES members(id),
  review_comments TEXT,
  rejection_reason TEXT,
  provisioned_member_id TEXT REFERENCES members(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_application
  ON membership_applications(roll_number)
  WHERE status IN ('pending', 'accepted');

-- 10. APPLICATION_REVIEWS
CREATE TABLE IF NOT EXISTS application_reviews (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES membership_applications(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES members(id),
  decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected')),
  comments TEXT NOT NULL DEFAULT '',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  expected_deliverables TEXT NOT NULL DEFAULT '',
  reference_links TEXT[] NOT NULL DEFAULT '{}',
  created_by TEXT NOT NULL REFERENCES members(id),
  parent_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  deadline TIMESTAMPTZ NOT NULL,
  assignment_mode TEXT NOT NULL CHECK (assignment_mode IN ('individual', 'multiple', 'everyone', 'random', 'open_pool')),
  random_distribution_mode TEXT CHECK (random_distribution_mode IN ('pure', 'balanced', 'department')),
  open_pool_config JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'accepted',
      'in_progress',
      'submitted',
      'under_review',
      'revision_requested',
      'approved',
      'rejected',
      'completed',
      'cancelled'
    )
  ),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_dept ON tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- 12. TASK_ASSIGNMENTS
CREATE TABLE IF NOT EXISTS task_assignments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'accepted',
      'in_progress',
      'submitted',
      'under_review',
      'revision_requested',
      'approved',
      'rejected',
      'completed',
      'cancelled'
    )
  ),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  submission_notes TEXT,
  submission_links TEXT[] NOT NULL DEFAULT '{}',
  review_feedback TEXT,
  accepted_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT REFERENCES members(id),
  UNIQUE (task_id, member_id)
);

-- 13. TASK_COMMENTS
CREATE TABLE IF NOT EXISTS task_comments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. TASK_ATTACHMENTS
CREATE TABLE IF NOT EXISTS task_attachments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by TEXT NOT NULL REFERENCES members(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. TASK_ACTIVITY
CREATE TABLE IF NOT EXISTS task_activity (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES members(id),
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'level', 'department', 'direct')),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,
  level INTEGER CHECK (level IN (1, 2, 3)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. CONVERSATION_MEMBERS
CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_muted BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (conversation_id, member_id)
);

-- 18. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES members(id),
  content TEXT NOT NULL,
  attachment_path TEXT,
  attachment_name TEXT,
  links TEXT[] NOT NULL DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  read_by TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at DESC);

-- 19. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  deep_link TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);

-- 20. DEVICE_TOKENS (Expo Push Notifications)
CREATE TABLE IF NOT EXISTS device_tokens (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES members(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_position_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

