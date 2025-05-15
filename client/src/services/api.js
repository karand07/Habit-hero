import axios from 'axios';

// const API_URL = process.env.NODE_ENV === 'development' 
//   ? 'http://localhost:5000/api' 
//   : '/api'; // Adjust for production if needed

// For Vite development, explicitly set the backend URL
// For production, this would typically be a relative path or configured via VITE_ env variables
const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth Services ---
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/auth/me', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- Habit Services ---
export const getHabits = async () => {
  try {
    const response = await apiClient.get('/habits');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createHabit = async (habitData) => {
  try {
    const response = await apiClient.post('/habits', habitData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getHabitById = async (id) => {
  try {
    const response = await apiClient.get(`/habits/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateHabit = async (id, habitData) => {
  try {
    const response = await apiClient.put(`/habits/${id}`, habitData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteHabit = async (id) => {
  try {
    const response = await apiClient.delete(`/habits/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logHabitCompletion = async (id, data = {}) => { // data can include debug_completed_at
  try {
    const response = await apiClient.post(`/habits/${id}/log`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getHabitLogs = async (id) => {
  try {
    const response = await apiClient.get(`/habits/${id}/logs`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- Achievement Services ---
export const getAllAchievements = async () => {
  try {
    const response = await apiClient.get('/achievements');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyAchievements = async () => {
  try {
    const response = await apiClient.get('/achievements/my');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- Statistics Services ---
export const getStatsSummary = async () => {
  try {
    const response = await apiClient.get('/stats/summary');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getActivityTimeline = async (days = 30) => { // Optional days parameter
  try {
    const response = await apiClient.get(`/stats/activity-timeline?days=${days}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default apiClient; 