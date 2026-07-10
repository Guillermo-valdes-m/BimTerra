const { z } = require("zod");
const prisma = require("../lib/prisma");

const actividadSchema = z.object({
  nombre: z.string().min(2, "El nombre de la actividad es obligatorio"),
  descripcion: z.string().optional(),
  fechaInicio: z.string(),
  fechaTermino: z.string(),
  presupuesto: z.number().optional(),
});

// Verifica que el usuario autenticado sea miembro del proyecto dueño de la actividad
async function verificarAccesoProyecto(proyectoId, usuarioId) {
  const miembro = await prisma.miembroProyecto.findUnique({
    where: { usuarioId_proyectoId: { usuarioId, proyectoId } },
  });
  return Boolean(miembro);
}

async function listarPorProyecto(req, res) {
  const { proyectoId } = req.params;
  const tieneAcceso = await verificarAccesoProyecto(proyectoId, req.usuario.id);
  if (!tieneAcceso) return res.status(404).json({ error: "Proyecto no encontrado." });

  const actividades = await prisma.actividad.findMany({
    where: { proyectoId },
    orderBy: { fechaInicio: "asc" },
    include: {
      predecesoras: { select: { id: true, predecesoraId: true, tipo: true } },
      sucesoras: { select: { id: true, sucesoraId: true, tipo: true } },
    },
  });
  return res.json(actividades);
}

async function crear(req, res) {
  const { proyectoId } = req.params;
  const tieneAcceso = await verificarAccesoProyecto(proyectoId, req.usuario.id);
  if (!tieneAcceso) return res.status(404).json({ error: "Proyecto no encontrado." });

  const parsed = actividadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const data = parsed.data;

  const inicio = new Date(data.fechaInicio);
  const termino = new Date(data.fechaTermino);
  if (termino < inicio) {
    return res.status(400).json({ error: "La fecha de término no puede ser anterior al inicio." });
  }
  const duracionDias = Math.max(1, Math.round((termino - inicio) / (1000 * 60 * 60 * 24)));

  const actividad = await prisma.actividad.create({
    data: {
      proyectoId,
      nombre: data.nombre,
      descripcion: data.descripcion,
      fechaInicio: inicio,
      fechaTermino: termino,
      duracionDias,
      presupuesto: data.presupuesto,
    },
  });

  return res.status(201).json(actividad);
}

async function actualizar(req, res) {
  const { id } = req.params;
  const actividadExistente = await prisma.actividad.findUnique({ where: { id } });
  if (!actividadExistente) return res.status(404).json({ error: "Actividad no encontrada." });

  const tieneAcceso = await verificarAccesoProyecto(actividadExistente.proyectoId, req.usuario.id);
  if (!tieneAcceso) return res.status(404).json({ error: "Actividad no encontrada." });

  const parsed = actividadSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const data = parsed.data;

  const inicio = data.fechaInicio ? new Date(data.fechaInicio) : actividadExistente.fechaInicio;
  const termino = data.fechaTermino ? new Date(data.fechaTermino) : actividadExistente.fechaTermino;
  const duracionDias = Math.max(1, Math.round((termino - inicio) / (1000 * 60 * 60 * 24)));

  const actividad = await prisma.actividad.update({
    where: { id },
    data: {
      ...data,
      fechaInicio: inicio,
      fechaTermino: termino,
      duracionDias,
    },
  });

  return res.json(actividad);
}

async function eliminar(req, res) {
  const { id } = req.params;
  const actividadExistente = await prisma.actividad.findUnique({ where: { id } });
  if (!actividadExistente) return res.status(404).json({ error: "Actividad no encontrada." });

  const tieneAcceso = await verificarAccesoProyecto(actividadExistente.proyectoId, req.usuario.id);
  if (!tieneAcceso) return res.status(404).json({ error: "Actividad no encontrada." });

  await prisma.actividad.delete({ where: { id } });
  return res.status(204).send();
}

// ---------- Dependencias ----------

const dependenciaSchema = z.object({
  predecesoraId: z.string(),
  sucesoraId: z.string(),
  tipo: z.enum(["FS", "SS", "FF", "SF"]).default("FS"),
});

async function crearDependencia(req, res) {
  const parsed = dependenciaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { predecesoraId, sucesoraId, tipo } = parsed.data;

  if (predecesoraId === sucesoraId) {
    return res.status(400).json({ error: "Una actividad no puede depender de sí misma." });
  }

  const [predecesora, sucesora] = await Promise.all([
    prisma.actividad.findUnique({ where: { id: predecesoraId } }),
    prisma.actividad.findUnique({ where: { id: sucesoraId } }),
  ]);
  if (!predecesora || !sucesora || predecesora.proyectoId !== sucesora.proyectoId) {
    return res.status(400).json({ error: "Las actividades deben pertenecer al mismo proyecto." });
  }
  const tieneAcceso = await verificarAccesoProyecto(predecesora.proyectoId, req.usuario.id);
  if (!tieneAcceso) return res.status(404).json({ error: "Proyecto no encontrado." });

  try {
    const dependencia = await prisma.dependenciaActividad.create({
      data: { predecesoraId, sucesoraId, tipo },
    });
    return res.status(201).json(dependencia);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Esa dependencia ya existe." });
    }
    throw err;
  }
}

async function eliminarDependencia(req, res) {
  const { id } = req.params;
  const dependencia = await prisma.dependenciaActividad.findUnique({
    where: { id },
    include: { predecesora: true },
  });
  if (!dependencia) return res.status(404).json({ error: "Dependencia no encontrada." });

  const tieneAcceso = await verificarAccesoProyecto(dependencia.predecesora.proyectoId, req.usuario.id);
  if (!tieneAcceso) return res.status(404).json({ error: "Dependencia no encontrada." });

  await prisma.dependenciaActividad.delete({ where: { id } });
  return res.status(204).send();
}

