const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  actualizar,
  eliminar,
  crearDependencia,
  eliminarDependencia,
  registrarAvance,
} = require("../controllers/actividadController");

const router = Router();
router.use(requireAuth);

router.put("/:id", actualizar);
router.delete("/:id", eliminar);
router.post("/:id/avances", registrarAvance);

router.post("/dependencias", crearDependencia);
router.delete("/dependencias/:id", eliminarDependencia);

module.exports = router;
