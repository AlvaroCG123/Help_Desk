import { Router } from "express";
import { AtualizarUsuario, CriarUsuario, DeletarUsuario, ListarUsuario, PesquisaNomeUsuario } from "../controller/usuario.controller.js";
import { AuthMiddleware, CargoPermitido } from "../middleware/AuthMiddleware.js";
const router = Router()

router.use(AuthMiddleware)
router.get("/", CargoPermitido(['TECNICO']), ListarUsuario);
router.get("/busca", CargoPermitido(['TECNICO']), PesquisaNomeUsuario);
router.post("/", CargoPermitido(['TECNICO']), CriarUsuario);
router.put("/:id", CargoPermitido(['TECNICO']), AtualizarUsuario);
router.delete("/:id", CargoPermitido(['TECNICO']), DeletarUsuario);

export default router