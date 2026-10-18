# ShikshaSetu — Security & Child Data Protection Checklist

## 1. Regulatory Alignment (India Digital Personal Data Protection Act, 2023)

- [x] **Processing Child Data (Section 9 DPDP Act):** The platform is purposefully designed to improve educational learning outcomes without tracking children's personal habits, online behaviors, or physical locations.
- [x] **No Behavioral Monitoring or Targeted Ads:** The platform completely disallows behavioral profiling, location tracking, advertising identifiers, or data monetization.
- [x] **Authorized Parental & School Enrolment:** Student accounts are only created by school-authorized personnel (headmasters, registered teachers).
- [x] **Data Minimization:** No personal phone numbers, home addresses, photographs, biometric identifiers, or government ID numbers (e.g. Aadhaar) are stored for students.

## 2. Authentication & Account Security

- [x] **PIN Cryptography:** Student and staff PINs are never stored in plaintext. Hashing is performed using PBKDF2 with HMAC-SHA512 (100,000 iterations) and a 32-byte cryptographically random salt per user.
- [x] **Constant-Time Verification:** Hash comparisons use `crypto.timingSafeEqual` to prevent side-channel timing attacks.
- [x] **Anti-Brute Force Rate Limiting:** Consecutive failed login attempts trigger an escalating lockout (5 failed attempts trigger a 15-minute lockout).
- [x] **Enumeration Prevention:** Failed authentication responses return a generic message ("Invalid Student ID or PIN") regardless of whether the identifier exists in the database.
- [x] **Teacher-Authorized PIN Reset:** Teachers and School Administrators can reset forgotten PINs for their enrolled students. Student accounts cannot reset peer accounts.

## 3. Role-Based Access Control (RBAC) & Multi-School Isolation

- [x] **Strict Server-Side Validation:** All sensitive endpoints enforce authorization middleware on the backend; authorization is never left to client-side button hiding.
- [x] **Multi-School Isolation:** Teachers and School Admins can only query or alter records belonging to their assigned school (`school_id`). Cross-school queries are strictly forbidden (HTTP 403 Forbidden).
- [x] **Student Record Confidentiality:** Students can only read and write their own submissions. Direct object access to another student's record is blocked.
- [x] **Row Level Security (RLS) Policies:** Production Supabase/PostgreSQL migrations enforce table-level RLS policies matching the RBAC rules.

## 4. Child Safety & Pedagogical Ethics

- [x] **No Public Rankings / Leaderboards:** Student progress is strictly private to the student and their authorized teacher. No social comparison or public shame is permitted.
- [x] **Separation of Missing Work vs Performance:** Reporting clearly distinguishes non-submitted activities from conceptual difficulties.
- [x] **No Automated Punitive AI:** AI or algorithmic scorers are never permitted to label children as failures. Rubric evaluations are recorded by human educators with constructive comments.
- [x] **Physical Safety in Activities:** Science and water conservation activities forbid handling electrical appliances, touching live wiring, or repairing pressurized plumbing.

## 5. Offline & Shared Device Security

- [x] **Safe Sign-Out:** On shared classroom tablets or desktop PCs, signing out clears temporary cached drafts and student session tokens.
- [x] **Idempotency & Replay Protection:** Offline submissions include client-generated UUID keys to prevent duplicate records upon reconnection.
- [x] **Audit Logging without Secrets:** Administrative actions (class creation, student enrolment, PIN resets) are recorded in audit logs with passwords, PINs, and salts explicitly redacted.
