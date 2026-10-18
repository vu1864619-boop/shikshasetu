import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { apiRequest } from '../../utils/api.js';
import { BookOpen, Droplet, CheckCircle2, Clock, ArrowRight, Award, ShieldAlert } from 'lucide-react';

interface StudentDashboardProps {
  onOpenWaterProject: (day?: number) => void;
  onViewProgress: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenWaterProject, onViewProgress }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      const res = await apiRequest('/assessments/my-progress');
      if (res.ok && res.data) {
        setSubmissions(res.data.submissions || []);
        setAssessments(res.data.assessments || []);
      }
      setIsLoading(false);
    };
    fetchStudentData();
  }, []);

  const submittedDays = new Set(submissions.map((s) => s.day_number));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Student Profile Welcome Card */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                कक्षा 6 • Class 6
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-800/60">
                {user?.student_id_code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('welcome')}, {user?.name}!
            </h1>
            <p className="text-sm text-brand-100 mt-1 font-medium">
              {user?.school_name || 'राजकीय उच्च प्राथमिक विद्यालय'}
            </p>
          </div>

          <button
            onClick={onViewProgress}
            className="px-5 py-2.5 rounded-xl bg-white text-brand-800 hover:bg-brand-50 text-xs sm:text-sm font-black shadow-lg transition flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>{t('myProgress')}</span>
          </button>
        </div>
      </div>

      {/* Active Project: Water Conservation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              {t('activeProjectTag')}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {language === 'hi' ? '3 दिवसीय व्यावहारिक कार्य' : '3-Day Practical Activity'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Droplet className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('waterProjectTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {language === 'hi'
                ? 'पानी के रिसाव को पहचानें, तालिकाओं में डेटा गिनें और अपनी कक्षा व घर के लिए जल-बचत के उपाय बनाएं।'
                : 'Identify water waste, count observations in tables, and propose practical solutions for your school and community.'}
            </p>
          </div>
        </div>

        {/* 3-Day Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Day 1 */}
          <div
            onClick={() => onOpenWaterProject(1)}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
              submittedDays.has(1)
                ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                : 'border-slate-200 bg-slate-50 hover:border-brand-500 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-700">दिवस 1 (Day 1)</span>
              {submittedDays.has(1) ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> पूर्ण
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> प्रारंभ करें
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {language === 'hi' ? 'निरीक्षण और पहचान' : 'Observe & Identify'}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2">
              {language === 'hi'
                ? 'दैनिक जल उपयोग व व्यर्थ बहाव के स्थानों को पहचानना।'
                : 'Identify everyday water uses and waste points.'}
            </p>
          </div>

          {/* Day 2 */}
          <div
            onClick={() => onOpenWaterProject(2)}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
              submittedDays.has(2)
                ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                : 'border-slate-200 bg-slate-50 hover:border-brand-500 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-700">दिवस 2 (Day 2)</span>
              {submittedDays.has(2) ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> पूर्ण
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> खुला है
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {language === 'hi' ? 'डेटा संग्रह और समझ' : 'Collect & Understand Data'}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2">
              {language === 'hi'
                ? 'तालिका में संख्याएं गिनना और बार चार्ट से निष्कर्ष निकालना।'
                : 'Tally categories in tables and interpret bar charts.'}
            </p>
          </div>

          {/* Day 3 */}
          <div
            onClick={() => onOpenWaterProject(3)}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
              submittedDays.has(3)
                ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                : 'border-slate-200 bg-slate-50 hover:border-brand-500 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-700">दिवस 3 (Day 3)</span>
              {submittedDays.has(3) ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> पूर्ण
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> खुला है
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {language === 'hi' ? 'व्यावहारिक समाधान' : 'Propose Solutions'}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2">
              {language === 'hi'
                ? 'डेटा पर आधारित दो व्यावहारिक जल-बचत समाधान लिखना।'
                : 'Propose two data-grounded water conservation solutions.'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onOpenWaterProject(1)}
            className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <span>{t('startActivityBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Latest Teacher Feedback Snippet (if available) */}
      {assessments.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-xs font-black text-amber-800 uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>{t('teacherFeedback')}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 italic">
            "{assessments[0].constructive_comment}"
          </p>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            शिक्षक: {assessments[0].teacher_name} • मूल्यांकन: {new Date(assessments[0].evaluated_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};
