import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mm_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;