import type { Actividad } from "@/lib/types";

function diasEntre(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function GanttTimeline({ actividades }: { actividades: Actividad[] }) {
  if (actividades.length === 0) return null;

  const fechas = actividades.flatMap((a) => [new Date(a.fechaInicio), new Date(a.fechaTermino)]);
  const fechaMin = new Date(Math.min(...fechas.map((f) => f.getTime())));
  const fechaMax = new Date(Math.max(...fechas.map((f) => f.getTime())));
  const totalDias = Math.max(1, diasEntre(fechaMin, fechaMax));

  // Marcas de semana para la regla superior
  const marcas: { offset: number; etiqueta: string }[] = [];
  for (let d = 0; d <= totalDias; d += 7) {
    const fecha = new Date(fechaMin);
    fecha.setDate(fecha.getDate() + d);
    marcas.push({
      offset: (d / totalDias) * 100,
      etiqueta: fecha.toLocaleDateString("es-CL", { day: "2-digit", month: "short" }),
    });
  }

  return (
    <div className="panel overflow-x-auto p-5">
      <div className="relative min-w-[600px]">
        {/* Regla de fechas */}
        <div className="relative mb-3 h-5 border-b border-blueprint-600/40">
          {marcas.map((m, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 text-[10px] text-blueprint-400"
              style={{ left: `${m.offset}%` }}
            >
              {m.etiqueta}
            </span>
          ))}
        </div>

        <div className="space-y-2.5">
          {actividades.map((a) => {
            const inicio = new Date(a.fechaInicio);
            const termino = new Date(a.fechaTermino);
            const offset = (diasEntre(fechaMin, inicio) / totalDias) * 100;
            const ancho = Math.max(2, (diasEntre(inicio, termino) / totalDias) * 100);

            const colorBarra = a.esCritica
              ? "bg-estado-atraso/30 border-estado-atraso"
              : "bg-blueprint-600/40 border-blueprint-400";
            const colorAvance = a.esCritica ? "bg-estado-atraso" : "bg-obra";

            return (
              <div key={a.id} className="relative flex items-center gap-3">
                <div className="w-40 flex-shrink-0 truncate text-xs text-blueprint-200" title={a.nombre}>
                  {a.esCritica && <span className="mr-1 text-estado-atraso">●</span>}
                  {a.nombre}
                </div>
                <div className="relative h-6 flex-1">
                  <div
                    className={`absolute h-6 rounded-sm border ${colorBarra}`}
                    style={{ left: `${offset}%`, width: `${ancho}%` }}
                  >
                    <div
                      className={`h-full rounded-sm ${colorAvance} opacity-70`}
                      style={{ width: `${Math.min(100, a.avanceFisico)}%` }}
                    />
                  </div>
                </div>
                <div className="w-10 flex-shrink-0 text-right text-[11px] text-blueprint-300">
                  {Math.round(a.avanceFisico)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-5 border-t border-blueprint-600/30 pt-3 text-[11px] text-blueprint-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blueprint-600/40" /> Actividad normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-estado-atraso/40" /> Ruta crítica
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-obra" /> Avance físico
        </span>
      </div>
    </div>
  );
}
