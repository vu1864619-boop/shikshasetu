import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useOfflineSync } from '../../context/OfflineSyncContext.js';
import { idbStorage } from '../../utils/idbStorage.js';
import { Droplet, ArrowLeft, CheckCircle, BarChart3, Save, Send, Sparkles, AlertCircle } from 'lucide-react';

interface WaterConservationProjectProps {
  onBack: () => void;
  initialDay?: number;
}

export const WaterConservationProject: React.FC<WaterConservationProjectProps> = ({ onBack, initialDay = 1 }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { saveSubmissionOffline, isOnline } = useOfflineSync();

  const [activeDay, setActiveDay] = useState<number>(initialDay);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Day 1 Form States
  const [day1Uses, setDay1Uses] = useState('');
  const [day1Waste, setDay1Waste] = useState('');
  const [day1Methods, setDay1Methods] = useState('');

  // Day 2 Form States (Sample Data + Interactive Tally)
  const [day2LeakingTap, setDay2LeakingTap] = useState('3');
  const [day2RunningTap, setDay2RunningTap] = useState('5');
  const [day2Overflow, setDay2Overflow] = useState('2');
  const [day2Highest, setDay2Highest] = useState('Tap left running');
  const [day2Explanation, setDay2Explanation] = useState('');

  // Day 3 Form States
  const [day3Rec1, setDay3Rec1] = useState('');
  const [day3Rec2, setDay3Rec2] = useState('');
  const [day3Connection, setDay3Connection] = useState('');

  // Load existing draft if present
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await idbStorage.getDraft(`water-proj-d${activeDay}`);
      if (draft) {
        if (activeDay === 1) {
          setDay1Uses(draft.water_uses || '');
          setDay1Waste(draft.observed_waste || '');
          setDay1Methods(draft.initial_methods || '');
        } else if (activeDay === 2) {
          setDay2LeakingTap(draft.leaking_tap || '3');
          setDay2RunningTap(draft.running_tap || '5');
          setDay2Overflow(draft.overflow || '2');
          setDay2Highest(draft.highest_issue || 'Tap left running');
          setDay2Explanation(draft.data_explanation || '');
        } else if (activeDay === 3) {
          setDay3Rec1(draft.recommendation_1 || '');
          setDay3Rec2(draft.recommendation_2 || '');
          setDay3Connection(draft.connection_to_data || '');
        }
      }
    };
    loadDraft();
  }, [activeDay]);

  const handleSaveDraft = async () => {
    let draftData: any = {};
    if (activeDay === 1) draftData = { water_uses: day1Uses, observed_waste: day1Waste, initial_methods: day1Methods };
    if (activeDay === 2) draftData = { leaking_tap: day2LeakingTap, running_tap: day2RunningTap, overflow: day2Overflow, highest_issue: day2Highest, data_explanation: day2Explanation };
    if (activeDay === 3) draftData = { recommendation_1: day3Rec1, recommendation_2: day3Rec2, connection_to_data: day3Connection };

    await idbStorage.saveDraft(`water-proj-d${activeDay}`, draftData);
    setSuccessMessage(language === 'hi' ? 'ड्राफ्ट स्थानीय रूप से सहेज लिया गया है।' : 'Draft saved locally.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    let answers: Record<string, any> = {};
    let activityId = 'act-water-d1';

    if (activeDay === 1) {
      activityId = 'act-water-d1';
      answers = {
        water_uses: day1Uses,
        observed_waste: day1Waste,
        initial_methods: day1Methods
      };
    } else if (activeDay === 2) {
      activityId = 'act-water-d2';
      answers = {
        table_data: {
          leaking_tap: parseInt(day2LeakingTap, 10) || 0,
          running_tap: parseInt(day2RunningTap, 10) || 0,
          overflow: parseInt(day2Overflow, 10) || 0
        },
        highest_issue: day2Highest,
        data_explanation: day2Explanation
      };
    } else if (activeDay === 3) {
      activityId = 'act-water-d3';
      answers = {
        recommendation_1: day3Rec1,
        recommendation_2: day3Rec2,
        connection_to_data: day3Connection
      };
    }

    try {
      // Offline-First save
      await saveSubmissionOffline({
        project_id: 'proj-water-01',
        activity_id: activityId,
        day_number: activeDay,
        class_id: user?.class_id || 'cls-rampur-6a',
        answers
      });

      // Clear draft upon successful submission
      await idbStorage.clearDraft(`water-proj-d${activeDay}`);

      setIsSubmitting(false);
      setSuccessMessage(
        isOnline
          ? (language === 'hi' ? 'कार्यपत्रक सफलतापूर्वक जमा हुआ और सर्वर पर सिंक हो गया!' : 'Worksheet successfully submitted and synced to server!')
          : (language === 'hi' ? 'कार्यपत्रक ऑफ़लाइन सुरक्षित सहेजा गया! इंटरनेट मिलने पर स्वतः सिंक हो जाएगा।' : 'Worksheet saved offline! It will sync automatically when online.')
      );
    } catch (err) {
      setIsSubmitting(false);
      alert('त्रुटि आई। कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back button & Project Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'परियोजना सूची पर वापस' : 'Back to Projects'}</span>
        </button>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
          {t('waterProjectGrade')}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('waterProjectTitle')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'hi'
                ? 'दैनिक जीवन में पानी की बचत और डेटा विश्लेषण का व्यावहारिक अनुभव'
                : 'Hands-on learning combining water conservation with basic data interpretation'}
            </p>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-6 p-1.5 bg-slate-100 rounded-2xl">
          {[1, 2, 3].map((day) => (
            <button
              key={day}
              onClick={() => { setActiveDay(day); setSuccessMessage(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                activeDay === day
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{language === 'hi' ? `दिवस ${day}` : `Day ${day}`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {/* Worksheet Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        {/* DAY 1 */}
        {activeDay === 1 && (
          <>
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">{t('day1Title')}</h2>
              <p className="text-xs text-slate-600 mt-1">{t('day1Objective')}</p>
              <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                💡 {language === 'hi'
                  ? 'सुरक्षा नियम: सटीक घरेलू माप या व्यक्तिगत जानकारी प्रकट करने की आवश्यकता नहीं है; सुरक्षित अनुमान व अवलोकन पर्याप्त हैं।'
                  : 'Safety rule: Disclosing private household information is not required. Safe estimates and everyday observations are encouraged.'}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('day1Q1')}</label>
                <input
                  type="text"
                  required
                  value={day1Uses}
                  onChange={(e) => setDay1Uses(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. पीने के लिए, कपड़े धोने में, पेड़-पौधों में' : 'e.g. Drinking, cooking, watering plants'}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('day1Q2')}</label>
                <textarea
                  required
                  rows={3}
                  value={day1Waste}
                  onChange={(e) => setDay1Waste(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. स्कूल के मैदान में खुला नल, वॉशबेसिन में टपकती टोटी' : 'e.g. Leaking washbasin tap, tap left open'}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('day1Q3')}</label>
                <textarea
                  required
                  rows={3}
                  value={day1Methods}
                  onChange={(e) => setDay1Methods(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. उपयोग के बाद नल कसकर बंद करना, रिसाव की जानकारी शिक्षक को देना' : 'e.g. Close taps tightly, report leaks immediately'}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </>
        )}

        {/* DAY 2 */}
        {activeDay === 2 && (
          <>
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">{t('day2Title')}</h2>
              <p className="text-xs text-slate-600 mt-1">{t('day2Objective')}</p>
              <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                📊 {t('day2SampleNotice')}
              </div>
            </div>

            {/* Interactive Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                {t('day2TableHeading')}
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">कारण (Waste Category)</th>
                      <th className="p-3 text-center">संख्या (Count)</th>
                      <th className="p-3">ग्राफ (Visual Bar Chart)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-medium">टपकता नल (Leaking tap)</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={day2LeakingTap}
                          onChange={(e) => setDay2LeakingTap(e.target.value)}
                          className="w-16 p-1 text-center font-bold bg-slate-50 border rounded-lg"
                        />
                      </td>
                      <td className="p-3">
                        <div className="w-full bg-slate-100 rounded-full h-3">
                          <div className="bg-amber-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (parseInt(day2LeakingTap, 10) || 0) * 15)}%` }}></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">खुला छोड़ा गया नल (Tap left running)</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={day2RunningTap}
                          onChange={(e) => setDay2RunningTap(e.target.value)}
                          className="w-16 p-1 text-center font-bold bg-slate-50 border rounded-lg"
                        />
                      </td>
                      <td className="p-3">
                        <div className="w-full bg-slate-100 rounded-full h-3">
                          <div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (parseInt(day2RunningTap, 10) || 0) * 15)}%` }}></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">अनावश्यक ओवरफ्लो (Unnecessary overflow)</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={day2Overflow}
                          onChange={(e) => setDay2Overflow(e.target.value)}
                          className="w-16 p-1 text-center font-bold bg-slate-50 border rounded-lg"
                        />
                      </td>
                      <td className="p-3">
                        <div className="w-full bg-slate-100 rounded-full h-3">
                          <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (parseInt(day2Overflow, 10) || 0) * 15)}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('day2Q1')}</label>
                <select
                  value={day2Highest}
                  onChange={(e) => setDay2Highest(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Tap left running">खुला छोड़ा गया नल (Tap left running - 5)</option>
                  <option value="Leaking tap">टपकता नल (Leaking tap - 3)</option>
                  <option value="Unnecessary overflow">अनावश्यक ओवरफ्लो (Unnecessary overflow - 2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('day2Q2')}</label>
                <textarea
                  required
                  rows={3}
                  value={day2Explanation}
                  onChange={(e) => setDay2Explanation(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. खुला नल सबसे अधिक देखा गया, जिसका अर्थ है कि लोग उपयोग के बाद नल बंद करना भूल जाते हैं।' : 'e.g. Running taps are the most frequent, showing that forgetfulness is our biggest source of waste.'}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </>
        )}

        {/* DAY 3 */}
        {activeDay === 3 && (
          <>
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">{t('day3Title')}</h2>
              <p className="text-xs text-slate-600 mt-1">{t('day3Objective')}</p>
              <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                💡 {language === 'hi'
                  ? 'सुरक्षा निर्देश: बच्चों को नलसाजी ठीक करने या बिजली के उपकरणों के पास जाने के लिए कभी न कहें। केवल सुरक्षित व व्यावहारिक सुझाव दें।'
                  : 'Safety note: Children must never attempt plumbing repairs or handle electrical equipment near water. Propose safe everyday actions.'}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('day3Q1')}</label>
                <input
                  type="text"
                  required
                  value={day3Rec1}
                  onChange={(e) => setDay3Rec1(e.target.value)}
                  placeholder={language === 'hi' ? 'सुझाव 1: हाथ या बर्तन धोते समय नल को खुला न छोड़ें, बाल्टी का उपयोग करें।' : 'Recommendation 1: Use a bucket instead of leaving running taps open.'}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('day3Q2')}</label>
                <input
                  type="text"
                  required
                  value={day3Rec2}
                  onChange={(e) => setDay3Rec2(e.target.value)}
                  placeholder={language === 'hi' ? 'सुझाव 2: किसी भी टपकते नल की सूचना तुरंत प्रधानाध्यापक या शिक्षक को दें।' : 'Recommendation 2: Immediately report leaking taps to a teacher.'}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">{t('day3Q3')}</label>
                <textarea
                  required
                  rows={3}
                  value={day3Connection}
                  onChange={(e) => setDay3Connection(e.target.value)}
                  placeholder={language === 'hi' ? 'समझाएं कि यह समाधान दिवस 2 के आंकड़ों (जैसे खुला नल) से कैसे सीधे संबंधित है...' : 'Explain how this directly addresses the highest waste problem identified on Day 2...'}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{t('saveDraftOfflineBtn')}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'जमा हो रहा है...' : t('submitAnswerBtn')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
