import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { apiRequest } from '../../utils/api.js';
import { 
  ClipboardCheck, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  Send, 
  User, 
  Award,
  Sparkles
} from 'lucide-react';

interface SubmissionReviewProps {
  onBack: () => void;
}

export const SubmissionReview: React.FC<SubmissionReviewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, { rubric: string; comment: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [transparentRec, setTransparentRec] = useState<string | null>(null);

  const loadSubmissions = async () => {
    const res = await apiRequest('/submissions');
    if (res.ok && res.data) {
      setSubmissions(res.data.submissions || []);
      if (res.data.submissions.length > 0 && !selectedSub) {
        selectSubmission(res.data.submissions[0]);
      }
    }
  };

  const selectSubmission = async (sub: any) => {
    setSelectedSub(sub);
    setFeedbackSuccess(null);
    setTransparentRec(null);

    // Fetch objectives for this project day
    const projRes = await apiRequest(`/projects/${sub.project_id}/activities/${sub.day_number}`);
    if (projRes.ok && projRes.data) {
      const objs = projRes.data.objectives || [];
      setObjectives(objs);

      // Pre-fill existing evaluation if any
      const initEval: Record<string, { rubric: string; comment: string }> = {};
      objs.forEach((o: any) => {
        initEval[o.id] = { rubric: 'achieved', comment: 'बहुत अच्छा और व्यावहारिक कार्य।' };
      });
      setEvaluations(initEval);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setIsSubmitting(true);
    setFeedbackSuccess(null);

    const evalPayload = Object.entries(evaluations).map(([objId, val]) => ({
      objective_id: objId,
      rubric: val.rubric,
      constructive_comment: val.comment
    }));

    const res = await apiRequest('/assessments', 'POST', {
      submission_id: selectedSub.id,
      evaluations: evalPayload
    });

    setIsSubmitting(false);

    if (res.ok && res.data) {
      setFeedbackSuccess('मूल्यांकन सफलतापूर्वक दर्ज हुआ!');
      setTransparentRec(res.data.transparent_recommendation);
      loadSubmissions();
    } else {
      alert(res.message || 'मूल्यांकन दर्ज करने में विफल।');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>नियंत्रण कक्ष पर वापस</span>
        </button>

        <span className="text-xs font-black uppercase tracking-wider text-blue-700 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
          अधिगम परिणाम मूल्यांकन (Outcome-Based Assessment)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Submissions List */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider px-2">
            जमा किए गए कार्यपत्रक ({submissions.length})
          </h2>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {submissions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSubmission(s)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  selectedSub?.id === s.id
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{s.student_name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                    {s.student_id_code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>दिवस {s.day_number} कार्यपत्रक</span>
                  <span>{new Date(s.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Answers Display + Rubric Evaluation Form */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSub ? (
            <>
              {/* Student Answers Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {selectedSub.student_name} ({selectedSub.student_id_code})
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedSub.project_title_hi} • दिवस {selectedSub.day_number}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {selectedSub.submission_type === 'paper_recorded_by_teacher'
                      ? 'कागजी कार्यपत्रक (शिक्षक द्वारा दर्ज)'
                      : 'ऑनलाइन कार्यपत्रक'}
                  </span>
                </div>

                {/* Display Answers */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs sm:text-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    विद्यार्थी के उत्तर:
                  </span>
                  {selectedSub.answers && Object.entries(selectedSub.answers).map(([k, v]: [string, any]) => (
                    <div key={k} className="border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-700 block mb-0.5 capitalize">
                        {k.replace(/_/g, ' ')}:
                      </span>
                      <p className="text-slate-900 whitespace-pre-wrap font-medium">
                        {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rubric Evaluation Form */}
              <form onSubmit={handleAssessmentSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>3-स्तरीय अधिगम रूब्रिक मूल्यांकन (Learning Outcome Rubric)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    केवल रटने के बजाय अवधारणा की समझ, समस्या समाधान और सहभागिता का मूल्यांकन करें।
                  </p>
                </div>

                {feedbackSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{feedbackSuccess}</span>
                  </div>
                )}

                {/* Transparent recommendation notice */}
                {transparentRec && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-800">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>{t('nextRecommendation')}:</span>
                    </div>
                    <p className="font-semibold">{transparentRec}</p>
                  </div>
                )}

                {/* Objectives Evaluation Inputs */}
                <div className="space-y-4">
                  {objectives.map((obj) => (
                    <div key={obj.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {obj.code}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          {language === 'hi' ? obj.title_hi : obj.title_en}
                        </h4>
                      </div>

                      {/* 3-tier Rubric Radios */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label
                          className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center gap-2 ${
                            evaluations[obj.id]?.rubric === 'achieved'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`rubric-${obj.id}`}
                            checked={evaluations[obj.id]?.rubric === 'achieved'}
                            onChange={() =>
                              setEvaluations({
                                ...evaluations,
                                [obj.id]: { ...(evaluations[obj.id] || {}), rubric: 'achieved' },
                              })
                            }
                            className="text-emerald-600"
                          />
                          <span>स्वतंत्र रूप से प्राप्त (Achieved)</span>
                        </label>

                        <label
                          className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center gap-2 ${
                            evaluations[obj.id]?.rubric === 'developing'
                              ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`rubric-${obj.id}`}
                            checked={evaluations[obj.id]?.rubric === 'developing'}
                            onChange={() =>
                              setEvaluations({
                                ...evaluations,
                                [obj.id]: { ...(evaluations[obj.id] || {}), rubric: 'developing' },
                              })
                            }
                            className="text-amber-600"
                          />
                          <span>विकासशील (Developing)</span>
                        </label>

                        <label
                          className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center gap-2 ${
                            evaluations[obj.id]?.rubric === 'needs_support'
                              ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`rubric-${obj.id}`}
                            checked={evaluations[obj.id]?.rubric === 'needs_support'}
                            onChange={() =>
                              setEvaluations({
                                ...evaluations,
                                [obj.id]: { ...(evaluations[obj.id] || {}), rubric: 'needs_support' },
                              })
                            }
                            className="text-blue-600"
                          />
                          <span>सहायता आवश्यक (Needs Support)</span>
                        </label>
                      </div>

                      {/* Constructive Comment */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          रचनात्मक शिक्षक टिप्पणी (Constructive Comment):
                        </label>
                        <input
                          type="text"
                          value={evaluations[obj.id]?.comment || ''}
                          onChange={(e) =>
                            setEvaluations({
                              ...evaluations,
                              [obj.id]: { ...(evaluations[obj.id] || {}), comment: e.target.value },
                            })
                          }
                          placeholder="विद्यार्थी को प्रोत्साहित करने वाली रचनात्मक टिप्पणी लिखें..."
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'सहेजा जा रहा है...' : 'मूल्यांकन सहेजें एवं सिंक करें'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
              मूल्यांकन करने के लिए बाईं सूची से किसी कार्यपत्रक का चयन करें।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
