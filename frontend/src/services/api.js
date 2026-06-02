import axios from "axios";

const BACKEND_URL = `http://${window.location.hostname}:5000`;

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
