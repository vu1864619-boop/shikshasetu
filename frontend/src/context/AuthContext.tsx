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
    // Check session validity on startup
    const verifySession = async () => {
      if (token) {
        const res = await apiRequest('/auth/me', 'GET', undefined, token);
        if (res.ok && res.data) {
          const updatedUser: AuthUser = {
            ...res.data.user,
            school_name: res.data.school?.name,
          };
          setUser(updatedUser);
          localStorage.setItem('shikshasetu_user', JSON.stringify(updatedUser));
        } else if (res.status === 401) {
          // Token expired
          logout(false);
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
