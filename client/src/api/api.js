// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api", // Your server runs on port 3001
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
