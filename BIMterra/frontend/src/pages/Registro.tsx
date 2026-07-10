import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await registrar(nombre, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo crear la cuenta. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blueprint-800 bg-grilla px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-bold tracking-tight text-white">
            BIM<span className="text-obra">terra</span>
          </p>
          <p className="cota-label mt-3 justify-center">Crear cuenta</p>
        </div>

        <form onSubmit={manejarSubmit} className="panel space-y-5 p-8">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
              Nombre completo
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-plano"
              placeholder="Guillermo Pérez"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-plano"
              placeholder="nombre@empresa.cl"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
              Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-plano"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="rounded-sm border border-estado-atraso/40 bg-estado-atraso/10 px-3 py-2 text-sm text-estado-atraso">
              {error}
            </p>
          )}

          <button type="submit" disabled={enviando} className="btn-primario w-full disabled:opacity-60">
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <p className="text-center text-sm text-blueprint-300">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-obra hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
