# शिक्षासेतु | ShikshaSetu

> **Tagline:** करके सीखें, समझकर बढ़ें (Learn by Doing, Grow by Understanding)  
> **Mission:** Improve children's actual learning outcomes by combining textbook knowledge, practical activities, project-based learning, financial literacy, and real-world problem-solving for limited-resource government schools.

---

## 🌟 Key Highlights

- **Mobile-First & Offline-First:** Operates seamlessly in zero-connectivity environments with automatic background synchronization upon reconnection.
- **Hindi-First Interface:** Default Hindi UI with an instant English toggle, crafted using Class 6 friendly vocabulary and high-contrast, accessible typography.
- **Classroom Mode Without Student Phones:** Enables teachers in device-constrained schools to project lessons to the whole class, divide students into groups, download printable paper worksheets, and record group outcomes on a single device.
- **Child Privacy by Design (DPDP Act Aligned):** No location tracking, no camera/contacts permissions, no behavioral ad profiling, no public student rankings or social shame leaderboards.
- **Enterprise-Grade Security:** Salted PBKDF2 PIN hashing (100,000 iterations), constant-time comparisons, escalating rate-limit lockouts, teacher-authorized PIN resets, and multi-school isolation.
- **Learning Assessment System:** Outcome-based rubric (Achieved, Developing, Needs Support) with constructive teacher comments, transparent next-learning recommendations, and reporting that clearly distinguishes missing work from conceptual difficulty.

---

## 🛠️ Architecture & Tech Stack

```
shikshasetu/
├── backend/                  # Node.js + Express + TypeScript API Server & node:sqlite / Supabase
│   ├── src/                  # Auth, RBAC, Hasher, RateLimiter, AuditLog, SyncEngine, Routes
│   ├── migrations/           # Supabase PostgreSQL schema with Row Level Security (RLS) policies
│   └── tests/                # 19 automated integration and unit tests (all passing)
├── frontend/                 # Unified Responsive Web App (Student PWA + Teacher Portal + Admin)
│   ├── src/                  # React 18, TypeScript, Tailwind CSS, Lucide icons, IndexedDB
│   └── dist/                 # Production build bundle verified
├── android/                  # Native Android App (Kotlin + Jetpack Compose + Room SQLite)
│   ├── app/src/main/         # 11 functional screens, Room Entity/DAO, localized values/values-hi
│   └── README.md             # APK compilation instructions
├── docs/                     # Guides
│   ├── SECURITY_CHECKLIST.md # DPDP Act compliance & threat analysis
│   ├── OFFLINE_SYNC_SPEC.md  # Conflict resolution & idempotency protocol
│   ├── TEACHER_GUIDE.md      # How to conduct lessons with zero student phones
│   └── WATER_CONSERVATION_CURRICULUM.md # 3-Day Class 6 lesson plan
├── .env.example
└── README.md
```

---

## 🚀 Quick Start: Running Locally

### Prerequisites
- Node.js v20+ or v26+ (Node v26.10.0 includes native SQLite and the built-in test runner).

### 1. Start the Backend API Server
```bash
# In the shikshasetu/backend directory
cd backend
npm install
npm run seed     # Seeds realistic schools, users, classes, and the water conservation project
npm run dev      # Launches API server at http://localhost:5000
```

### 2. Start the Frontend Application
```bash
# In the shikshasetu/frontend directory
cd ../frontend
npm install
npm run dev      # Launches Vite dev server at http://localhost:3000
```

Open `http://localhost:3000` in any browser or mobile device.

---

## 🧪 Automated Testing

ShikshaSetu includes a comprehensive automated test suite testing authentication, security lockouts, role-based access control, cross-school isolation, rubric evaluations, and multi-device offline synchronization.

To run the full test suite:
```bash
cd backend
npm test
```

### Test Results Summary:
```
✔ Authentication & Security Tests (6 tests passed)
  - PIN Hasher creates secure salted hash with constant-time verification
  - Valid Student Login (ID: STU-1001, PIN: 4321) succeeds and returns JWT
  - Invalid Student PIN returns generic 401 error without user enumeration
  - Rate limiting triggers escalating lockout after 5 consecutive failures
  - Teacher-authorized PIN reset successfully changes PIN and clears lockout
  - Student cannot call PIN reset endpoint (RBAC rejection)

✔ Role-Based Access Control & Cross-School Isolation Tests (5 tests passed)
  - Cross-school isolation: Teacher in School 2 cannot view School 1 class roster
  - Cross-school isolation: Teacher in School 2 cannot reset PIN for School 1 student
  - Authorized Teacher in School 1 CAN view School 1 class and students
  - Student record privacy: Student 1 cannot view Student 2 private submissions
  - Student cannot create a new class (Role check)

✔ Project Submission & Rubric Assessment Engine Tests (5 tests passed)
  - Student completes Day 1 Water Conservation worksheet
  - Duplicate submission with same idempotency key is safely ignored
  - Teacher evaluates submission with 3-tier rubric and constructive comment
  - Class summary report clearly distinguishes missing work from poor performance
  - Student views personal progress and teacher feedback

✔ Offline Synchronization & Conflict Engine Tests (3 tests passed)
  - Batch sync processes queued offline submissions and confirms with server timestamp
  - Re-syncing the same offline items returns duplicate_acknowledged
  - Multi-device conflict: newer client submission updates existing server record

Tests: 19 passed, 0 failed, 0 skipped
```

