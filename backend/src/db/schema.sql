-- ShikshaSetu Core Relational Schema (SQLite / PostgreSQL Compatible)

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  udise_code TEXT UNIQUE NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'school_admin', 'platform_admin')),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id_code TEXT, -- Unique identifier within school (e.g. STU-1001)
  name TEXT NOT NULL,
  email TEXT,
  salt TEXT NOT NULL,
  hashed_pin TEXT NOT NULL,
  is_locked INTEGER NOT NULL DEFAULT 0,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  lockout_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(school_id, student_id_code)
);

CREATE INDEX IF NOT EXISTS idx_users_school_student ON users(school_id, student_id_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Class 6-A"
  grade_level INTEGER NOT NULL DEFAULT 6,
  section TEXT NOT NULL DEFAULT 'A',
  join_code TEXT UNIQUE NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);

CREATE TABLE IF NOT EXISTS class_teachers (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(class_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS student_enrollments (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roll_number TEXT,
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON student_enrollments(class_id);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_hi TEXT NOT NULL,
  grade_level INTEGER NOT NULL DEFAULT 6,
  duration_days INTEGER NOT NULL DEFAULT 3,
  category TEXT NOT NULL,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_activities (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  objective_en TEXT NOT NULL,
  objective_hi TEXT NOT NULL,
  instructions_en TEXT NOT NULL,
  instructions_hi TEXT NOT NULL,
  worksheet_template_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, day_number)
);

CREATE TABLE IF NOT EXISTS learning_objectives (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_hi TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL REFERENCES project_activities(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL CHECK(submission_type IN ('individual', 'group', 'paper_recorded_by_teacher')),
  group_name TEXT,
  answers_json TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  sync_status TEXT NOT NULL DEFAULT 'synced',
  client_idempotency_key TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_activity ON submissions(activity_id);
CREATE INDEX IF NOT EXISTS idx_submissions_class ON submissions(class_id);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  objective_id TEXT NOT NULL REFERENCES learning_objectives(id) ON DELETE CASCADE,
  rubric TEXT NOT NULL CHECK(rubric IN ('achieved', 'developing', 'needs_support')),
  constructive_comment TEXT NOT NULL,
  evaluated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(submission_id, objective_id)
);

CREATE INDEX IF NOT EXISTS idx_assessments_student ON assessments(student_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
  actor_user_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_resource TEXT NOT NULL,
  target_id TEXT,
  ip_address TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_school ON audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id);
