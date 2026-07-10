import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Adjunta el token JWT guardado en localStorage a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bimterra_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expiró o es inválido, cierra la sesión localmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bimterra_token");
      localStorage.removeItem("bimterra_usuario");
    }
    return Promise.reject(error);
  }
);

export default api;
