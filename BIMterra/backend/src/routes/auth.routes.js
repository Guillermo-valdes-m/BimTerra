const { Router } = require("express");
const { registrar, iniciarSesion, perfil } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.post("/registro", registrar);
router.post("/login", iniciarSesion);
router.get("/perfil", requireAuth, perfil);

module.exports = router;
