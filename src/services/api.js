import axios from 'axios';

// MongoDB backend base URL (move to env var VITE_API_BASE_URL for flexibility)
const API_BASE_URL = 'https://attendancetrackerbackend-mongo.onrender.com/api';
//const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth Services
export const authService = {
  register: async (userData) => {
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await apiClient.post('/users/login', { email, password });
    return response.data;
  }
};

// Admin Services
export const adminService = {
  login: async (email, password) => {
    const response = await apiClient.post('/admin/login', { email, password });
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  getUserSubjects: async (userId) => {
    const response = await apiClient.get(`/subjects/user/${userId}`);
    return response.data;
  },
  
  getUserAttendance: async (userId) => {
    const response = await apiClient.get(`/attendance/user/${userId}`);
    return response.data;
  }
};

// Subject Services
export const subjectService = {
  getSubjects: async (userId) => {
    const response = await apiClient.get(`/subjects/user/${userId}`);
    return response.data;
  },
  
  addSubject: async (userId, subjectName) => {
    const response = await apiClient.post(`/subjects/add?userId=${userId}&name=${encodeURIComponent(subjectName)}`);
    return response.data;
  },
  
  deleteSubject: async (subjectId, userId) => {
  try {
    const response = await apiClient.delete(`/subjects/${subjectId}/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete subject");
  }
}

};

// Attendance Services
export const attendanceService = {
  getRecords: async (userId) => {
    const response = await apiClient.get(`/attendance/user/${userId}`);
    return response.data;
  },
  
  addRecord: async (userId, subjectId, status, date, classNumber) => {
    const response = await apiClient.post(`/attendance/add?userId=${userId}&subjectId=${subjectId}&status=${status}&date=${date}&classNumber=${classNumber}`);
    return response.data;
  },
  
  updateRecord: async (recordId, recordData) => {
    const response = await apiClient.put(`/attendance/${recordId}`, recordData);
    return response.data;
  },
  
  deleteRecord: async (recordId) => {
    const response = await apiClient.delete(`/attendance/${recordId}`);
    return response.data;
  },
  
  deleteBySubjectDateClass: async (subjectId, date, classNumber) => {
    const response = await apiClient.delete(`/attendance/delete-by-subject-date-class?subjectId=${subjectId}&date=${date}&classNumber=${classNumber}`);
    return response.data;
  }
};

// Reset Services
export const resetService = {
  resetUserData: async (userId) => {
    const response = await apiClient.delete(`/reset/user/${userId}`);
    return response.data;
  }
};

export default {
  auth: authService,
  admin: adminService,
  subjects: subjectService,
  attendance: attendanceService,
  reset: resetService
};
