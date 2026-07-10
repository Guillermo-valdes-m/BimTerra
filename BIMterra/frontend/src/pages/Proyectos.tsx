import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import type { Proyecto } from "@/lib/types";

export default function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  async function cargarProyectos() {
    setCargando(true);
    const { data } = await api.get<Proyecto[]>("/proyectos");
    setProyectos(data);
    setCargando(false);
  }

  useEffect(() => {
    cargarProyectos();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="cota-label">Gestión de obras</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white">Proyectos</h1>
        </div>
        <button onClick={() => setMostrarFormulario((v) => !v)} className="btn-primario">
          {mostrarFormulario ? "Cancelar" : "+ Nuevo proyecto"}
        </button>
      </div>

      {mostrarFormulario && (
        <NuevoProyectoForm
          onCreado={() => {
            setMostrarFormulario(false);
            cargarProyectos();
          }}
        />
      )}

      {cargando ? (
        <p className="text-blueprint-300">Cargando proyectos...</p>
      ) : proyectos.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="text-blueprint-200">Aún no tienes proyectos creados.</p>
          <p className="mt-1 text-sm text-blueprint-400">
            Crea el primero para empezar a planificar y controlar tu obra.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proyectos.map((p) => (
            <Link
              key={p.id}
              to={`/proyectos/${p.id}`}
              className="panel block p-5 transition hover:border-obra/60"
            >
              <p className="font-display font-semibold text-white">{p.nombre}</p>
              {p.ubicacion && <p className="mt-1 text-sm text-blueprint-300">{p.ubicacion}</p>}
              <div className="mt-4 flex gap-4 text-xs text-blueprint-400">
                <span>{p._count?.actividades ?? 0} actividades</span>
                <span>{p._count?.modelosBim ?? 0} modelos BIM</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NuevoProyectoForm({ onCreado }: { onCreado: () => void }) {
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await api.post("/proyectos", { nombre, ubicacion, descripcion });
      setNombre("");
      setUbicacion("");
      setDescripcion("");
      onCreado();
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo crear el proyecto.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="panel mb-8 space-y-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
            Nombre del proyecto
          </label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input-plano"
            placeholder="Ej: Condominio Los Robles"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
            Ubicación
          </label>
          <input
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="input-plano"
            placeholder="Ej: Talca, Región del Maule"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="input-plano"
          rows={3}
          placeholder="Breve descripción del proyecto"
        />
      </div>
      {error && (
        <p className="rounded-sm border border-estado-atraso/40 bg-estado-atraso/10 px-3 py-2 text-sm text-estado-atraso">
          {error}
        </p>
      )}
      <button type="submit" disabled={enviando} className="btn-primario disabled:opacity-60">
        {enviando ? "Creando..." : "Crear proyecto"}
      </button>
    </form>
  );
}
