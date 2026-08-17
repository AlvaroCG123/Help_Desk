import { Router } from "express";
import { AtualizarUsuario, CriarUsuario, DeletarUsuario, ListarUsuario, PesquisaNomeUsuario } from "../controller/usuario.controller.js";
import { AuthMiddleware, CargoPermitido } from "../middleware/AuthMiddleware.js";
const router = Router()

router.use(AuthMiddleware)
router.get("/listar", CargoPermitido(['TECNICO']), ListarUsuario)
router.get("/pesquisa", CargoPermitido(['TECNICO']), PesquisaNomeUsuario)
router.post("/criar", CargoPermitido(['TECNICO']), CriarUsuario)
router.put("/atualizar/:id", CargoPermitido(['TECNICO']), AtualizarUsuario)
router.delete("/deletar/:id", CargoPermitido(['TECNICO']), DeletarUsuario)

export default router