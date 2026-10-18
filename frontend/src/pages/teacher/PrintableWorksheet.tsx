import React, { useState } from 'react';
import { Printer, ArrowLeft, Droplet } from 'lucide-react';

interface PrintableWorksheetProps {
  onBack: () => void;
}

export const PrintableWorksheet: React.FC<PrintableWorksheetProps> = ({ onBack }) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Non-printed Controls */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>वापस लौटें</span>
        </button>

        {/* Day selection */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedDay === d
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              दिवस {d}
            </button>
          ))}
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>प्रिंट करें (Print / PDF)</span>
        </button>
      </div>

      {/* Printable Sheet (Formatted for standard A4 paper) */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-md border-2 border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 font-sans">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-extrabold text-lg uppercase tracking-wider text-slate-800">
              शिक्षासेतु (ShikshaSetu)
            </span>
            <span className="text-xs font-bold px-2 py-0.5 border border-slate-800 rounded">
              कक्षा 6
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            अवलोकन कार्यपत्रक (Observation Worksheet)
          </h1>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">
            परियोजना: जल संरक्षण — समझें डेटा, बचाएं जल (Save Water, Understand Data)
          </p>
        </div>

        {/* Student metadata fields (for handwriting) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-300 mb-6 text-xs font-bold">
          <div>
            <span className="text-slate-500 block text-[10px]">विद्यार्थी का नाम:</span>
            <div className="border-b border-dotted border-slate-400 h-6"></div>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">अनुक्रमांक (Roll No.):</span>
            <div className="border-b border-dotted border-slate-400 h-6"></div>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">कक्षा एवं वर्ग:</span>
            <span className="text-slate-800 font-bold">कक्षा 6-अ</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">दिनांक (Date):</span>
            <div className="border-b border-dotted border-slate-400 h-6"></div>
          </div>
        </div>

        {/* DAY 1 PRINTABLE */}
        {selectedDay === 1 && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h2 className="text-sm font-black text-slate-900">
                दिवस 1: पानी के उपयोग का निरीक्षण और व्यर्थ बहाव की पहचान
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                उद्देश्य: स्वच्छ जल का महत्व समझें और दैनिक जीवन में पानी की बर्बादी के सामान्य कारणों की पहचान करें।
              </p>
            </div>

            <div className="space-y-5 text-xs sm:text-sm">
              <div>
                <p className="font-bold mb-2">
                  1. दैनिक जीवन में घर या विद्यालय में पानी के दो मुख्य उपयोग बताएं:
                </p>
                <div className="border-b border-slate-300 h-8"></div>
                <div className="border-b border-slate-300 h-8"></div>
              </div>

              <div>
                <p className="font-bold mb-2">
                  2. आपने विद्यालय या आसपास पानी की बर्बादी या रिसाव कहाँ देखा या अनुमान लगाया?
                </p>
                <div className="border border-slate-300 rounded-lg h-24 p-2 text-slate-400 text-xs italic">
                  (यहाँ अपना अवलोकन या अनुमान लिखें...)
                </div>
              </div>

              <div>
                <p className="font-bold mb-2">
                  3. पानी की बर्बादी तुरंत रोकने के दो व्यावहारिक तरीके क्या हो सकते हैं?
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">(क)</span>
                    <div className="border-b border-slate-300 w-full h-7"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">(ख)</span>
                    <div className="border-b border-slate-300 w-full h-7"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DAY 2 PRINTABLE */}
        {selectedDay === 2 && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h2 className="text-sm font-black text-slate-900">
                दिवस 2: डेटा संग्रह और समझ (Data Collection & Tally)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                उद्देश्य: अवलोकनों को तालिका में लिखें और दिए गए डेटा से बार चार्ट बनाएं।
              </p>
            </div>

            {/* Observation Table */}
            <div>
              <p className="text-xs font-bold mb-2">
                सारणी: पानी के अनावश्यक बहाव के देखे गए उदाहरण (तालिका भरें):
              </p>
              <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="border border-slate-400 p-2">गतिविधि / समस्या</th>
                    <th className="border border-slate-400 p-2 text-center w-28">गणना (Tally)</th>
                    <th className="border border-slate-400 p-2 text-center w-28">कुल संख्या (Count)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-400 p-2">टपकता नल (Leaking tap)</td>
                    <td className="border border-slate-400 p-2"></td>
                    <td className="border border-slate-400 p-2 text-center font-bold">3</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-2">खुला छोड़ा गया नल (Tap left running)</td>
                    <td className="border border-slate-400 p-2"></td>
                    <td className="border border-slate-400 p-2 text-center font-bold">5</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-2">अनावश्यक ओवरफ्लो (Unnecessary overflow)</td>
                    <td className="border border-slate-400 p-2"></td>
                    <td className="border border-slate-400 p-2 text-center font-bold">2</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bar Chart Drawing Grid */}
            <div>
              <p className="text-xs font-bold mb-1">
                नीचे दिए गए ग्रिड में बार चार्ट (स्तंभ आरेख) बनाएं:
              </p>
              <div className="border-2 border-slate-400 rounded-lg h-36 bg-slate-50/50 p-2 flex flex-col justify-end">
                <div className="border-b-2 border-l-2 border-slate-700 h-28 flex items-end justify-around px-4">
                  <span className="text-[10px] font-bold text-slate-600">टपकता नल</span>
                  <span className="text-[10px] font-bold text-slate-600">खुला नल</span>
                  <span className="text-[10px] font-bold text-slate-600">ओवरफ्लो</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold mb-1">
                निष्कर्ष: इस डेटा के अनुसार सबसे अधिक पानी की बर्बादी किस कारण से हुई और क्यों?
              </p>
              <div className="border-b border-slate-300 h-7"></div>
              <div className="border-b border-slate-300 h-7"></div>
            </div>
          </div>
        )}

        {/* DAY 3 PRINTABLE */}
        {selectedDay === 3 && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h2 className="text-sm font-black text-slate-900">
                दिवस 3: व्यावहारिक समाधान और समूह प्रस्तुति
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                उद्देश्य: एकत्रित डेटा पर आधारित पानी बचाने के दो ठोस सुझाव लिखें।
              </p>
            </div>

            <div className="space-y-5 text-xs sm:text-sm">
              <div>
                <p className="font-bold mb-1">
                  1. व्यावहारिक सुझाव 1 (Practical Recommendation 1):
                </p>
                <div className="border border-slate-300 rounded-lg h-16 p-2"></div>
              </div>

              <div>
                <p className="font-bold mb-1">
                  2. व्यावहारिक सुझाव 2 (Practical Recommendation 2):
                </p>
                <div className="border border-slate-300 rounded-lg h-16 p-2"></div>
              </div>

              <div>
                <p className="font-bold mb-1">
                  3. आपका यह सुझाव दिवस 2 के आंकड़ों से कैसे सीधे संबंधित है?
                </p>
                <div className="border border-slate-300 rounded-lg h-20 p-2"></div>
              </div>
            </div>
          </div>
        )}

        {/* Teacher Evaluation & Signature Footer */}
        <div className="mt-8 pt-4 border-t-2 border-slate-300 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold block mb-1">शिक्षक मूल्यांकन (Teacher Rubric):</span>
            <div className="flex items-center gap-3">
              <span className="border border-slate-400 px-2 py-0.5 rounded text-[11px]">
                [ ] स्वतंत्र प्राप्त
              </span>
              <span className="border border-slate-400 px-2 py-0.5 rounded text-[11px]">
                [ ] विकासशील
              </span>
              <span className="border border-slate-400 px-2 py-0.5 rounded text-[11px]">
                [ ] सहायता आवश्यक
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[10px]">शिक्षक हस्ताक्षर:</span>
            <div className="border-b border-slate-400 w-36 ml-auto h-6 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
