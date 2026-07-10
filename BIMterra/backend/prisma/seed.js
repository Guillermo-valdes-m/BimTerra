const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@bimterra.cl";
const DEMO_PASSWORD = "demo1234";

async function main() {
  const existente = await prisma.usuario.findUnique({ where: { email: DEMO_EMAIL } });
  if (existente) {
    console.log(`El usuario demo (${DEMO_EMAIL}) ya existe. No se crea de nuevo.`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: "Usuario Demo",
      email: DEMO_EMAIL,
      passwordHash,
      rol: "JEFE_OBRA",
    },
  });

  const proyecto = await prisma.proyecto.create({
    data: {
      nombre: "Condominio Los Robles",
      descripcion: "Proyecto de demostración generado por el seed de BIMterra.",
      ubicacion: "Talca, Región del Maule",
      fechaInicio: new Date(),
      miembros: {
        create: { usuarioId: usuario.id, rol: "PROPIETARIO" },
      },
      actividades: {
        create: [
          {
            nombre: "Excavación y fundaciones",
            fechaInicio: new Date(),
            fechaTermino: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            duracionDias: 12,
            avanceFisico: 100,
            estado: "COMPLETADA",
          },
          {
            nombre: "Hormigonado de losa piso 1",
            fechaInicio: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            fechaTermino: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            duracionDias: 8,
            avanceFisico: 45,
            estado: "EN_CURSO",
          },
          {
            nombre: "Instalaciones eléctricas piso 1",
            fechaInicio: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
            fechaTermino: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
            duracionDias: 10,
            avanceFisico: 0,
            estado: "PENDIENTE",
          },
        ],
      },
    },
  });

  console.log("Usuario demo creado:");
  console.log(`  Correo:      ${DEMO_EMAIL}`);
  console.log(`  Contraseña:  ${DEMO_PASSWORD}`);
  console.log(`Proyecto demo creado: "${proyecto.nombre}" con 3 actividades de ejemplo.`);
}

main()
  .catch((err) => {
    console.error("Error al ejecutar el seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
