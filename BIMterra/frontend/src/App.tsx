import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import RutaProtegida from "@/components/RutaProtegida";
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/Login";
import Registro from "@/pages/Registro";
import Dashboard from "@/pages/Dashboard";
import Proyectos from "@/pages/Proyectos";
import ProyectoDetalle from "@/pages/ProyectoDetalle";
import Gantt from "@/pages/Gantt";
import EnConstruccion from "@/pages/EnConstruccion";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route
          element={
            <RutaProtegida>
              <AppLayout />
            </RutaProtegida>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/proyectos/:id" element={<ProyectoDetalle />} />
          <Route path="/gantt" element={<Gantt />} />
          <Route path="/modelo" element={<EnConstruccion titulo="Modelo BIM" sprint="Sprint 3" />} />
          <Route path="/costos" element={<EnConstruccion titulo="Costos" sprint="Sprint 6" />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
