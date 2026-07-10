import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";
import type { Usuario } from "@/lib/types";

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrar: (nombre: string, email: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const guardado = localStorage.getItem("bimterra_usuario");
    if (guardado) {
      setUsuario(JSON.parse(guardado));
    }
    setCargando(false);
  }, []);

  function guardarSesion(token: string, usuario: Usuario) {
    localStorage.setItem("bimterra_token", token);
    localStorage.setItem("bimterra_usuario", JSON.stringify(usuario));
    setUsuario(usuario);
  }

  async function iniciarSesion(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    guardarSesion(data.token, data.usuario);
  }

  async function registrar(nombre: string, email: string, password: string) {
    const { data } = await api.post("/auth/registro", { nombre, email, password });
    guardarSesion(data.token, data.usuario);
  }

  function cerrarSesion() {
    localStorage.removeItem("bimterra_token");
    localStorage.removeItem("bimterra_usuario");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, registrar, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
