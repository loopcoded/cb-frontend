// services/api.ts
import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cb-back-s7yj.onrender.com"

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('classbuddy_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// FIXED: Updated interfaces to match backend models exactly
export interface Announcement {
  _id?: string
  title: string
  content: string
  author: string
  date?: string
  urgent: boolean
  category: "general" | "academic" | "event" | "other" | "assignment" | "exam"
  audience: "all" | "students" | "teachers" | "parents"
  section: string // ObjectId as string - REQUIRED in backend
  year: string // ObjectId as string - REQUIRED in backend
  department: string // ObjectId as string - REQUIRED in backend
  createdBy: string // ObjectId as string - REQUIRED in backend
  createdAt?: Date
  updatedAt?: Date
}

export interface ClassSchedule {
  _id?: string
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  subject: string
  startTime: string // Format: "09:00"
  endTime: string // Format: "10:00"
  teacher?: string
  room: string
  recurrence: "daily" | "weekly" | "biweekly" | "monthly" | "yearly" | "none" | "once"
  date: Date
  section?: string // ObjectId as string (optional in model)
  year: string // ObjectId as string - REQUIRED
  department: string // ObjectId as string - REQUIRED
  createdBy: string // ObjectId as string - REQUIRED
  createdAt?: Date
  updatedAt?: Date
}

export interface Reminder {
  _id?: string
  title: string
  description?: string
  date?: Date
  completed: boolean
  priority: "high" | "medium" | "low"
  relatedTo:
    | "Cloud Computing"
    | "Computer Networks"
    | "DataBase Management System"
    | "Advanced Data Structure"
    | "Service Oriented Architecture"
    | "Object Oriented Programming"
    | "Other"
  time: string
  section: string // ObjectId as string - REQUIRED
  year: string // ObjectId as string - REQUIRED
  department: string // ObjectId as string - REQUIRED
  createdBy: string // ObjectId as string - REQUIRED
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthResponse {
  _id?: string
  token: string
  name: string
  email: string
  role: string
  message?: string
  section?: string // ObjectId as string
  department?: string // ObjectId as string
  year?: string // ObjectId as string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: string
  departmentName: string
  yearValue: string
  sectionName: string
}

export interface UserStats {
  totalAnnouncements: number
  totalReminders: number
  totalSchedules: number
  classesAttended?: number
  totalClasses?: number
  attendanceRate?: number
  assignmentsCompleted?: number
  assignmentsPending?: number
  discussionsParticipated?: number
  lastActive?: string
}

export interface EnrolledClass {
  _id?: string
  subject: string // Changed from 'name' to 'subject' to match controller
  location: string // Changed from 'grade' to 'location' to match controller
  startTime: string // Added to match controller response
  endTime: string // Added to match controller response
  professor: string // Added to match controller response
  icon?: string // Added to match controller response
  color?: string // Added to match controller response
}

export interface UpcomingDeadline {
  _id?: string
  title: string
  subject: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
}

export interface UserProfile {
  _id: string
  name: string
  email: string
  role: string
  section: string // ObjectId as string
  department: string // ObjectId as string
  year: string // ObjectId as string
  createdAt: Date
  updatedAt: Date
}

// Department, Year, Section interfaces for reference data
export interface Department {
  _id: string
  name: string
}

export interface Year {
  _id: string
  year: string
  department: string // ObjectId as string
}

export interface Section {
  _id: string
  name: string
  year: string // ObjectId as string
  cr?: string // ObjectId as string
  department: string // ObjectId as string
}

// Auth functions
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('https://cb-back-s7yj.onrender.com/api/auth/register', userData)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed')
  }
}

export const loginUser = async (credentials: {
  email: string
  password: string
}): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('https://cb-back-s7yj.onrender.com/api/auth/login', credentials)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed')
  }
}

