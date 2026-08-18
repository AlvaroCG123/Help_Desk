import type { Response } from "express";
import type { AuthRequest } from "../middleware/AuthMiddleware.js";
import { prisma } from "../../lib/prisma.js";

const STATUS_VALIDOS = ['ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO', 'FECHADO', 'CANCELADO'] as const;

// LISTAR CHAMADOS (RF04, RF11, RF14, RF15, RF16, RF17)
export async function ListarChamado(req: AuthRequest, res: Response) {
    try {
        const { status, prioridade_id, busca, ordenar_por } = req.query;
        let whereClause: any = {};

        // RF04: Bloqueio de área - Usuário só vê os dele
        if (req.cargo === 'USUARIO') {
            whereClause.usuario_id = req.pessoa_id;
        }

        // Filtros opcionais (RF16)
        if (status) whereClause.status = status;
        if (prioridade_id) whereClause.prioridade_id = Number(prioridade_id);
        
        // Busca (RF15)
        if (busca) {
            whereClause.OR = [
                { titulo: { contains: String(busca) } },
                { usuario: { nome_completo: { contains: String(busca) } } }
            ];
        }

        // RF17: Ordenação dinâmica (Data, Prioridade ou Status)
        let orderByClause: any = { aberto_em: 'desc' }; // RF11: Padrão do mais recente
        if (ordenar_por === 'prioridade') orderByClause = { prioridade_id: 'desc' };
        else if (ordenar_por === 'status') orderByClause = { status: 'asc' };

        const listar = await prisma.chamado.findMany({
            where: whereClause,
            orderBy: orderByClause, 
            include: {
                tecnico: { select: { nome_completo: true } },
                usuario: { select: { nome_completo: true } },
                prioridade: { select: { titulo: true } },
                categoria: { select: { titulo: true } }
            }
        });

        res.status(200).json(listar);
    } catch (error) {
        res.status(500).json({error: "Falha ao listar Chamados"});
    }
}

// DETALHE DO CHAMADO COM HISTÓRICO (RF12)
export async function DetalheChamado(req: AuthRequest, res: Response) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({error: "ID inválido"});

        const chamado = await prisma.chamado.findUnique({
            where: { id },
            include: {
                historico_chamados: {
                    include: { pessoa: { select: { nome_completo: true } } },
                    orderBy: { data_mudanca: 'desc' }
                }
            }
        });

        if (!chamado) return res.status(404).json({error: "Chamado não encontrado."});
        
        // RF04: Bloqueio
        if (req.cargo === 'USUARIO' && chamado.usuario_id !== req.pessoa_id) {
            return res.status(403).json({error: "Acesso negado: Este chamado não te pertence."});
        }

        res.status(200).json(chamado);
    } catch (error) {
        res.status(500).json({error: "Falha ao buscar detalhe do chamado."});
    }
}

// CRIAR CHAMADO (RF09, RF10)
export async function CriarChamado(req: AuthRequest, res: Response) {
    try {
        const usuario_id = req.pessoa_id;
        const { titulo, descricao, prioridade_id, categoria_id } = req.body;

        if(!usuario_id) return res.status(401).json({error:"Usuário não identificado."});
        if( !titulo  || !descricao  || !prioridade_id || !categoria_id ) {
            return res.status(400).json({error: "Todos os dados são obrigatórios."});
        }

        const criar = await prisma.chamado.create({
            data:{
                titulo, 
                descricao, 
                prioridade_id: Number(prioridade_id),
                usuario_id, 
                categoria_id: Number(categoria_id),
                aberto_em: new Date(), // RF10: Gerado pelo servidor explicitamente
                historico_chamados:{
                    create:{ pessoa_id: usuario_id, novo_status:'ABERTO' }
                }
            }
        });
        
        res.status(201).json(criar);
    } catch (error) {
        res.status(500).json({error: "Falha ao criar Chamado"});
    }
}