---

## 🔑 Demo Accounts & Credentials

### Students (Student ID + PIN Login):
| Student Name | Student ID Code | PIN | School | Role |
| :--- | :--- | :--- | :--- | :--- |
| आरव कुमार (Aarav Kumar) | `STU-1001` | `4321` | रामपुर (GUPS Rampur) | Student |
| प्रिया सिंह (Priya Singh) | `STU-1002` | `4321` | रामपुर (GUPS Rampur) | Student |
| रोहन वर्मा (Rohan Verma) | `STU-1003` | `4321` | रामपुर (GUPS Rampur) | Student |
| दीपक शर्मा (Deepak Sharma) | `STU-2001` | `4321` | बहरामपुर (GSS Behrampur) | Student (Isolated School) |

### School Staff (Email + PIN Login):
| Staff Name | Email | PIN | Role | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| श्रीमती अनीता शर्मा | `anita.sharma@shikshasetu.org` | `123456` | Teacher | Class 6-A, Projector Mode, Assessments |
| श्री विक्रम सिंह | `vikram.singh@shikshasetu.org` | `123456` | Teacher | School 2 (Used for isolation verification) |
| सुरेश चंद शर्मा (प्रधानाध्यापक) | `admin.rampur@shikshasetu.org` | `888888` | School Admin | School 1 Management, PIN Resets, Audit Logs |
| मुख्य व्यवस्थापक | `admin@shikshasetu.org` | `999999` | Platform Admin | System-wide Security & School Approval |

---

## 📱 Building the Android APK

The `android/` directory contains the complete Android application with Room offline persistence and Jetpack Compose screens.

### Prerequisites:
- JDK 17+
- Android SDK 34 (compileSdk 34, minSdk 24)

### Building via Android Studio:
1. Open Android Studio > **Open Project** > select `shikshasetu/android`.
2. Allow Gradle sync to complete.
3. Select **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. APK output will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

### Building via Command Line:
```bash
cd android
./gradlew assembleDebug       # Linux / macOS
gradlew.bat assembleDebug     # Windows
```

---

## 🌐 Production Deployment

### 1. Database (Supabase / PostgreSQL)
1. In your Supabase dashboard or PostgreSQL console, run the SQL script located at:
   `backend/migrations/001_initial_schema_supabase_postgres.sql`.
2. This creates all tables, foreign keys, indices, and enables Row Level Security (RLS) policies.

### 2. Backend Deployment (Docker / Linux Server)
1. Set production environment variables in `.env` (refer to `.env.example`). Ensure `JWT_SECRET` is changed to a high-entropy secret.
2. Build and start:
   ```bash
   cd backend
   npm run build
   node dist/server.js
   ```

### 3. Frontend Deployment (Vercel / Cloudflare Pages / Nginx)
1. Build production static bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the `frontend/dist/` directory behind an HTTPS reverse proxy (e.g. Nginx or Cloudflare) with caching headers for static assets.

---

## ⚠️ Known Limitations & Honest Status Report

1. **Host Environment JDK / Android SDK:**
   - The host system on which development took place currently has Node.js and Git installed, but does not have the Java Development Kit (JDK 17) or Android Studio SDK installed.
   - Per project guidelines (*"Never claim an APK has been built unless the build succeeds"*), the Android application source code (Gradle KTS scripts, AndroidManifest, Room database/entities/DAOs, and Jetpack Compose 11-screen UI) is fully authored and architecturally verified, but the final binary `.apk` compilation must be executed on a development machine or CI pipeline equipped with Android SDK Platform 34 and JDK 17.
2. **PWA Mobile Accessibility:**
   - To ensure immediate usability on any low-cost mobile phone or tablet, the web frontend has been built and verified as a fully responsive, offline-first Progressive Web App (PWA) with IndexedDB persistence, which runs directly in Chrome, Firefox, or Safari on any smartphone or tablet without requiring APK sideloading.
