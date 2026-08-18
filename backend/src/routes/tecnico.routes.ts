import { Router } from "express";
import { AtualizarTecnico, CriarTecnico, DeletarTecnico, ListarTecnico, PesquisaNomeTecnico } from "../controller/tecnico.controller.js";
import { AuthMiddleware, CargoPermitido } from "../middleware/AuthMiddleware.js";

const router = Router()

router.use(AuthMiddleware)
router.get("/", CargoPermitido(['TECNICO']), ListarTecnico);
router.get("/busca", CargoPermitido(['TECNICO']), PesquisaNomeTecnico);
router.post("/", CargoPermitido(['TECNICO']), CriarTecnico);
router.put("/:id", CargoPermitido(['TECNICO']), AtualizarTecnico);
router.delete("/:id", CargoPermitido(['TECNICO']), DeletarTecnico);

export default router