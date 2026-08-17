import { Router } from "express";
import { AtualizarStatus, CancelarChamado, CriarChamado, ListarChamado, PesquisaNomeChamado, TecnicoResponsavel } from "../controller/chamado.controller.js";
import { AuthMiddleware, CargoPermitido } from "../middleware/AuthMiddleware.js";


const router = Router()

router.use(AuthMiddleware)
router.get("/listar", CargoPermitido(['TECNICO', 'USUARIO']), ListarChamado)
router.get("/pesquisa", CargoPermitido(['TECNICO']), PesquisaNomeChamado)
router.post("/criar", CargoPermitido(['TECNICO', 'USUARIO']), CriarChamado)
router.post("/responsavel/:id", CargoPermitido(['TECNICO']), TecnicoResponsavel)
router.patch("/atualizar/:id", CargoPermitido(['TECNICO']), AtualizarStatus)
router.patch("/cancelar/:id", CargoPermitido(['TECNICO', 'USUARIO']), CancelarChamado)

export default router