import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { apiRequest } from '../../utils/api.js';
import { 
  Users, 
  Tv, 
  Printer, 
  ClipboardCheck, 
  BarChart, 
  KeyRound, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  GraduationCap
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (view: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [classes, setClasses] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const clsRes = await apiRequest('/classes');
      if (clsRes.ok && clsRes.data) {
        setClasses(clsRes.data.classes || []);
        // Load summary for first class if available
        if (clsRes.data.classes.length > 0) {
          const firstClassId = clsRes.data.classes[0].id;
          const sumRes = await apiRequest(`/assessments/class-summary/${firstClassId}`);
          if (sumRes.ok && sumRes.data) {
            setSummaryData(sumRes.data);
          }
        }
      }
      setIsLoading(false);
    };
    loadDashboard();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Teacher Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-deepblue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
                {user?.role === 'school_admin' ? 'विद्यालय व्यवस्थापक' : 'कक्षा शिक्षक'}
              </span>
              <span className="text-xs text-blue-200">
                {user?.school_name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('welcome')}, {user?.name}!
            </h1>
            <p className="text-sm text-blue-100 mt-1 font-medium">
              {language === 'hi'
                ? 'कक्षा 6: प्रायोगिक जल संरक्षण परियोजना नियंत्रण कक्ष'
                : 'Class 6: Practical Water Conservation Pilot Dashboard'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('classroom-projector')}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition flex items-center gap-2"
          >
            <Tv className="w-5 h-5" />
            <span>{t('classroomModeProjector')}</span>
          </button>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">नामांकित कक्षाएं</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{classes.length}</span>
          <p className="text-[11px] text-slate-500 mt-1">कक्षा 6-अ सक्रिय</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">सहभागिता दर</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700">
            {summaryData?.aggregate?.participation_rate || 0}%
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            {summaryData?.aggregate?.participated_count || 0} / {summaryData?.aggregate?.total_enrolled || 0} विद्यार्थी
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">सक्रिय परियोजनाएं</span>
            <GraduationCap className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">1</span>
          <p className="text-[11px] text-slate-500 mt-1">जल संरक्षण (3 दिवस)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">सहायता की आवश्यकता</span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700">
            {summaryData?.aggregate?.students_needing_support || 0}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">मार्गदर्शन हेतु चिन्हित</p>
        </div>
      </div>

      {/* Classroom Mode Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
        <Tv className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold">बिना छात्र स्मार्टफोन की कक्षा (Single Device / Paper Classroom Mode):</p>
          <p className="mt-0.5 text-emerald-800">{t('singleDeviceNotice')}</p>
        </div>
      </div>

      {/* Navigation Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('classroom-projector')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Tv className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('classroomModeProjector')}</h3>
          <p className="text-xs text-slate-500 mt-1">
            प्रोजेक्टर या स्क्रीन पर पूरी कक्षा को निर्देश दिखाएं व समूह परिणाम दर्ज करें।
          </p>
        </div>

        <div
          onClick={() => onNavigate('printable-worksheets')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('printableWorksheets')}</h3>
          <p className="text-xs text-slate-500 mt-1">
            दिवस 1-3 के अवलोकन कार्यपत्रक प्रिंट करें या PDF डाउनलोड करें।
          </p>
        </div>

        <div
          onClick={() => onNavigate('submission-review')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('reviewSubmissions')}</h3>
          <p className="text-xs text-slate-500 mt-1">
            3-स्तरीय रूब्रिक (Achieved / Developing / Needs Support) से कार्य जांचें।
          </p>
        </div>

        <div
          onClick={() => onNavigate('classroom-management')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('classroomManagement')}</h3>
          <p className="text-xs text-slate-500 mt-1">
            विद्यार्थी नामांकन, कक्षा कोड और शिक्षक-अधिकृत पिन रीसेट (PIN Reset)।
          </p>
        </div>
      </div>

      {/* Classroom Learning Snapshot Table */}
      {summaryData && summaryData.students && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                कक्षा 6-अ सहभागिता एवं प्रगति सारांश
              </h2>
              <p className="text-xs text-slate-500">
                अपूर्ण कार्य और कमजोर प्रदर्शन को स्पष्ट रूप से अलग दर्शाता है।
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              विस्तृत रिपोर्ट देखें →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                <tr>
                  <th className="p-3">अनुक्रमांक</th>
                  <th className="p-3">विद्यार्थी का नाम</th>
                  <th className="p-3">आईडी</th>
                  <th className="p-3">जमा दिवस</th>
                  <th className="p-3">अपूर्ण दिवस (Missing)</th>
                  <th className="p-3">अधिगम स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summaryData.students.map((stu: any) => (
                  <tr key={stu.student_id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-slate-500">{stu.roll_number || '-'}</td>
                    <td className="p-3 font-bold text-slate-900">{stu.name}</td>
                    <td className="p-3 font-mono text-xs text-slate-500">{stu.student_id_code}</td>
                    <td className="p-3">
                      {stu.submitted_days.length > 0 ? (
                        <span className="font-bold text-emerald-700">
                          दिवस {stu.submitted_days.join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-400">कोई नहीं</span>
                      )}
                    </td>
                    <td className="p-3">
                      {stu.missing_days.length > 0 ? (
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                          दिवस {stu.missing_days.join(', ')} शेष
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                          सभी पूर्ण
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {stu.may_need_support ? (
                        <span className="text-amber-800 bg-amber-100 font-bold px-2.5 py-0.5 rounded-full text-xs">
                          सहायता अनुशंसित
                        </span>
                      ) : (
                        <span className="text-emerald-800 bg-emerald-100 font-bold px-2.5 py-0.5 rounded-full text-xs">
                          उत्साहवर्धक प्रगति
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
