const { z } = require("zod");
const prisma = require("../lib/prisma");

const proyectoSchema = z.object({
  nombre: z.string().min(2, "El nombre del proyecto es obligatorio"),
  descripcion: z.string().optional(),
  ubicacion: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaTermino: z.string().optional(),
  presupuesto: z.number().optional(),
});

// Lista los proyectos donde el usuario autenticado es miembro
async function listar(req, res) {
  const proyectos = await prisma.proyecto.findMany({
    where: { miembros: { some: { usuarioId: req.usuario.id } } },
    orderBy: { creadoEn: "desc" },
    include: {
      _count: { select: { actividades: true, modelosBim: true } },
    },
  });
  return res.json(proyectos);
}

async function obtener(req, res) {
  const proyecto = await prisma.proyecto.findFirst({
    where: { id: req.params.id, miembros: { some: { usuarioId: req.usuario.id } } },
    include: {
      actividades: true,
      modelosBim: true,
      miembros: { include: { usuario: { select: { id: true, nombre: true, email: true } } } },
    },
  });
  if (!proyecto) {
    return res.status(404).json({ error: "Proyecto no encontrado." });
  }
  return res.json(proyecto);
}

async function crear(req, res) {
  const parsed = proyectoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const data = parsed.data;

  const proyecto = await prisma.proyecto.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      ubicacion: data.ubicacion,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
      fechaTermino: data.fechaTermino ? new Date(data.fechaTermino) : undefined,
      presupuesto: data.presupuesto,
      miembros: {
        create: { usuarioId: req.usuario.id, rol: "PROPIETARIO" },
      },
    },
  });

  return res.status(201).json(proyecto);
}

async function actualizar(req, res) {
  const parsed = proyectoSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const miembro = await prisma.miembroProyecto.findUnique({
    where: { usuarioId_proyectoId: { usuarioId: req.usuario.id, proyectoId: req.params.id } },
  });
  if (!miembro) {
    return res.status(404).json({ error: "Proyecto no encontrado." });
  }

  const data = parsed.data;
  const proyecto = await prisma.proyecto.update({
    where: { id: req.params.id },
    data: {
      ...data,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
      fechaTermino: data.fechaTermino ? new Date(data.fechaTermino) : undefined,
    },
  });

  return res.json(proyecto);
}

async function eliminar(req, res) {
  const miembro = await prisma.miembroProyecto.findUnique({
    where: { usuarioId_proyectoId: { usuarioId: req.usuario.id, proyectoId: req.params.id } },
  });
  if (!miembro || miembro.rol !== "PROPIETARIO") {
    return res.status(403).json({ error: "Solo el propietario puede eliminar el proyecto." });
  }

  await prisma.proyecto.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
