import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api.js';
import { idbStorage } from '../utils/idbStorage.js';

export interface AuthUser {
  id: string;
  role: 'student' | 'teacher' | 'school_admin' | 'platform_admin';
  name: string;
  student_id_code?: string;
  email?: string;
  school_id: string;
  school_name?: string;
  class_id?: string;
  class_name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginStudent: (studentIdCode: string, pin: string, schoolId?: string) => Promise<{ success: boolean; message?: string; lockoutSeconds?: number }>;
  loginStaff: (email: string, pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: (clearLocalStudentData?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('shikshasetu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('shikshasetu_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check session validity on startup with safety timeout to prevent hanging on offline mobile devices
    const verifySession = async () => {
      if (token) {
        try {
          const timeoutPromise = new Promise<{ ok: boolean; status: number }>((resolve) =>
            setTimeout(() => resolve({ ok: false, status: 0 }), 1500)
          );
          const res = await Promise.race([
            apiRequest('/auth/me', 'GET', undefined, token),
            timeoutPromise
          ]);
          if (res.ok && (res as any).data) {
            const updatedUser: AuthUser = {
              ...(res as any).data.user,
              school_name: (res as any).data.school?.name,
            };
            setUser(updatedUser);
            localStorage.setItem('shikshasetu_user', JSON.stringify(updatedUser));
          } else if (res.status === 401) {
            // Token expired
            logout(false);
          }
        } catch {
          // Keep existing cached user on network failure
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  const loginStudent = async (studentIdCode: string, pin: string, schoolId?: string) => {
    const res = await apiRequest('/auth/student-login', 'POST', {
      student_id_code: studentIdCode,
      pin,
      school_id: schoolId,
    });

    if (res.ok && res.data) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('shikshasetu_token', newToken);
      localStorage.setItem('shikshasetu_user', JSON.stringify(userData));
      return { success: true };
    }

    // Offline / Demo Fallback for schools with limited/no connectivity
    const cleanId = studentIdCode.trim().toUpperCase();
    const DEMO_STUDENTS: Record<string, { id: string; name: string; class_id: string; class_name: string }> = {
      'STU-1001': { id: 'stu-aarav-01', name: 'आरव कुमार (Aarav Kumar)', class_id: 'cls-6a', class_name: 'कक्षा 6-A' },
      'STU-1002': { id: 'stu-priya-02', name: 'प्रिया शर्मा (Priya Sharma)', class_id: 'cls-6a', class_name: 'कक्षा 6-A' },
      'STU-1003': { id: 'stu-rohan-03', name: 'रोहन पटेल (Rohan Patel)', class_id: 'cls-6b', class_name: 'कक्षा 6-B' },
    };

    if ((!res.ok && (res.status === 0 || !navigator.onLine)) || res.error === 'NetworkError') {
      const student = DEMO_STUDENTS[cleanId];
      if (student && pin.trim() === '4321') {
        const offlineUser: AuthUser = {
          id: student.id,
          role: 'student',
          name: student.name,
          student_id_code: cleanId,
          school_id: 'sch-pilot-01',
          school_name: 'राजकीय माध्यमिक विद्यालय, ब्लॉक-२ (Govt Middle School)',
          class_id: student.class_id,
          class_name: student.class_name
        };
        const offlineToken = 'offline-demo-token-' + student.id;
        setToken(offlineToken);
        setUser(offlineUser);
        localStorage.setItem('shikshasetu_token', offlineToken);
        localStorage.setItem('shikshasetu_user', JSON.stringify(offlineUser));
        return { success: true };
      }
    }

    return {
      success: false,
      message: res.message || 'Invalid Student ID or PIN',
      lockoutSeconds: res.lockoutSeconds,
    };
  };

  const loginStaff = async (email: string, pin: string) => {
    const res = await apiRequest('/auth/staff-login', 'POST', { email, pin });

    if (res.ok && res.data) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('shikshasetu_token', newToken);
      localStorage.setItem('shikshasetu_user', JSON.stringify(userData));
      return { success: true };
    }

    // Offline / Demo Fallback for teachers in offline classrooms
    const cleanEmail = email.trim().toLowerCase();
    if ((!res.ok && (res.status === 0 || !navigator.onLine)) || res.error === 'NetworkError') {
      if (cleanEmail === 'teacher@shikshasetu.org' && pin.trim() === '9876') {
        const offlineTeacher: AuthUser = {
          id: 'tch-sunita-01',
          role: 'teacher',
          name: 'सुनीता शर्मा (Sunita Sharma)',
          email: 'teacher@shikshasetu.org',
          school_id: 'sch-pilot-01',
          school_name: 'राजकीय माध्यमिक विद्यालय, ब्लॉक-२ (Govt Middle School)'
        };
        const offlineToken = 'offline-demo-token-teacher';
        setToken(offlineToken);
        setUser(offlineTeacher);
        localStorage.setItem('shikshasetu_token', offlineToken);
        localStorage.setItem('shikshasetu_user', JSON.stringify(offlineTeacher));
        return { success: true };
      }
    }

    return {
      success: false,
      message: res.message || 'Invalid email or PIN',
    };
  };

  const logout = async (clearLocalStudentData = true) => {
    if (clearLocalStudentData) {
      // Clear drafts and sensitive cached keys from shared device
      await idbStorage.clearStudentTemporaryData().catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('shikshasetu_token');
    localStorage.removeItem('shikshasetu_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginStudent,
        loginStaff,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
