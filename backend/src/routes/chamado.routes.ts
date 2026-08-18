import { Router } from "express";
import { ListarChamado, DetalheChamado, CriarChamado, TecnicoResponsavel, AtualizarStatus, CancelarChamado } from "../controller/chamado.controller.js";
import { AuthMiddleware, CargoPermitido } from "../middleware/AuthMiddleware.js";

const router = Router();

router.use(AuthMiddleware);

// Buscas e Listagens
router.get("/", CargoPermitido(['TECNICO', 'USUARIO']), ListarChamado);
router.get("/:id", CargoPermitido(['TECNICO', 'USUARIO']), DetalheChamado);

// Criação
router.post("/", CargoPermitido(['USUARIO']), CriarChamado);

// Ações específicas representadas por substantivos (Sub-recursos)
router.patch("/:id/tecnico", CargoPermitido(['TECNICO']), TecnicoResponsavel);
router.patch("/:id/status", CargoPermitido(['TECNICO']), AtualizarStatus);
router.patch("/:id/cancelamento", CargoPermitido(['USUARIO']), CancelarChamado);

export default router;