// API functions
export const api = {
  // Announcements
  getAllAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const response = await apiClient.get("https://cb-back-s7yj.onrender.com/api/announcements/")
      return response.data
    } catch (error) {
      console.error("Error fetching announcements:", error)
      return []
    }
  },

  getAnnouncementById: async (id: string): Promise<Announcement | null> => {
    try {
      const response = await apiClient.get(`https://cb-back-s7yj.onrender.com/api/announcements/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching announcement:', error)
      return null
    }
  },

  getAnnouncementsByAudience: async (audience: string): Promise<Announcement[]> => {
    try {
      const response = await apiClient.get(`/api/announcements/audience/${audience}`)
      return response.data
    } catch (error) {
      console.error('Error fetching announcements by audience:', error)
      return []
    }
  },

  // FIXED: This endpoint doesn't exist in your controllers
  // getAnnouncementsValidUntil: async (date: string): Promise<Announcement[]> => {
  //   try {
  //     const response = await apiClient.get(`/api/announcements/validuntil/${date}`)
  //     return response.data
  //   } catch (error) {
  //     console.error('Error fetching announcements by date:', error)
  //     return []
  //   }
  // },

  // Added missing endpoints from controller
  getAnnouncementsByCategory: async (category: string): Promise<Announcement[]> => {
    try {
      const response = await apiClient.get(`/api/announcements/category/${category}`)
      return response.data
    } catch (error) {
      console.error('Error fetching announcements by category:', error)
      return []
    }
  },

  getUrgentAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const response = await apiClient.get('/api/announcements/urgent')
      return response.data
    } catch (error) {
      console.error('Error fetching urgent announcements:', error)
      return []
    }
  },

  createAnnouncement: async (data: Omit<Announcement, "_id" | "createdAt" | "updatedAt">): Promise<Announcement> => {
    try {
      console.log("API: Sending announcement data:", data)

      // Validate required fields before sending
      if (!data.section || !data.year || !data.department || !data.createdBy) {
        throw new Error("Missing required fields: section, year, department, or createdBy")
      }

      const response = await apiClient.post("/api/announcements/create", data)
      console.log("API: Received response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("API: Create announcement error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Failed to create announcement")
    }
  },

  updateAnnouncement: async (id: string, data: Partial<Announcement>): Promise<Announcement> => {
    try {
      const response = await apiClient.put(`/api/announcements/${id}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update announcement')
    }
  },

  deleteAnnouncement: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/announcements/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting announcement:', error)
      return false
    }
  },

  // Schedules
  getAllSchedules: async (): Promise<ClassSchedule[]> => {
    try {
      const response = await apiClient.get('/api/schedules')
      return response.data
    } catch (error) {
      console.error('Error fetching schedules:', error)
      return []
    }
  },

  // FIXED: Changed to match controller implementation
  getDailySchedules: async (date: string): Promise<ClassSchedule[]> => {
    try {
      const response = await apiClient.get(`/api/schedules/daily?date=${date}`)
      return response.data
    } catch (error) {
      console.error('Error fetching daily schedules:', error)
      return []
    }
  },

  getScheduleById: async (id: string): Promise<ClassSchedule | null> => {
    try {
      const response = await apiClient.get(`/api/schedules/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching schedule:', error)
      return null
    }
  },

  getSchedulesByDay: async (day: string): Promise<ClassSchedule[]> => {
    try {
      const response = await apiClient.get(`/api/schedules/day/${day}`)
      return response.data
    } catch (error) {
      console.error('Error fetching schedules by day:', error)
      return []
    }
  },

  getSchedulesByTeacher: async (teacher: string): Promise<ClassSchedule[]> => {
    try {
      const response = await apiClient.get(`/api/schedules/teacher/${teacher}`)
      return response.data
    } catch (error) {
      console.error('Error fetching schedules by teacher:', error)
      return []
    }
  },

  createSchedule: async (data: Omit<ClassSchedule, "_id" | "createdAt" | "updatedAt">): Promise<ClassSchedule> => {
    try {
      console.log("API: Sending schedule data:", data)

      // Validate required fields before sending
      if (!data.year || !data.department || !data.createdBy) {
        throw new Error("Missing required fields: year, department, or createdBy")
      }

      const response = await apiClient.post("/api/schedules/create", data)
      console.log("API: Received response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("API: Create schedule error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Failed to create schedule")
    }
  },

  updateSchedule: async (id: string, data: Partial<ClassSchedule>): Promise<ClassSchedule> => {
    try {
      const response = await apiClient.put(`/api/schedules/${id}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update schedule')
    }
  },

  deleteSchedule: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/schedules/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting schedule:', error)
      return false
    }
  },

  // Reminders
  getAllReminders: async (): Promise<Reminder[]> => {
    try {
      const response = await apiClient.get('/api/reminders')
      return response.data
    } catch (error) {
      console.error('Error fetching reminders:', error)
      return []
    }
  },

  getReminderById: async (id: string): Promise<Reminder | null> => {
    try {
      const response = await apiClient.get(`/api/reminders/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching reminder:', error)
      return null
    }
  },

  // Added missing endpoints from controller
  getRemindersByPriority: async (priority: string): Promise<Reminder[]> => {
    try {
      const response = await apiClient.get(`/api/reminders/priority/${priority}`)
      return response.data
    } catch (error) {
      console.error('Error fetching reminders by priority:', error)
      return []
    }
  },

  getRemindersBySubject: async (subject: string): Promise<Reminder[]> => {
    try {
      const response = await apiClient.get(`/api/reminders/subject/${subject}`)
      return response.data
    } catch (error) {
      console.error('Error fetching reminders by subject:', error)
      return []
    }
  },

  getPendingReminders: async (): Promise<Reminder[]> => {
    try {
      const response = await apiClient.get('/api/reminders/pending')
      return response.data
    } catch (error) {
      console.error('Error fetching pending reminders:', error)
      return []
    }
  },

  createReminder: async (data: Omit<Reminder, "_id" | "createdAt" | "updatedAt">): Promise<Reminder> => {
    try {
      console.log("API: Sending reminder data:", data)

      // Validate required fields before sending
      if (!data.section || !data.year || !data.department || !data.createdBy) {
        throw new Error("Missing required fields: section, year, department, or createdBy")
      }

      const response = await apiClient.post("/api/reminders/create", data)
      console.log("API: Received response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("API: Create reminder error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Failed to create reminder")
    }
  },

  updateReminder: async (id: string, data: Partial<Reminder>): Promise<Reminder> => {
    try {
      const response = await apiClient.put(`/api/reminders/${id}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update reminder')
    }
  },

  deleteReminder: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/reminders/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting reminder:', error)
      return false
    }
  },

  // FIXED: User Profile APIs - Updated endpoints to match controller
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await apiClient.get('/api/users/stats') // Changed from '/api/users/stats'
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch user stats')
    }
  },

  getEnrolledClasses: async (): Promise<EnrolledClass[]> => {
    try {
      const response = await apiClient.get('/api/users/enrolled-classes') // Changed from '/api/users/enrolled-classes'
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch enrolled classes')
    }
  },

  getUpcomingAssignments: async (): Promise<UpcomingDeadline[]> => {
    try {
      const response = await apiClient.get('/api/users/assignments/upcoming') // Changed from '/api/users/assignments/upcoming'
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch upcoming assignments')
    }
  },

  getUserProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.get(`/api/users/profile/${userId}`) // Changed from '/api/users/profile/${userId}'
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch user profile')
    }
  },

  // Reference data APIs (for dropdowns, etc.)
  getAllDepartments: async (): Promise<Department[]> => {
    try {
      const response = await apiClient.get('/api/departments')
      return response.data
    } catch (error) {
      console.error('Error fetching departments:', error)
      return []
    }
  },

  getYearsByDepartment: async (departmentId: string): Promise<Year[]> => {
    try {
      const response = await apiClient.get(`/api/years/department/${departmentId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching years:', error)
      return []
    }
  },

  getSectionsByYear: async (yearId: string): Promise<Section[]> => {
    try {
      const response = await apiClient.get(`/api/sections/year/${yearId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sections:', error)
      return []
    }
  },
}

export default api;