import axios from "axios";

const api = axios.create({
  baseURL:
    (process.env.REACT_APP_API_URL || "https://meeting-mind-o4ji.onrender.com") + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;