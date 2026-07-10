import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Actividad, Proyecto, ResultadoRutaCritica } from "@/lib/types";
import GanttTimeline from "@/components/GanttTimeline";
import NuevaActividadForm from "@/components/NuevaActividadForm";
import GestorDependencias from "@/components/GestorDependencias";

export default function Gantt() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState<string>("");
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [resumenRuta, setResumenRuta] = useState<ResultadoRutaCritica | null>(null);

  useEffect(() => {
    api.get<Proyecto[]>("/proyectos").then(({ data }) => {
      setProyectos(data);
      if (data.length > 0) setProyectoId(data[0].id);
      setCargando(false);
    });
  }, []);

  async function cargarActividades(pid: string) {
    if (!pid) return;
    const { data } = await api.get<Actividad[]>(`/proyectos/${pid}/actividades`);
    setActividades(data);
  }

  useEffect(() => {
    if (proyectoId) {
      setResumenRuta(null);
      cargarActividades(proyectoId);
    }
  }, [proyectoId]);

  async function actualizarAvance(actividadId: string, porcentaje: number) {
    await api.post(`/actividades/${actividadId}/avances`, { porcentaje });
    cargarActividades(proyectoId);
  }

  async function eliminarActividad(actividadId: string) {
    await api.delete(`/actividades/${actividadId}`);
    cargarActividades(proyectoId);
  }

  async function calcularRutaCritica() {
    setCalculando(true);
    try {
      const { data } = await api.get<ResultadoRutaCritica>(`/proyectos/${proyectoId}/ruta-critica`);
      setResumenRuta(data);
      await cargarActividades(proyectoId);
    } finally {
      setCalculando(false);
    }
  }

  if (cargando) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-10">
        <p className="text-blueprint-300">Cargando...</p>
      </div>
    );
  }

  if (proyectos.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-10">
        <p className="cota-label">Sprint 2</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">Carta Gantt</h1>
        <div className="panel mt-6 p-8 text-center text-blueprint-300">
          Primero crea un proyecto en la sección "Proyectos" para poder planificar sus actividades.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="cota-label">Sprint 2</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white">Carta Gantt</h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={proyectoId}
            onChange={(e) => setProyectoId(e.target.value)}
            className="input-plano w-56"
          >
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <button onClick={calcularRutaCritica} disabled={calculando} className="btn-primario">
            {calculando ? "Calculando..." : "Calcular ruta crítica"}
          </button>
        </div>
      </div>

      {resumenRuta && (
        <div className="panel mb-6 flex flex-wrap items-center gap-6 p-4 text-sm">
          <span className="text-blueprint-300">
            Duración total del proyecto:{" "}
            <span className="font-display font-semibold text-white">
              {resumenRuta.duracionTotalDias} días
            </span>
          </span>
          <span className="text-blueprint-300">
            Actividades críticas:{" "}
            <span className="font-display font-semibold text-estado-atraso">
              {resumenRuta.actividades.filter((a) => a.esCritica).length}
            </span>
          </span>
        </div>
      )}

      <NuevaActividadForm proyectoId={proyectoId} onCreada={() => cargarActividades(proyectoId)} />

      {actividades.length === 0 ? (
        <div className="panel p-8 text-center text-blueprint-300">
          Aún no hay actividades. Agrega la primera con el formulario de arriba.
        </div>
      ) : (
        <div className="space-y-6">
          <GanttTimeline actividades={actividades} />

          <div className="panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blueprint-600/40 text-left text-xs uppercase tracking-wide text-blueprint-400">
                  <th className="px-4 py-3">Actividad</th>
                  <th className="px-4 py-3">Inicio</th>
                  <th className="px-4 py-3">Término</th>
                  <th className="px-4 py-3">Duración</th>
                  <th className="px-4 py-3">Avance físico</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((a) => (
                  <FilaActividad
                    key={a.id}
                    actividad={a}
                    onActualizarAvance={actualizarAvance}
                    onEliminar={eliminarActividad}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <GestorDependencias actividades={actividades} onCambio={() => cargarActividades(proyectoId)} />
        </div>
      )}
    </div>
  );
}

function FilaActividad({
  actividad,
  onActualizarAvance,
  onEliminar,
}: {
  actividad: Actividad;
  onActualizarAvance: (id: string, porcentaje: number) => void;
  onEliminar: (id: string) => void;
}) {
  const [avance, setAvance] = useState(actividad.avanceFisico);

  const etiquetaEstado: Record<string, string> = {
    PENDIENTE: "Pendiente",
    EN_CURSO: "En curso",
    ATRASADA: "Atrasada",
    COMPLETADA: "Completada",
  };

  return (
    <tr className="border-b border-blueprint-600/20 last:border-0">
      <td className="px-4 py-3 text-blueprint-100">
        {actividad.esCritica && <span className="mr-1.5 text-estado-atraso">●</span>}
        {actividad.nombre}
      </td>
      <td className="px-4 py-3 text-blueprint-300">
        {new Date(actividad.fechaInicio).toLocaleDateString("es-CL")}
      </td>
      <td className="px-4 py-3 text-blueprint-300">
        {new Date(actividad.fechaTermino).toLocaleDateString("es-CL")}
      </td>
      <td className="px-4 py-3 text-blueprint-300">{actividad.duracionDias} días</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={avance}
            onChange={(e) => setAvance(Number(e.target.value))}
            onMouseUp={() => onActualizarAvance(actividad.id, avance)}
            onTouchEnd={() => onActualizarAvance(actividad.id, avance)}
            className="w-24 accent-obra"
          />
          <span className="w-9 text-xs text-blueprint-300">{avance}%</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-sm border border-blueprint-500/40 px-2 py-0.5 text-[11px] text-blueprint-200">
          {etiquetaEstado[actividad.estado]}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onEliminar(actividad.id)}
          className="text-xs text-blueprint-400 hover:text-estado-atraso"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}
