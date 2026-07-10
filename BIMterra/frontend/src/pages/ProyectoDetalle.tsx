import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import type { Proyecto } from "@/lib/types";

export default function ProyectoDetalle() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<Proyecto>(`/proyectos/${id}`).then(({ data }) => {
      setProyecto(data);
      setCargando(false);
    });
  }, [id]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-10">
        <p className="text-blueprint-300">Cargando proyecto...</p>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-10">
        <p className="text-blueprint-300">Proyecto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <p className="cota-label">Ficha de proyecto</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-white">{proyecto.nombre}</h1>
      {proyecto.ubicacion && <p className="mt-1 text-blueprint-300">{proyecto.ubicacion}</p>}
      {proyecto.descripcion && (
        <p className="mt-4 max-w-2xl text-blueprint-200">{proyecto.descripcion}</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-blueprint-400">Actividades</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">
            {proyecto._count?.actividades ?? 0}
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-blueprint-400">Modelos BIM</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">
            {proyecto._count?.modelosBim ?? 0}
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-wide text-blueprint-400">Creado el</p>
          <p className="mt-2 font-display text-lg text-white">
            {new Date(proyecto.creadoEn).toLocaleDateString("es-CL")}
          </p>
        </div>
      </div>
    </div>
  );
}