// TECNICO ASSUMIR CHAMADO (RF18, RF19, RF20)
export async function TecnicoResponsavel(req: AuthRequest, res: Response) {
    try {
        const idNumber = Number(req.params.id);
        const tecnico_id = req.pessoa_id;

        if(!tecnico_id) return res.status(401).json({error:"Técnico não identificado."});

        // RF20: Limite de 5 simultâneos
        const chamados_atendendo = await prisma.chamado.count({
            where: { tecnico_id: tecnico_id, status: 'EM_ATENDIMENTO' }
        });

        if(chamados_atendendo >= 5 ){
            return res.status(409).json({error: "Limite atingido: Podes ter no máximo 5 chamados em atendimento."});
        }

        const chamadoExistente = await prisma.chamado.findUnique({
            where: { id: idNumber },
            include: { tecnico: true } 
        });

        if(!chamadoExistente) return res.status(404).json({error: "Chamado não encontrado."});

        // RF19: Erro se já tem dono
        if(chamadoExistente.tecnico_id !== null && chamadoExistente.tecnico_id !== tecnico_id){
            return res.status(409).json({error: `Chamado já assumido por ${chamadoExistente.tecnico?.nome_completo}`});
        }

        const atualizado = await prisma.chamado.update({
            where: { id: idNumber },
            data: { 
                tecnico_id, 
                status: 'EM_ATENDIMENTO',
                historico_chamados: {
                    create: { chamado_id: idNumber, novo_status: 'EM_ATENDIMENTO', pessoa_id: tecnico_id }
                }
            }
        });

        res.status(200).json(atualizado);
    } catch (error) {
        res.status(500).json({error: "Falha ao assumir chamado"});
    }
}
// ATUALIZAR STATUS (RF21, RF22)
export async function AtualizarStatus(req: AuthRequest, res: Response) {
    try {
        const idNumber = Number(req.params.id);
        const tecnico_id = Number(req.pessoa_id); // <-- Conversão forçada para evitar que o Prisma rejeite se for string
        const { novo_status, solucao_problema } = req.body;

        if (Number.isNaN(idNumber)) return res.status(400).json({error: "ID do chamado inválido."});
        if (!novo_status || !STATUS_VALIDOS.includes(novo_status)) return res.status(400).json({error: "Status inválido."});

        // 1. Busca APENAS pelo ID (Garante o 404 correto se não existir)
        const chamadoExistente = await prisma.chamado.findUnique({
            where: { id: idNumber }
        });

        if (!chamadoExistente) {
            return res.status(404).json({error: "Chamado não encontrado."});
        }

        // 2. Validação de segurança: Verifica se o técnico é o dono do chamado (Garante o 403)
        if (chamadoExistente.tecnico_id !== tecnico_id) {
            return res.status(403).json({error: "Você não é o responsável por este chamado."});
        }

        // 3. Previne edição de chamados já finalizados
        if (chamadoExistente.status === 'FECHADO' || chamadoExistente.status === 'CANCELADO') {
            return res.status(409).json({error: "Chamado já encerrado. Não é possível alterar o status."});
        }

        // RF21: Fluxo de Status - Validação para não pular etapas
        const ordemStatus = { 'ABERTO': 1, 'EM_ATENDIMENTO': 2, 'RESOLVIDO': 3, 'FECHADO': 4 };
        const statusAtualIdx = ordemStatus[chamadoExistente.status as keyof typeof ordemStatus];
        const novoStatusIdx = ordemStatus[novo_status as keyof typeof ordemStatus];

        if (novoStatusIdx !== statusAtualIdx + 1 && novo_status !== 'CANCELADO') {
            return res.status(400).json({error: "Transição de status inválida. Siga a ordem correta."});
        }

        // RF22: Solução obrigatória no Resolvido
        if (novo_status === 'RESOLVIDO' && (!solucao_problema || !solucao_problema.trim())) {
            return res.status(400).json({error: "A solução do problema é obrigatória ao resolver."});
        }

        // 4. Executa a atualização
        const atualizar = await prisma.chamado.update({
            where: { id: idNumber },
            data: {
                status: novo_status, 
                solucao_problema: solucao_problema || chamadoExistente.solucao_problema,
                historico_chamados: {
                    create: { novo_status: novo_status, pessoa_id: tecnico_id } // <-- Sem necessidade do "as number" agora
                }
            }
        });

        res.status(200).json(atualizar);
    } catch (error) {
        console.error("Erro no AtualizarStatus:", error); // Sugestão: adicione esse log para ver no terminal se der outro tipo de erro
        res.status(500).json({error: "Falha ao atualizar status"});
    }
}

// CANCELAR CHAMADO (RF13)
export async function CancelarChamado(req: AuthRequest, res: Response) {
    try {
        const idNumber = Number(req.params.id);
        const chamado = await prisma.chamado.findUnique({ where: { id: idNumber } });

        if(!chamado) return res.status(404).json({error: "Chamado não encontrado."});

        if(req.cargo === 'USUARIO' && chamado.usuario_id !== req.pessoa_id) {
            return res.status(403).json({error: "Acesso negado."});
        }

        // RF13: Só pode cancelar se estiver ABERTO
        if (chamado.status !== 'ABERTO') {
            return res.status(409).json({error: "Só é possível cancelar chamados em aberto."}); // 409 Conflict se adequa melhor aqui
        }

        const cancelar = await prisma.chamado.update({
            where:{id: idNumber },
            data:{
                status: `CANCELADO`,
                historico_chamados:{ 
                    create:{ novo_status: 'CANCELADO', pessoa_id: req.pessoa_id as number }
                }
            }
        });

        res.status(200).json(cancelar);
    } catch (error) {
        res.status(500).json({error: "Falha ao cancelar chamado"});
    }
}