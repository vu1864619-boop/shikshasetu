import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { apiRequest } from '../../utils/api.js';
import { 
  BarChart, 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

interface ReportsProps {
  onBack: () => void;
}

export const Reports: React.FC<ReportsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      const res = await apiRequest('/classes');
      if (res.ok && res.data && res.data.classes.length > 0) {
        setClasses(res.data.classes);
        setSelectedClassId(res.data.classes[0].id);
      }
    };
    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    const fetchReport = async () => {
      setIsLoading(true);
      const res = await apiRequest(`/assessments/class-summary/${selectedClassId}`);
      if (res.ok && res.data) {
        setReportData(res.data);
      }
      setIsLoading(false);
    };
    fetchReport();
  }, [selectedClassId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>नियंत्रण कक्ष पर वापस</span>
        </button>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>रिपोर्ट प्रिंट करें (Print Report)</span>
          </button>
        </div>
      </div>

      {reportData && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              कक्षा अधिगम एवं सहभागिता प्रगति रिपोर्ट
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              परियोजना: जल संरक्षण — समझें डेटा, बचाएं जल | {reportData.class_info?.name}
            </p>
          </div>

          {/* Aggregates */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block">कुल नामांकित</span>
              <span className="text-2xl font-black text-slate-900">
                {reportData.aggregate?.total_enrolled}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 block">सक्रिय सहभागिता</span>
              <span className="text-2xl font-black text-emerald-700">
                {reportData.aggregate?.participated_count} ({reportData.aggregate?.participation_rate}%)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 block">सहायता हेतु चिन्हित</span>
              <span className="text-2xl font-black text-amber-700">
                {reportData.aggregate?.students_needing_support}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-xs font-bold text-blue-800 block">परियोजना अवधि</span>
              <span className="text-2xl font-black text-blue-900">3 दिवस</span>
            </div>
          </div>

          {/* Pedagogical Principle Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong>शैक्षणिक सिद्धांत:</strong> यह प्रणाली विद्यार्थियों को ग्रेड या रैंक में बाँटने के बजाय उनके सीखने के परिणामों का समर्थन करती है। अपूर्ण कार्य (missing submissions) को कमजोर प्रदर्शन से स्पष्ट रूप से अलग दिखाया गया है।
          </div>

          {/* Detailed Student Roster with Rubric Counts & Missing Days */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                <tr>
                  <th className="p-3">अनुक्रमांक</th>
                  <th className="p-3">विद्यार्थी का नाम</th>
                  <th className="p-3">आईडी कोड</th>
                  <th className="p-3 text-center">पूर्ण दिवस</th>
                  <th className="p-3 text-center">अपूर्ण दिवस (Missing)</th>
                  <th className="p-3 text-center text-emerald-700">स्वतंत्र प्राप्त</th>
                  <th className="p-3 text-center text-amber-700">विकासशील</th>
                  <th className="p-3 text-center text-blue-700">सहायता आवश्यक</th>
                  <th className="p-3">सिफारिश</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.students?.map((stu: any) => (
                  <tr key={stu.student_id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-slate-500">{stu.roll_number || '-'}</td>
                    <td className="p-3 font-bold text-slate-900">{stu.name}</td>
                    <td className="p-3 font-mono text-xs text-slate-500">{stu.student_id_code}</td>
                    <td className="p-3 text-center font-bold text-emerald-700">
                      {stu.submitted_days.length > 0 ? `दिवस ${stu.submitted_days.join(', ')}` : '-'}
                    </td>
                    <td className="p-3 text-center">
                      {stu.missing_days.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                          दिवस {stu.missing_days.join(', ')}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">पूर्ण</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-black text-emerald-700">
                      {stu.assessment_counts.achieved}
                    </td>
                    <td className="p-3 text-center font-black text-amber-700">
                      {stu.assessment_counts.developing}
                    </td>
                    <td className="p-3 text-center font-black text-blue-700">
                      {stu.assessment_counts.needs_support}
                    </td>
                    <td className="p-3 text-xs">
                      {stu.may_need_support ? (
                        <span className="font-semibold text-amber-800">
                          अतिरिक्त व्यावहारिक मार्गदर्शन
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-800">
                          अग्रिम परियोजना के लिए तैयार
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
