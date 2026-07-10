const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
} = require("../controllers/proyectoController");
const {
  listarPorProyecto,
  crear: crearActividad,
  calcularRutaCritica,
} = require("../controllers/actividadController");

const router = Router();

router.use(requireAuth);

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

// Actividades y ruta crítica anidadas bajo el proyecto
router.get("/:proyectoId/actividades", listarPorProyecto);
router.post("/:proyectoId/actividades", crearActividad);
router.get("/:proyectoId/ruta-critica", calcularRutaCritica);

module.exports = router;
