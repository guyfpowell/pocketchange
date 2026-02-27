import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
});

// Optional: Add request interceptor for tokens, etc.
// api.interceptors.request.use((config) => {
//   // add headers if needed
//   return config;
// });

export default api;