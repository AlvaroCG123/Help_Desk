import { Router } from "express";
import { AtualizarTecnico, CriarTecnico, DeletarTecnico, ListarTecnico, PesquisaNomeTecnico } from "../controller/tecnico.controller.js";
import { AuthMiddleware, CargoPermitido } from "../middleware/AuthMiddleware.js";

const router = Router()

router.use(AuthMiddleware)
router.get("/listar", CargoPermitido(['TECNICO']), ListarTecnico)
router.get("/pesquisa", CargoPermitido(['TECNICO']), PesquisaNomeTecnico)
router.post("/criar", CargoPermitido(['TECNICO']), CriarTecnico)
router.put("/atualizar/:id", CargoPermitido(['TECNICO']), AtualizarTecnico)
router.delete("/deletar/:id", CargoPermitido(['TECNICO']), DeletarTecnico)

export default router