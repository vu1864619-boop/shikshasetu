import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.js';
import { useLanguage } from './context/LanguageContext.js';
import { Navbar } from './components/Navbar.js';
import { StudentLogin } from './pages/student/StudentLogin.js';
import { StaffLogin } from './pages/teacher/StaffLogin.js';
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { WaterConservationProject } from './pages/student/WaterConservationProject.js';
import { MyProgress } from './pages/student/MyProgress.js';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard.js';
import { ClassroomModeProjector } from './pages/teacher/ClassroomModeProjector.js';
import { PrintableWorksheet } from './pages/teacher/PrintableWorksheet.js';
import { ClassroomManagement } from './pages/teacher/ClassroomManagement.js';
import { SubmissionReview } from './pages/teacher/SubmissionReview.js';
import { Reports } from './pages/teacher/Reports.js';
import { AuditLogsView } from './pages/admin/AuditLogsView.js';

export const App: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();

  const [authView, setAuthView] = useState<'student' | 'staff'>('student');
  const [currentTab, setCurrentTab] = useState<string>('default');
  const [activeProjectDay, setActiveProjectDay] = useState<number>(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-semibold text-sm">
        शिक्षासेतु लोड हो रहा है...
      </div>
    );
  }

  // Unauthenticated Flow
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="flex-1 flex items-center justify-center">
          {authView === 'student' ? (
            <StudentLogin onSwitchToStaff={() => setAuthView('staff')} />
          ) : (
            <StaffLogin onSwitchToStudent={() => setAuthView('student')} />
          )}
        </main>
        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200">
          शिक्षासेतु (ShikshaSetu) • भारत के सीमित संसाधन वाले विद्यालयों के लिए समर्पित • DPDP अधिनियम एवं बाल गोपनीयता सिद्धांतों के अनुरूप
        </footer>
      </div>
    );
  }

  // Authenticated Student Views
  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="flex-1 py-4">
          {currentTab === 'water-project' ? (
            <WaterConservationProject
              initialDay={activeProjectDay}
              onBack={() => setCurrentTab('student-dashboard')}
            />
          ) : currentTab === 'my-progress' ? (
            <MyProgress onBack={() => setCurrentTab('student-dashboard')} />
          ) : (
            <StudentDashboard
              onOpenWaterProject={(day = 1) => {
                setActiveProjectDay(day);
                setCurrentTab('water-project');
              }}
              onViewProgress={() => setCurrentTab('my-progress')}
            />
          )}
        </main>
        <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 print:hidden">
          शिक्षासेतु • करके सीखें, समझकर बढ़ें • सुरक्षित एवं ऑफ़लाइन समर्थित
        </footer>
      </div>
    );
  }

  // Authenticated Staff / Teacher / Admin Views
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Staff Secondary Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 print:hidden overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-bold whitespace-nowrap">
          <button
            onClick={() => setCurrentTab('teacher-dashboard')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'teacher-dashboard' || currentTab === 'default'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            नियंत्रण कक्ष (Dashboard)
          </button>

          <button
            onClick={() => setCurrentTab('classroom-projector')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'classroom-projector'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📺 प्रोजेक्टर मोड (Projector)
          </button>

          <button
            onClick={() => setCurrentTab('printable-worksheets')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'printable-worksheets'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🖨️ प्रिंट कार्यपत्रक (Printables)
          </button>

          <button
            onClick={() => setCurrentTab('submission-review')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'submission-review'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📋 कार्य मूल्यांकन (Assessments)
          </button>

          <button
            onClick={() => setCurrentTab('classroom-management')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'classroom-management'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            👥 कक्षा व पिन प्रबंधन (Class & PIN)
          </button>

          <button
            onClick={() => setCurrentTab('reports')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'reports'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📊 प्रगति रिपोर्ट (Reports)
          </button>

          {(user.role === 'school_admin' || user.role === 'platform_admin') && (
            <button
              onClick={() => setCurrentTab('audit-logs')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentTab === 'audit-logs'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🛡️ सुरक्षा ऑडिट लॉग (Audit Logs)
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 py-4">
        {currentTab === 'classroom-projector' ? (
          <ClassroomModeProjector
            onBack={() => setCurrentTab('teacher-dashboard')}
            onOpenPrintWorksheet={() => setCurrentTab('printable-worksheets')}
          />
        ) : currentTab === 'printable-worksheets' ? (
          <PrintableWorksheet onBack={() => setCurrentTab('teacher-dashboard')} />
        ) : currentTab === 'submission-review' ? (
          <SubmissionReview onBack={() => setCurrentTab('teacher-dashboard')} />
        ) : currentTab === 'classroom-management' ? (
          <ClassroomManagement onBack={() => setCurrentTab('teacher-dashboard')} />
        ) : currentTab === 'reports' ? (
          <Reports onBack={() => setCurrentTab('teacher-dashboard')} />
        ) : currentTab === 'audit-logs' ? (
          <AuditLogsView onBack={() => setCurrentTab('teacher-dashboard')} />
        ) : (
          <TeacherDashboard onNavigate={(tab) => setCurrentTab(tab)} />
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 print:hidden">
        शिक्षासेतु (ShikshaSetu) • विद्यालय शिक्षक पोर्टल • सुरक्षित सत्र
      </footer>
    </div>
  );
};
export default App;
