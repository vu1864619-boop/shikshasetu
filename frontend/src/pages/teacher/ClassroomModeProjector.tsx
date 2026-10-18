import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { apiRequest } from '../../utils/api.js';
import { 
  Tv, 
  ArrowLeft, 
  Users, 
  Printer, 
  CheckCircle, 
  Send, 
  Maximize2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ClassroomModeProjectorProps {
  onBack: () => void;
  onOpenPrintWorksheet: () => void;
}

export const ClassroomModeProjector: React.FC<ClassroomModeProjectorProps> = ({ onBack, onOpenPrintWorksheet }) => {
  const { language } = useLanguage();

  const [activeDay, setActiveDay] = useState<number>(1);
  const [selectedGroup, setSelectedGroup] = useState<string>('समूह 1 (गंगा)');
  const [groupAnswer1, setGroupAnswer1] = useState('');
  const [groupAnswer2, setGroupAnswer2] = useState('');
  const [groupAnswer3, setGroupAnswer3] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const groups = [
    { name: 'समूह 1 (गंगा)', students: 'आरव, रोहन, मोहन' },
    { name: 'समूह 2 (यमुना)', students: 'प्रिया, सुनीता, काव्या' },
    { name: 'समूह 3 (सरस्वती)', students: 'अमन, राहुल, दीपक' },
    { name: 'समूह 4 (नर्मदा)', students: 'पूजा, नेहा, अंजलि' },
  ];

  const handleRecordGroupWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessBanner(null);

    const answers = {
      recorded_by: 'Teacher Projector Session',
      group_name: selectedGroup,
      answer_1: groupAnswer1,
      answer_2: groupAnswer2,
      answer_3: groupAnswer3,
    };

    const res = await apiRequest('/submissions', 'POST', {
      project_id: 'proj-water-01',
      activity_id: `act-water-d${activeDay}`,
      day_number: activeDay,
      class_id: 'cls-rampur-6a',
      student_id: 'usr-student-01', // Anchored to representative or class
      submission_type: 'paper_recorded_by_teacher',
      group_name: selectedGroup,
      answers,
      client_idempotency_key: `teacher-group-${selectedGroup}-d${activeDay}-${Date.now()}`
    });

    setIsSubmitting(false);

    if (res.ok) {
      setSuccessBanner(`${selectedGroup} का दिवस ${activeDay} का कार्य सफलतापूर्वक दर्ज हुआ!`);
      setGroupAnswer1('');
      setGroupAnswer2('');
      setGroupAnswer3('');
      setTimeout(() => setSuccessBanner(null), 4000);
    } else {
      alert(res.message || 'त्रुटि आई');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>शिक्षक नियंत्रण कक्ष पर वापस</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPrintWorksheet}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-brand-600" />
            <span>कार्यपत्रक प्रिंट करें (Print Worksheets)</span>
          </button>

          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            📺 कक्षा प्रोजेक्टर स्क्रीन
          </span>
        </div>
      </div>

      {/* Main Projector Screen (High Contrast, Large Typography) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-500/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              कक्षा 6 • विज्ञान एवं पर्यावरण परियोजना
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
              जल संरक्षण: समझें डेटा, बचाएं जल
            </h1>
          </div>

          {/* Project Day Selectors */}
          <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl">
            {[1, 2, 3].map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition ${
                  activeDay === day
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                दिवस {day}
              </button>
            ))}
          </div>
        </div>

        {/* Day 1 Whole-Class Projector Instructions */}
        {activeDay === 1 && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 mb-2">
                दिवस 1: पानी के उपयोग का निरीक्षण और व्यर्थ बहाव की पहचान
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                सीखने का उद्देश्य: स्वच्छ जल के महत्व को समझें और पहचानें कि हमारे आसपास पानी कहाँ और क्यों व्यर्थ बहता है।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
                <span className="text-xs font-bold text-amber-400">प्रश्न 1 (चर्चा करें)</span>
                <p className="text-base font-bold text-white mt-2">
                  दैनिक जीवन में घर या विद्यालय में पानी के दो सबसे बड़े उपयोग कहाँ होते हैं?
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
                <span className="text-xs font-bold text-amber-400">प्रश्न 2 (पहचानें)</span>
                <p className="text-base font-bold text-white mt-2">
                  विद्यालय परिसर या आसपास पानी की बर्बादी का कोई एक स्थान बताएं?
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
                <span className="text-xs font-bold text-amber-400">प्रश्न 3 (समाधान)</span>
                <p className="text-base font-bold text-white mt-2">
                  इस बर्बादी को तुरंत रोकने के लिए आप क्या कदम उठा सकते हैं?
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Day 2 Whole-Class Projector Instructions */}
        {activeDay === 2 && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 mb-2">
                दिवस 2: डेटा संग्रह और समझ (Data Collection & Tally)
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                कक्षा में नीचे दिए गए उदाहरण डेटा को देखें और अपने समूह के साथ बार चार्ट बनाएं।
              </p>
            </div>

            {/* Big Projector Data Table */}
            <div className="bg-slate-800 rounded-2xl p-4 overflow-x-auto border border-slate-700">
              <table className="w-full text-left text-sm sm:text-lg">
                <thead className="text-amber-400 border-b border-slate-700">
                  <tr>
                    <th className="p-3">कारण (Waste Category)</th>
                    <th className="p-3 text-center">संख्या (Count)</th>
                    <th className="p-3">बार चार्ट प्रतिनिधित्व</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  <tr>
                    <td className="p-3 font-bold text-white">टपकता नल (Leaking tap)</td>
                    <td className="p-3 text-center text-xl font-black text-amber-400">3</td>
                    <td className="p-3">
                      <div className="bg-amber-500 h-6 rounded-lg w-[40%] flex items-center px-2 text-xs font-black text-slate-950">
                        3 नल
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">खुला छोड़ा गया नल (Tap left running)</td>
                    <td className="p-3 text-center text-xl font-black text-red-400">5</td>
                    <td className="p-3">
                      <div className="bg-red-500 h-6 rounded-lg w-[70%] flex items-center px-2 text-xs font-black text-slate-950">
                        5 नल (सबसे अधिक)
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">टंकी का ओवरफ्लो (Unnecessary overflow)</td>
                    <td className="p-3 text-center text-xl font-black text-blue-400">2</td>
                    <td className="p-3">
                      <div className="bg-blue-500 h-6 rounded-lg w-[30%] flex items-center px-2 text-xs font-black text-slate-950">
                        2 टंकी
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-slate-800 text-xs sm:text-sm text-slate-300">
              💡 समूह कार्य: सभी छात्र अपनी नोटबुक में इस तालिका को बनाएं और बार चार्ट खींचें।
            </div>
          </div>
        )}

        {/* Day 3 Whole-Class Projector Instructions */}
        {activeDay === 3 && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 mb-2">
                दिवस 3: व्यावहारिक समाधान और समूह प्रस्तुति
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                प्रत्येक समूह दिवस 2 के आंकड़ों के आधार पर पानी बचाने के 2 व्यावहारिक उपाय प्रस्तुत करेगा।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-800">
                <span className="text-xs font-bold text-emerald-400">कार्य 1</span>
                <p className="text-lg font-bold text-white mt-2">
                  दो व्यावहारिक जल-बचत सुझाव तैयार करें जिन्हें छात्र स्वयं या शिक्षक के साथ लागू कर सकें।
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-800">
                <span className="text-xs font-bold text-emerald-400">कार्य 2</span>
                <p className="text-lg font-bold text-white mt-2">
                  स्पष्ट करें कि आपके सुझाव दिवस 2 की सबसे बड़ी समस्या (खुला छोड़ा गया नल) को कैसे हल करते हैं।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Group Recording Form (When students use paper / no personal phones) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              समूह सहभागिता दर्ज करें (Record Group Work on Single Device)
            </h2>
            <p className="text-xs text-slate-500">
              छात्रों के हाथ से लिखे कार्यपत्रकों या कक्षा प्रस्तुतियों के परिणाम शिक्षक सीधे यहाँ दर्ज कर सकते हैं।
            </p>
          </div>
        </div>

        {successBanner && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        <form onSubmit={handleRecordGroupWork} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                प्रस्तुतकर्ता समूह चुनें (Select Group)
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
              >
                {groups.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name} — {g.students}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                सक्रिय परियोजना दिवस
              </label>
              <div className="p-2.5 bg-slate-100 rounded-xl text-sm font-bold text-slate-800">
                दिवस {activeDay}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              समूह का मुख्य अवलोकन / समाधान (Key Finding or Solution)
            </label>
            <textarea
              required
              rows={2}
              value={groupAnswer1}
              onChange={(e) => setGroupAnswer1(e.target.value)}
              placeholder="समूह द्वारा प्रस्तुत मुख्य बिंदु यहाँ लिखें..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'दर्ज हो रहा है...' : 'समूह परिणाम दर्ज करें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
