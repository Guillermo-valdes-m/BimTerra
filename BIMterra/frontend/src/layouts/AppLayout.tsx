import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const navegacion = [
  { to: "/dashboard", etiqueta: "Dashboard", cota: "01" },
  { to: "/proyectos", etiqueta: "Proyectos", cota: "02" },
  { to: "/gantt", etiqueta: "Carta Gantt", cota: "03" },
  { to: "/modelo", etiqueta: "Modelo BIM", cota: "04" },
  { to: "/costos", etiqueta: "Costos", cota: "05" },
];

export default function AppLayout() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div className="flex h-screen bg-blueprint-800 bg-grilla bg-grilla">
      {/* Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-blueprint-600/40 bg-blueprint-900/70">
        <div className="border-b border-blueprint-600/40 px-6 py-6">
          <p className="font-display text-lg font-bold tracking-tight text-white">
            BIM<span className="text-obra">terra</span>
          </p>
          <p className="mt-1 text-xs text-blueprint-300">Control inteligente de obras</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {navegacion.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-blueprint-700/60 text-white"
                    : "text-blueprint-300 hover:bg-blueprint-700/30 hover:text-white"
                }`
              }
            >
              <span className="font-display text-[10px] text-obra">{item.cota}</span>
              {item.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-blueprint-600/40 px-4 py-4">
          <p className="truncate text-sm text-white">{usuario?.nombre}</p>
          <p className="truncate text-xs text-blueprint-400">{usuario?.email}</p>
          <button
            onClick={cerrarSesion}
            className="mt-3 w-full rounded-sm border border-blueprint-500/40 px-3 py-1.5 text-xs uppercase tracking-wide text-blueprint-300 transition hover:border-obra hover:text-obra"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
