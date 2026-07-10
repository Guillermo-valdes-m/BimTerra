import { FormEvent, useState } from "react";
import api from "@/lib/api";

export default function NuevaActividadForm({
  proyectoId,
  onCreada,
}: {
  proyectoId: string;
  onCreada: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await api.post(`/proyectos/${proyectoId}/actividades`, {
        nombre,
        fechaInicio,
        fechaTermino,
        presupuesto: presupuesto ? Number(presupuesto) : undefined,
      });
      setNombre("");
      setFechaInicio("");
      setFechaTermino("");
      setPresupuesto("");
      onCreada();
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo crear la actividad.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="panel mb-6 space-y-4 p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
            Nombre de la actividad
          </label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input-plano"
            placeholder="Ej: Hormigonar losa piso 2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
            Inicio
          </label>
          <input
            required
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="input-plano"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
            Término
          </label>
          <input
            required
            type="date"
            value={fechaTermino}
            onChange={(e) => setFechaTermino(e.target.value)}
            className="input-plano"
          />
        </div>
      </div>

      <div className="max-w-xs">
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-blueprint-300">
          Presupuesto (opcional)
        </label>
        <input
          type="number"
          min={0}
          value={presupuesto}
          onChange={(e) => setPresupuesto(e.target.value)}
          className="input-plano"
          placeholder="$"
        />
      </div>

      {error && (
        <p className="rounded-sm border border-estado-atraso/40 bg-estado-atraso/10 px-3 py-2 text-sm text-estado-atraso">
          {error}
        </p>
      )}

      <button type="submit" disabled={enviando} className="btn-primario disabled:opacity-60">
        {enviando ? "Creando..." : "+ Agregar actividad"}
      </button>
    </form>
  );
}
