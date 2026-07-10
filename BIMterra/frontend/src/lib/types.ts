export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMIN" | "JEFE_OBRA" | "ITO" | "OFICINA_TECNICA" | "COLABORADOR";
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  ubicacion?: string | null;
  fechaInicio?: string | null;
  fechaTermino?: string | null;
  presupuesto?: number | null;
  creadoEn: string;
  _count?: {
    actividades: number;
    modelosBim: number;
  };
}

export type EstadoActividad = "PENDIENTE" | "EN_CURSO" | "ATRASADA" | "COMPLETADA";

export interface DependenciaRef {
  id: string;
  predecesoraId?: string;
  sucesoraId?: string;
  tipo: string;
}

export interface Actividad {
  id: string;
  proyectoId: string;
  nombre: string;
  descripcion?: string | null;
  fechaInicio: string;
  fechaTermino: string;
  duracionDias?: number | null;
  estado: EstadoActividad;
  avanceFisico: number;
  presupuesto?: number | null;
  costoReal?: number | null;
  esCritica: boolean;
  predecesoras: DependenciaRef[];
  sucesoras: DependenciaRef[];
}

export interface ResultadoRutaCritica {
  duracionTotalDias: number;
  actividades: {
    id: string;
    inicioTemprano: number;
    finTemprano: number;
    inicioTardio: number;
    finTardio: number;
    holgura: number;
    esCritica: boolean;
  }[];
}
