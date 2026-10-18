import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { apiRequest } from '../../utils/api.js';
import { 
  Users, 
  ArrowLeft, 
  KeyRound, 
  UserPlus, 
  PlusCircle, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  Lock
} from 'lucide-react';

interface ClassroomManagementProps {
  onBack: () => void;
}

export const ClassroomManagement: React.FC<ClassroomManagementProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showEnrollStudent, setShowEnrollStudent] = useState(false);
  const [showPinReset, setShowPinReset] = useState(false);
  const [pinResetTarget, setPinResetTarget] = useState<any>(null);
  const [newPin, setNewPin] = useState('');
  const [pinResetSuccess, setPinResetSuccess] = useState<string | null>(null);

  // New Class Form
  const [className, setClassName] = useState('कक्षा 6-ब (Class 6-B)');
  const [gradeLevel, setGradeLevel] = useState(6);
  const [section, setSection] = useState('B');

  // Enroll Student Form
  const [studentName, setStudentName] = useState('');
  const [studentIdCode, setStudentIdCode] = useState('');
  const [initialPin, setInitialPin] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  const loadClassData = async () => {
    setIsLoading(true);
    const clsRes = await apiRequest('/classes');
    if (clsRes.ok && clsRes.data && clsRes.data.classes.length > 0) {
      setClasses(clsRes.data.classes);
      const activeId = selectedClassId || clsRes.data.classes[0].id;
      setSelectedClassId(activeId);

      const stuRes = await apiRequest(`/classes/${activeId}`);
      if (stuRes.ok && stuRes.data) {
        setStudents(stuRes.data.students || []);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadClassData();
  }, [selectedClassId]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/classes', 'POST', {
      name: className,
      grade_level: gradeLevel,
      section,
      academic_year: '2026-27'
    });

    if (res.ok) {
      setShowCreateClass(false);
      loadClassData();
    } else {
      alert(res.message || 'कक्षा बनाने में त्रुटि आई।');
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentIdCode || !initialPin) return;

    const res = await apiRequest(`/classes/${selectedClassId}/enroll-student`, 'POST', {
      name: studentName,
      student_id_code: studentIdCode,
      initial_pin: initialPin,
      roll_number: rollNumber
    });

    if (res.ok) {
      setShowEnrollStudent(false);
      setStudentName('');
      setStudentIdCode('');
      setInitialPin('');
      setRollNumber('');
      loadClassData();
    } else {
      alert(res.message || 'नामांकन में त्रुटि आई।');
    }
  };

  const handleExecutePinReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinResetTarget || !newPin) return;

    const res = await apiRequest('/auth/reset-pin', 'POST', {
      student_id: pinResetTarget.id,
      new_pin: newPin
    });

    if (res.ok) {
      setPinResetSuccess(`पिन सफलतापूर्वक रीसेट हुआ (${pinResetTarget.name})!`);
      setNewPin('');
      setTimeout(() => {
        setPinResetSuccess(null);
        setShowPinReset(false);
        setPinResetTarget(null);
      }, 2500);
    } else {
      alert(res.message || 'पिन रीसेट विफल रहा।');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>नियंत्रण कक्ष पर वापस</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEnrollStudent(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ विद्यार्थी नामांकित करें</span>
          </button>

          <button
            onClick={() => setShowCreateClass(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ नई कक्षा जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Class Selector & Roster */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              कक्षा एवं विद्यार्थी प्रबंधन
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              अधिकृत विद्यार्थी पहचान, सुरक्षित पिन रीसेट और उपस्थिति रोस्टर
            </p>
          </div>

          {/* Class Select Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">कक्षा चुनें:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (कोड: {cls.join_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Security & Isolation Notice */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            सुरक्षा एवं अलगाव: आप केवल अपने अधिकृत विद्यालय (
            <strong>{user?.school_name}</strong>) के विद्यार्थियों और कक्षाओं का प्रबंधन कर रहे हैं।
            छात्र पिन हमेशा सर्वर पर साल्टेड हैश के रूप में सुरक्षित रहते हैं।
          </span>
        </div>

        {/* Student Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b">
              <tr>
                <th className="p-3">अनुक्रमांक</th>
                <th className="p-3">विद्यार्थी का नाम</th>
                <th className="p-3">छात्र आईडी (Student ID)</th>
                <th className="p-3">कुल जमा कार्य</th>
                <th className="p-3 text-right">सुरक्षा कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-semibold text-slate-500">{stu.roll_number || '-'}</td>
                  <td className="p-3 font-bold text-slate-900">{stu.name}</td>
                  <td className="p-3 font-mono text-xs font-bold text-brand-700 bg-brand-50/50 px-2 py-0.5 rounded w-fit">
                    {stu.student_id_code}
                  </td>
                  <td className="p-3 font-semibold text-slate-700">
                    {stu.total_submissions} कार्यपत्रक
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setPinResetTarget(stu);
                        setShowPinReset(true);
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      <span>पिन रीसेट (Reset PIN)</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PIN RESET MODAL */}
      {showPinReset && pinResetTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">शिक्षक-अधिकृत पिन रीसेट</h3>
                <p className="text-xs text-slate-500">{pinResetTarget.name} ({pinResetTarget.student_id_code})</p>
              </div>
            </div>

            {pinResetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{pinResetSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleExecutePinReset} className="space-y-4">
                <p className="text-xs text-slate-600">
                  यदि छात्र अपना पिन भूल गया है या बार-बार गलत पिन के कारण खाता लॉक हो गया है, तो नया 4-अंकीय पिन दर्ज करें।
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    नया पिन (4-6 अंक)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="उदा. 4321"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold tracking-widest text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinReset(false);
                      setPinResetTarget(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition"
                  >
                    पिन अपडेट करें
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE CLASS MODAL */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-4">नई कक्षा जोड़ें</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">कक्षा का नाम</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">कक्षा स्तर (Grade)</label>
                  <input
                    type="number"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">वर्ग (Section)</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClass(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow"
                >
                  कक्षा बनाएं
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL STUDENT MODAL */}
      {showEnrollStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-4">नया विद्यार्थी नामांकित करें</h3>
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विद्यार्थी का नाम</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="उदा. राहुल कुमार"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">छात्र आईडी (Student ID)</label>
                  <input
                    type="text"
                    required
                    value={studentIdCode}
                    onChange={(e) => setStudentIdCode(e.target.value.toUpperCase())}
                    placeholder="उदा. STU-1004"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">अनुक्रमांक (Roll No.)</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="उदा. 04"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">प्रारंभिक सुरक्षा पिन</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={initialPin}
                  onChange={(e) => setInitialPin(e.target.value)}
                  placeholder="उदा. 4321"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-widest"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollStudent(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow"
                >
                  नामांकित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
