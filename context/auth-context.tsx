"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, type AuthResponse } from "@/services/api";

export interface UserStats {
  classesAttended?: number;
  totalClasses?: number;
  attendanceRate?: number;
  assignmentsCompleted?: number;
  assignmentsPending?: number;
  discussionsParticipated?: number;
  lastActive?: string;
  totalAnnouncements?: number;
  totalReminders?: number;
  totalSchedules?: number;
}

export interface EnrolledClass {
  _id?: string;
  name: string;
  grade: string;
  department?: string;
  section?: string;
}

export interface UpcomingDeadline {
  _id?: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "cr";
  section?: string; // ObjectId as string
  department?: string; // ObjectId as string
  year?: string; // ObjectId as string
  firstName: string;
  lastName: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  department: string; // This will be the department code
  year: string; // This will be the year value
  section: string; // This will be the section name
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  departmentName: string; // Full department name
  yearValue: string; // Year value
  sectionName: string; // Section name
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
  getUserStats: () => Promise<UserStats | null>;
  getEnrolledClasses: () => Promise<EnrolledClass[]>;
  getUpcomingDeadlines: () => Promise<UpcomingDeadline[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = () => {
      const storedUser = localStorage.getItem("classbuddy_user");
      const storedToken = localStorage.getItem("classbuddy_token");
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Invalid user data:", err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await loginUser({ email, password });
      if (!response._id) throw new Error("User ID is missing from response");

      const authUser: AuthUser = {
        id: response._id,
        name: response.name,
        email: response.email,
        role: response.role as "student" | "teacher" | "cr",
        section: response.section, // ObjectId as string
        department: response.department, // ObjectId as string
        year: response.year, // ObjectId as string
        firstName: response.name.split(" ")[0] || "",
        lastName: response.name.split(" ").slice(1).join(" ") || "",
      };

      setUser(authUser);
      localStorage.setItem("classbuddy_user", JSON.stringify(authUser));
      localStorage.setItem("classbuddy_token", response.token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: RegisterFormData) => {
    try {
      const registerData: RegisterData = {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        password: userData.password,
        role: userData.role,
        departmentName: getDepartmentName(userData.department),
        yearValue: userData.year,
        sectionName: userData.section,
      };

      const response: AuthResponse = await registerUser(registerData);
      if (!response._id) throw new Error("User ID is missing from response");

      const authUser: AuthUser = {
        id: response._id,
        name: response.name,
        email: response.email,
        role: response.role as "student" | "teacher" | "cr",
        section: response.section, // ObjectId as string
        department: response.department, // ObjectId as string
        year: response.year, // ObjectId as string
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      setUser(authUser);
      localStorage.setItem("classbuddy_user", JSON.stringify(authUser));
      localStorage.setItem("classbuddy_token", response.token);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("classbuddy_user");
    localStorage.removeItem("classbuddy_token");
  };

  // Profile data methods that can be called from profile page
  const getUserStats = async (): Promise<UserStats | null> => {
    try {
      const token = localStorage.getItem('classbuddy_token')
      if (!token) throw new Error('No token found')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return null
    }
  }

  const getEnrolledClasses = async (): Promise<EnrolledClass[]> => {
    try {
      const token = localStorage.getItem('classbuddy_token')
      if (!token) throw new Error('No token found')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/enrolled-classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      console.error('Error fetching enrolled classes:', error)
      return []
    }
  }

  const getUpcomingDeadlines = async (): Promise<UpcomingDeadline[]> => {
    try {
      const token = localStorage.getItem('classbuddy_token')
      if (!token) throw new Error('No token found')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/assignments/upcoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error)
      return []
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        getUserStats,
        getEnrolledClasses,
        getUpcomingDeadlines,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const getDepartmentName = (departmentCode: string): string => {
  const departmentMap: Record<string, string> = {
    ise: "Information Science and Engineering",
    eee: "Electrical and Electronics Engineering",
    cse: "Computer Science and Engineering",
    ece: "Electronics and Communication Engineering",
    mech: "Mechanical Engineering",
    civil: "Civil Engineering",
    chem: "Chemical Engineering",
    bio: "Bioengineering",
    ae: "Aerospace Engineering",
  };

  return departmentMap[departmentCode] || departmentCode;
};