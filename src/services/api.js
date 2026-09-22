import axios from 'axios';

// Set VITE_API_BASE_URL (see .env.example) to use another backend, e.g. a local one
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://attendancetrackerbackend-mongo.onrender.com/api';

const SESSION_KEY = 'session';

// The signed-in account and its bearer token: { token, user, isAdmin }
export const sessionStore = {
  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
      return saved?.token && saved?.user ? saved : null;
    } catch {
      return null;
    }
  },
  save(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const isSubscriptionError = (code) =>
  code === 'SUBSCRIPTION_EXPIRED' || code === 'SUBSCRIPTION_INACTIVE';

// The message to show for a failed request
export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const message = error?.response?.data?.message;
  if (message) return message;
  if (error?.request && !error.response) return 'Cannot reach the server. Check your connection and try again.';
  return fallback;
};

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStore.load()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// These report bad credentials or an inactive subscription to the page that called them
const LOGIN_PATHS = ['/users/login', '/users/register', '/admin/login'];

// An expired or rejected token signs the user out; a lapsed subscription sends them
// to the payment page. Either way the page reloads so all state starts fresh.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const session = sessionStore.load();
    const status = error.response?.status;
    if (session && !LOGIN_PATHS.includes(error.config?.url)) {
      if (status === 401) {
        sessionStore.clear();
        window.location.replace(session.isAdmin ? '/admin/login' : '/login');
      } else if (status === 403 && isSubscriptionError(error.response.data?.code)) {
        sessionStore.clear();
        window.location.replace('/inactive');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: async (userData) => {
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  },

  // Resolves to { token, user }
  login: async (email, password) => {
    const response = await apiClient.post('/users/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateEmail: async (userId, newEmail) => {
    const response = await apiClient.put(`/users/${userId}/email`, { email: newEmail });
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.post('/users/change-password', { oldPassword, newPassword });
    return response.data;
  }
};

// Admin Services
export const adminService = {
  // Resolves to { token, user }
  login: async (email, password) => {
    const response = await apiClient.post('/admin/login', { email, password });
    return response.data;
  },

  // Activate a user for a number of days
  activateUser: async (userId, days) => {
    const response = await apiClient.put(`/users/admin/activate/${userId}`, null, { params: { days } });
    return response.data;
  },

  // Deactivate a user
  deactivateUser: async (userId) => {
    const response = await apiClient.put(`/users/admin/deactivate/${userId}`);
    return response.data;
  },

  // Replace a user's password, e.g. when they have forgotten it
  setUserPassword: async (userId, password) => {
    const response = await apiClient.put(`/users/admin/${userId}/password`, { password });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Permanently delete a user with all their subjects and attendance
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
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
    const response = await apiClient.post('/subjects/add', null, { params: { userId, name: subjectName } });
    return response.data;
  },

  deleteSubject: async (subjectId, userId) => {
    const response = await apiClient.delete(`/subjects/${subjectId}/user/${userId}`);
    return response.data;
  }
};

// Attendance Services
export const attendanceService = {
  getRecords: async (userId) => {
    const response = await apiClient.get(`/attendance/user/${userId}`);
    return response.data;
  },

  // classNumber is the length of the class in hours
  addRecord: async (userId, subjectId, status, date, classNumber) => {
    const response = await apiClient.post('/attendance/add', null, {
      params: { userId, subjectId, status, date, classNumber }
    });
    return response.data;
  },

  // Only the fields present in recordData are changed
  updateRecord: async (recordId, recordData) => {
    const response = await apiClient.put(`/attendance/${recordId}`, recordData);
    return response.data;
  },

  deleteRecord: async (recordId) => {
    const response = await apiClient.delete(`/attendance/${recordId}`);
    return response.data;
  }
};

// Task Services (the signed-in student's Kanban board; the server takes the student from the token)
export const taskService = {
  // from/to are "YYYY-MM-DD" and inclusive; leave both out for all tasks
  getTasks: async ({ from, to } = {}) => {
    const response = await apiClient.get('/tasks', { params: { from, to } });
    return response.data;
  },

  // task: { title, taskDate, priority } where priority may be null
  createTask: async (task) => {
    const response = await apiClient.post('/tasks', task);
    return response.data;
  },

  updateTask: async (taskId, task) => {
    const response = await apiClient.put(`/tasks/${taskId}`, task);
    return response.data;
  },

  // Places the task in `status` between the two neighbouring task ids (either may be null)
  moveTask: async (taskId, status, afterTaskId, beforeTaskId) => {
    const response = await apiClient.put(`/tasks/${taskId}/move`, { status, afterTaskId, beforeTaskId });
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  }
};

// Pomodoro Services. Every call resolves to the timer's state:
// { phase: 'IDLE' | 'FOCUS' | 'BREAK', sessionId, remainingSeconds, totalSeconds, paused }
export const pomodoroService = {
  getCurrent: async () => {
    const response = await apiClient.get('/pomodoro/current');
    return response.data;
  },

  start: async () => {
    const response = await apiClient.post('/pomodoro/start');
    return response.data;
  },

  pause: async (sessionId) => {
    const response = await apiClient.put(`/pomodoro/${sessionId}/pause`);
    return response.data;
  },

  resume: async (sessionId) => {
    const response = await apiClient.put(`/pomodoro/${sessionId}/resume`);
    return response.data;
  },

  // The Reset button
  stop: async (sessionId) => {
    const response = await apiClient.put(`/pomodoro/${sessionId}/stop`);
    return response.data;
  },

  complete: async (sessionId) => {
    const response = await apiClient.put(`/pomodoro/${sessionId}/complete`);
    return response.data;
  },

  skipBreak: async (sessionId) => {
    const response = await apiClient.put(`/pomodoro/${sessionId}/skip-break`);
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
