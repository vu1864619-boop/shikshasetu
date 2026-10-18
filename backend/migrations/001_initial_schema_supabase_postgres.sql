-- ====================================================================
-- ShikshaSetu Supabase & PostgreSQL Migration with Row Level Security (RLS)
-- Version: 001_initial_schema
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Schools Table
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    udise_code VARCHAR(50) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. App Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(30) NOT NULL CHECK (role IN ('student', 'teacher', 'school_admin', 'platform_admin')),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id_code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    salt VARCHAR(64) NOT NULL,
    hashed_pin VARCHAR(255) NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    lockout_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_student UNIQUE(school_id, student_id_code)
);

CREATE INDEX idx_users_school_student ON public.users(school_id, student_id_code);
CREATE INDEX idx_users_role ON public.users(role);

-- 4. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 6,
    section VARCHAR(10) NOT NULL DEFAULT 'A',
    join_code VARCHAR(20) UNIQUE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classes_school ON public.classes(school_id);

-- 5. Class Teacher Assignments
CREATE TABLE IF NOT EXISTS public.class_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_teacher UNIQUE(class_id, teacher_id)
);

-- 6. Student Enrollments
CREATE TABLE IF NOT EXISTS public.student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    roll_number VARCHAR(20),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_student UNIQUE(class_id, student_id)
);

CREATE INDEX idx_enrollments_student ON public.student_enrollments(student_id);
CREATE INDEX idx_enrollments_class ON public.student_enrollments(class_id);

-- 7. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    description_en TEXT NOT NULL,
    description_hi TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 6,
    duration_days INTEGER NOT NULL DEFAULT 3,
    category VARCHAR(50) NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Project Activities Table
CREATE TABLE IF NOT EXISTS public.project_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    objective_en TEXT NOT NULL,
    objective_hi TEXT NOT NULL,
    instructions_en TEXT NOT NULL,
    instructions_hi TEXT NOT NULL,
    worksheet_template_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_day UNIQUE(project_id, day_number)
);

-- 9. Learning Objectives Table
CREATE TABLE IF NOT EXISTS public.learning_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    description_en TEXT NOT NULL,
    description_hi TEXT NOT NULL
);

-- 10. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES public.project_activities(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    submission_type VARCHAR(50) NOT NULL CHECK (submission_type IN ('individual', 'group', 'paper_recorded_by_teacher')),
    group_name VARCHAR(100),
    answers_json JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sync_status VARCHAR(20) NOT NULL DEFAULT 'synced',
    client_idempotency_key VARCHAR(100) UNIQUE
);

CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_submissions_activity ON public.submissions(activity_id);
CREATE INDEX idx_submissions_class ON public.submissions(class_id);

-- 11. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    evaluator_teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    objective_id UUID NOT NULL REFERENCES public.learning_objectives(id) ON DELETE CASCADE,
    rubric VARCHAR(30) NOT NULL CHECK (rubric IN ('achieved', 'developing', 'needs_support')),
    constructive_comment TEXT NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_submission_objective UNIQUE(submission_id, objective_id)
);

CREATE INDEX idx_assessments_student ON public.assessments(student_id);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    actor_user_id UUID NOT NULL,
    actor_role VARCHAR(30) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    ip_address VARCHAR(50),
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get current authenticated user role and school
CREATE OR REPLACE FUNCTION current_user_school_id() RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'schoolId')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'role';
$$ LANGUAGE sql STABLE;

-- 1) Schools RLS:
-- Platform admins can see and manage all schools.
-- Teachers, students, school admins can only read their own school.
CREATE POLICY "Schools access policy" ON public.schools
  FOR SELECT
  USING (
    current_user_role() = 'platform_admin' OR
    id = current_user_school_id()
  );

-- 2) Users RLS:
-- Students can only view their own user record.
-- Teachers and school admins can only view users in their own school.
-- Sensitive columns (hashed_pin, salt) are restricted via view or RPC.
CREATE POLICY "Users view policy" ON public.users
  FOR SELECT
  USING (
    current_user_role() = 'platform_admin' OR
    (current_user_role() IN ('teacher', 'school_admin') AND school_id = current_user_school_id()) OR
    (current_user_role() = 'student' AND id = auth.uid())
  );

-- 3) Submissions RLS:
-- Students can select & insert only their own submissions.
-- Teachers can view submissions from their assigned classes or school.
CREATE POLICY "Students manage own submissions" ON public.submissions
  FOR ALL
  USING (
    current_user_role() = 'student' AND student_id = auth.uid()
  );

CREATE POLICY "Teachers view school submissions" ON public.submissions
  FOR SELECT
  USING (
    current_user_role() IN ('teacher', 'school_admin') AND
    class_id IN (SELECT id FROM public.classes WHERE school_id = current_user_school_id())
  );

-- 4) Assessments RLS:
-- Teachers can insert/update assessments for their school's students.
-- Students can view only assessments of their own submissions.
CREATE POLICY "Teachers manage assessments" ON public.assessments
  FOR ALL
  USING (
    current_user_role() IN ('teacher', 'school_admin') AND
    student_id IN (SELECT id FROM public.users WHERE school_id = current_user_school_id())
  );

CREATE POLICY "Students view own assessments" ON public.assessments
  FOR SELECT
  USING (
    current_user_role() = 'student' AND student_id = auth.uid()
  );

-- 5) Audit Logs RLS:
-- Read-only by school admin (for their school) and platform admin (all)
CREATE POLICY "Audit logs admin access" ON public.audit_logs
  FOR SELECT
  USING (
    current_user_role() = 'platform_admin' OR
    (current_user_role() = 'school_admin' AND school_id = current_user_school_id())
  );
