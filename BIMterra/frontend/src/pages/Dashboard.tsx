import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import type { Proyecto } from "@/lib/types";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get<Proyecto[]>("/proyectos").then(({ data }) => {
      setProyectos(data);
      setCargando(false);
    });
  }, []);

  const totalActividades = proyectos.reduce((acc, p) => acc + (p._count?.actividades ?? 0), 0);
  const totalModelos = proyectos.reduce((acc, p) => acc + (p._count?.modelosBim ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <p className="cota-label">Panel general</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-white">
        Hola, {usuario?.nombre?.split(" ")[0]}
      </h1>
      <p className="mt-1 text-blueprint-300">
        Aquí tienes el estado general de tus proyectos en BIMterra.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaIndicador etiqueta="Proyectos activos" valor={cargando ? "—" : proyectos.length} />
        <TarjetaIndicador etiqueta="Actividades" valor={cargando ? "—" : totalActividades} />
        <TarjetaIndicador etiqueta="Modelos BIM cargados" valor={cargando ? "—" : totalModelos} />
        <TarjetaIndicador etiqueta="Alertas de atraso" valor="0" acentoClase="text-estado-atraso" />
      </div>

      <div className="mt-10">
        <p className="cota-label">Próximos módulos</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaModulo
            titulo="Carta Gantt"
            descripcion="Planificación con dependencias y ruta crítica."
            estado="Sprint 2"
          />
          <TarjetaModulo
            titulo="Modelo BIM"
            descripcion="Visor 3D con selección de elementos y fotos."
            estado="Sprint 3"
          />
          <TarjetaModulo
            titulo="Curva S y costos"
            descripcion="SPI, CPI, TCPI y control económico por actividad."
            estado="Sprint 5–6"
          />
        </div>
      </div>
    </div>
  );
}

function TarjetaIndicador({
  etiqueta,
  valor,
  acentoClase,
}: {
  etiqueta: string;
  valor: string | number;
  acentoClase?: string;
}) {
  return (
    <div className="panel p-5">
      <p className="text-xs uppercase tracking-wide text-blueprint-400">{etiqueta}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${acentoClase || "text-white"}`}>{valor}</p>
    </div>
  );
}

function TarjetaModulo({
  titulo,
  descripcion,
  estado,
}: {
  titulo: string;
  descripcion: string;
  estado: string;
}) {
  return (
    <div className="panel p-5 opacity-80">
      <div className="flex items-center justify-between">
        <p className="font-display font-semibold text-white">{titulo}</p>
        <span className="rounded-sm border border-obra/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-obra">
          {estado}
        </span>
      </div>
      <p className="mt-2 text-sm text-blueprint-300">{descripcion}</p>
    </div>
  );
}
