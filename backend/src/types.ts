export type UserRole = 'student' | 'teacher' | 'school_admin' | 'platform_admin';

export interface User {
  id: string;
  role: UserRole;
  school_id: string;
  student_id_code?: string; // e.g. "STU-101", unique per school
  name: string;
  email?: string;
  salt: string;
  hashed_pin: string;
  is_locked: boolean;
  failed_attempts: number;
  lockout_until?: string | null;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  udise_code: string; // Unified District Information System for Education (Indian school code)
  district: string;
  state: string;
  is_active: boolean;
  created_at: string;
}

export interface ClassRoom {
  id: string;
  school_id: string;
  name: string; // e.g. "Class 6-A"
  grade_level: number; // 6
  section: string; // "A"
  join_code: string; // Non-sensitive 6-character code
  academic_year: string;
  created_at: string;
}

export interface ClassTeacherAssignment {
  id: string;
  class_id: string;
  teacher_id: string;
  assigned_at: string;
}

export interface StudentEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  roll_number?: string;
  enrolled_at: string;
}

export interface LearningObjective {
  id: string;
  code: string; // e.g. "LO-WATER-01"
  project_id: string;
  day_number: number;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
}

export interface Project {
  id: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  grade_level: number;
  duration_days: number;
  category: string;
  is_published: boolean;
  created_at: string;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  day_number: number;
  title_en: string;
  title_hi: string;
  objective_en: string;
  objective_hi: string;
  instructions_en: string;
  instructions_hi: string;
  worksheet_template: Record<string, any>;
}

export interface Submission {
  id: string;
  project_id: string;
  activity_id: string;
  day_number: number;
  student_id: string;
  class_id: string;
  submission_type: 'individual' | 'group' | 'paper_recorded_by_teacher';
  group_name?: string;
  answers: Record<string, any>;
  submitted_at: string;
  sync_status: 'synced' | 'pending';
  client_idempotency_key?: string;
}

export type AssessmentRubric = 'achieved' | 'developing' | 'needs_support';

export interface Assessment {
  id: string;
  submission_id: string;
  student_id: string;
  evaluator_teacher_id: string;
  objective_id: string;
  rubric: AssessmentRubric;
  constructive_comment: string;
  evaluated_at: string;
}

export interface AuditEvent {
  id: string;
  school_id?: string;
  actor_user_id: string;
  actor_role: UserRole;
  action: string;
  target_resource: string;
  target_id?: string;
  ip_address?: string;
  details?: string;
  created_at: string;
}

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
  schoolId: string;
  studentIdCode?: string;
  name: string;
}
