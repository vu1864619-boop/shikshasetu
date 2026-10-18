import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { apiRequest } from '../../utils/api.js';
import { ArrowLeft, Award, CheckCircle2, Clock, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';

interface MyProgressProps {
  onBack: () => void;
}

export const MyProgress: React.FC<MyProgressProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const res = await apiRequest('/assessments/my-progress');
      if (res.ok && res.data) {
        setSubmissions(res.data.submissions || []);
        setAssessments(res.data.assessments || []);
      }
      setIsLoading(false);
    };
    fetchProgress();
  }, []);

  const getRubricBadge = (rubric: string) => {
    if (rubric === 'achieved') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
          ✓ {t('rubricAchieved')}
        </span>
      );
    }
    if (rubric === 'developing') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
          ⚡ {t('rubricDeveloping')}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
        🤝 {t('rubricNeedsSupport')}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'डैशबोर्ड पर वापस' : 'Back to Dashboard'}</span>
        </button>

        <span className="text-xs font-bold text-slate-500">
          {user?.name} ({user?.student_id_code})
        </span>
      </div>

      {/* Progress Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('myProgress')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'hi'
                ? 'सीखने के परिणामों पर आधारित मूल्यांकन एवं शिक्षक का मार्गदर्शन'
                : 'Outcome-based assessment and personalized teacher feedback'}
            </p>
          </div>
        </div>

        {/* Counts summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xl font-black text-slate-900">{submissions.length}</span>
            <p className="text-xs font-bold text-slate-500 mt-0.5">जमा किए गए कार्यपत्रक</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-2xl font-black text-emerald-700">
              {assessments.filter((a) => a.rubric === 'achieved').length}
            </span>
            <p className="text-xs font-bold text-emerald-800 mt-0.5">स्वतंत्र रूप से प्राप्त</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center col-span-2 sm:col-span-1">
            <span className="text-2xl font-black text-amber-700">
              {assessments.filter((a) => a.rubric === 'developing').length}
            </span>
            <p className="text-xs font-bold text-amber-800 mt-0.5">विकासशील / सीखने में अग्रसर</p>
          </div>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <span>
            {language === 'hi'
              ? 'गोपनीयता सुरक्षा: आपकी सीखने की प्रगति केवल आपके और आपके अधिकृत शिक्षक के लिए दृश्यमान है। किसी भी सार्वजनिक रैंकिंग का उपयोग नहीं किया जाता।'
              : 'Privacy Protected: Your progress is strictly visible only to you and your authorized teacher. No public rankings are made.'}
          </span>
        </div>
      </div>

      {/* Assessments Detail List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-600" />
          <span>{t('teacherFeedback')}</span>
        </h2>

        {isLoading ? (
          <p className="text-sm text-slate-500 py-4 text-center">प्रगति लोड हो रही है...</p>
        ) : assessments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            अभी तक कोई मूल्यांकन दर्ज नहीं हुआ है। कार्यपत्रक जमा करें, शिक्षक जल्द ही समीक्षा करेंगे।
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((asm) => (
              <div
                key={asm.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-brand-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {asm.objective_code}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {language === 'hi' ? asm.objective_title_hi : asm.objective_title_en}
                    </h3>
                  </div>
                  <div>{getRubricBadge(asm.rubric)}</div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    "{asm.constructive_comment}"
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    शिक्षक: {asm.teacher_name} •{' '}
                    {new Date(asm.evaluated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
