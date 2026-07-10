import { FormEvent, useState } from "react";
import api from "@/lib/api";
import type { Actividad } from "@/lib/types";

export default function GestorDependencias({
  actividades,
  onCambio,
}: {
  actividades: Actividad[];
  onCambio: () => void;
}) {
  const [predecesoraId, setPredecesoraId] = useState("");
  const [sucesoraId, setSucesoraId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!predecesoraId || !sucesoraId) return;
    setEnviando(true);
    try {
      await api.post("/actividades/dependencias", { predecesoraId, sucesoraId, tipo: "FS" });
      setPredecesoraId("");
      setSucesoraId("");
      onCambio();
    } catch (err: any) {
      setError(err.response?.data?.error || "No se pudo crear la dependencia.");
    } finally {
      setEnviando(false);
    }
  }

  async function eliminarDependencia(depId: string) {
    await api.delete(`/actividades/dependencias/${depId}`);
    onCambio();
  }

  const nombrePorId = new Map(actividades.map((a) => [a.id, a.nombre]));

  return (
    <div className="panel p-5">
      <p className="cota-label">Dependencias</p>
      <p className="mt-2 text-xs text-blueprint-400">
        Define qué actividad debe terminar antes de que otra pueda comenzar (fin-a-inicio).
      </p>

      <form onSubmit={manejarSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wide text-blueprint-300">
            Predecesora
          </label>
          <select
            value={predecesoraId}
            onChange={(e) => setPredecesoraId(e.target.value)}
            className="input-plano"
          >
            <option value="">Selecciona...</option>
            {actividades.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
        <span className="pb-2.5 text-blueprint-400">→</span>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wide text-blueprint-300">
            Sucesora
          </label>
          <select
            value={sucesoraId}
            onChange={(e) => setSucesoraId(e.target.value)}
            className="input-plano"
          >
            <option value="">Selecciona...</option>
            {actividades.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={enviando} className="btn-secundario">
          Vincular
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-estado-atraso">{error}</p>}

      <div className="mt-5 space-y-1.5">
        {actividades.flatMap((a) =>
          a.sucesoras.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center justify-between rounded-sm border border-blueprint-600/30 px-3 py-1.5 text-xs text-blueprint-200"
            >
              <span>
                {a.nombre} <span className="text-blueprint-400">→</span>{" "}
                {nombrePorId.get(dep.sucesoraId || "") || "—"}
              </span>
              <button
                onClick={() => eliminarDependencia(dep.id)}
                className="text-blueprint-400 hover:text-estado-atraso"
                aria-label="Eliminar dependencia"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