// ---------- Avance físico / económico ----------

const avanceSchema = z.object({
  porcentaje: z.number().min(0).max(100),
  costoReal: z.number().optional(),
  comentario: z.string().optional(),
});

async function registrarAvance(req, res) {
  const { id } = req.params;
  const actividad = await prisma.actividad.findUnique({ where: { id } });
  if (!actividad) return res.status(404).json({ error: "Actividad no encontrada." });

  const tieneAcceso = await verificarAccesoProyecto(actividad.proyectoId, req.usuario.id);
  if (!tieneAcceso) return res.status(404).json({ error: "Actividad no encontrada." });

  const parsed = avanceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { porcentaje, costoReal, comentario } = parsed.data;

  const [avance, actividadActualizada] = await prisma.$transaction([
    prisma.avance.create({
      data: { actividadId: id, usuarioId: req.usuario.id, porcentaje, comentario },
    }),
    prisma.actividad.update({
      where: { id },
      data: {
        avanceFisico: porcentaje,
        costoReal: costoReal !== undefined ? costoReal : undefined,
        estado: porcentaje >= 100 ? "COMPLETADA" : porcentaje > 0 ? "EN_CURSO" : "PENDIENTE",
      },
    }),
  ]);

  return res.status(201).json({ avance, actividad: actividadActualizada });
}

// ---------- Ruta crítica (CPM: forward pass + backward pass) ----------

async function calcularRutaCritica(req, res) {
  const { proyectoId } = req.params;
  const tieneAcceso = await verificarAccesoProyecto(proyectoId, req.usuario.id);
  if (!tieneAcceso) return res.status(404).json({ error: "Proyecto no encontrado." });

  const actividades = await prisma.actividad.findMany({
    where: { proyectoId },
    include: { predecesoras: true },
  });

  if (actividades.length === 0) {
    return res.json({ actividades: [] });
  }

  const porId = new Map(actividades.map((a) => [a.id, a]));
  const duracion = (a) => a.duracionDias || 1;

  // Orden topológico simple (asume que no hay ciclos, por diseño del formulario de dependencias)
  const sucesoresPorId = new Map(actividades.map((a) => [a.id, []]));
  for (const a of actividades) {
    for (const dep of a.predecesoras) {
      if (sucesoresPorId.has(dep.predecesoraId)) {
        sucesoresPorId.get(dep.predecesoraId).push(a.id);
      }
    }
  }

  const gradoEntrada = new Map(actividades.map((a) => [a.id, a.predecesoras.length]));
  const cola = actividades.filter((a) => a.predecesoras.length === 0).map((a) => a.id);
  const orden = [];
  const gradoTemp = new Map(gradoEntrada);
  while (cola.length > 0) {
    const actualId = cola.shift();
    orden.push(actualId);
    for (const sucesorId of sucesoresPorId.get(actualId) || []) {
      gradoTemp.set(sucesorId, gradoTemp.get(sucesorId) - 1);
      if (gradoTemp.get(sucesorId) === 0) cola.push(sucesorId);
    }
  }
  // Si quedó alguna actividad fuera (ciclo o dependencia cruzada rara), se agrega al final
  for (const a of actividades) if (!orden.includes(a.id)) orden.push(a.id);

  // Forward pass: inicio/término más temprano (en días desde el inicio del proyecto)
  const esTemprano = new Map();
  const efTemprano = new Map();
  for (const id of orden) {
    const a = porId.get(id);
    const predecesorasIds = a.predecesoras.map((d) => d.predecesoraId);
    const inicioTemprano = predecesorasIds.length
      ? Math.max(...predecesorasIds.map((pid) => efTemprano.get(pid) ?? 0))
      : 0;
    esTemprano.set(id, inicioTemprano);
    efTemprano.set(id, inicioTemprano + duracion(a));
  }

  const duracionTotalProyecto = Math.max(...orden.map((id) => efTemprano.get(id)));

  // Backward pass: inicio/término más tardío
  const lsTardio = new Map();
  const lfTardio = new Map();
  for (const id of [...orden].reverse()) {
    const a = porId.get(id);
    const sucesoresIds = sucesoresPorId.get(id) || [];
    const finTardio = sucesoresIds.length
      ? Math.min(...sucesoresIds.map((sid) => lsTardio.get(sid) ?? duracionTotalProyecto))
      : duracionTotalProyecto;
    lfTardio.set(id, finTardio);
    lsTardio.set(id, finTardio - duracion(a));
  }

  // Holgura = tiempo tardío - tiempo temprano. Holgura 0 => actividad crítica.
  const resultado = orden.map((id) => {
    const holgura = lsTardio.get(id) - esTemprano.get(id);
    return {
      id,
      inicioTemprano: esTemprano.get(id),
      finTemprano: efTemprano.get(id),
      inicioTardio: lsTardio.get(id),
      finTardio: lfTardio.get(id),
      holgura,
      esCritica: holgura === 0,
    };
  });

  // Persiste el flag esCritica en cada actividad
  await prisma.$transaction(
    resultado.map((r) =>
      prisma.actividad.update({ where: { id: r.id }, data: { esCritica: r.esCritica } })
    )
  );

  return res.json({ duracionTotalDias: duracionTotalProyecto, actividades: resultado });
}

module.exports = {
  listarPorProyecto,
  crear,
  actualizar,
  eliminar,
  crearDependencia,
  eliminarDependencia,
  registrarAvance,
  calcularRutaCritica,
};
