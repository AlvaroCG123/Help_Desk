import type { Response } from "express";
import type { AuthRequest } from "../middleware/AuthMiddleware.js";
import { prisma } from "../../lib/prisma.js";

const STATUS_VALIDOS = ['ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO', 'FECHADO', 'CANCELADO'] as const;

// LISTAR CHAMADOS 
export async function ListarChamado(req: AuthRequest, res: Response) {
    try {
        const listar = await prisma.chamado.findMany({}) 

        res.status(200).json(listar)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar Chamados"})
    }
}

//PESQUISAR O CHAMADO PELO TITULO QUE O USUARIO DEU
export async function PesquisaNomeChamado(req: AuthRequest, res: Response) {
    try {
        const { titulo } = req.query

        if(!titulo || typeof titulo !== 'string'){
            res.status(400).json({error: "Parametro Invalido."})
            return
        }

        const pesquisa = await prisma.chamado.findMany({
            where: {
                titulo:{
                    contains: titulo
                }
            }
        })

        res.status(200).json(pesquisa)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar Chamados pela pesquisa"})
    }
}

//CONTROLLER PARA USUARIO CRIAR O CHAMADO
export async function CriarChamado(req: AuthRequest, res: Response) {
    try {
        const usuario_id = req.pessoa_id

        if(!usuario_id){
            res.status(401).json({error:"usuario não identificado."})
            return
        }

        const { titulo, descricao, prioridade_id, categoria_id } = req.body
        const prioridadeIdNumber = Number(prioridade_id)
        const categoriaIdNumber = Number(categoria_id)

        if( !titulo  || !descricao  || !prioridade_id || !categoria_id ){
            res.status(400).json({error: "Todos os dados são obrigatório."})
            return
        }

        if (Number.isNaN(prioridadeIdNumber) || Number.isNaN(categoriaIdNumber)) {
            res.status(400).json({error: "prioridade_id ou categoria_id inválido."})
            return
        }

        const criar = await prisma.chamado.create({
            data:{
                titulo,
                descricao,
                prioridade_id: prioridadeIdNumber,
                usuario_id,
                categoria_id: categoriaIdNumber,
                historico_chamados:{
                    create:{
                        pessoa_id: usuario_id,
                        novo_status:'ABERTO'
                    }
                }
            }
        })

        res.status(200).json(criar)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar Chamado"})
    }
}

// CONTROLLER PARA TECNICO ASSUMIR CHAMADO
export async function TecnicoResponsavel(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params
        const tecnico_id = req.pessoa_id // PEGA O ID DO TECNICO PELO AUTHREQUEST DO MIDDLEWARE
        const idNumber = Number(id)

        if(!id){
            res.status(400).json({error:"chamado não identificado."})
            return
        }

        if(Number.isNaN(idNumber)){
            res.status(400).json({error:"id do chamado inválido."})
            return
        }

        if(!tecnico_id){
            res.status(401).json({error:"tecnico não identificado."}) //VE SE ACHO O ID DO TECNICO PRA BOTAR NO HISTORICO E ADCIONAR COMO RESPONSAVEL DO CHAMADO
            return
        }

        //AQUI CONTA QUANTOS CHAMADOS A PESSOA TEM EM ATENDIMENDO PORQUE SÓ PODE TER NO MAXIMO 5
        const chamados_atendendo = await prisma.chamado.count(
        {where: {
            tecnico_id: tecnico_id,
            status: 'EM_ATENDIMENTO'
        }}
        )

        //VALIDAÇÃO DE NO MAXIMO 5 CHAMADOS POR TECNICO
        if(chamados_atendendo >= 5 ){
            res.status(409).json({error: "maximo de chamados já atendidos."})
            return
        }

        const chamadoExistente = await prisma.chamado.findUnique({
            where: { id: idNumber },
            select: { id: true, tecnico_id: true }
        })

        if(!chamadoExistente){
            res.status(404).json({error: "Chamado não encontrado."})
            return
        }

        if(chamadoExistente.tecnico_id !== null){
            res.status(409).json({error: "Chamado já atendido"})
            return
        }

        const atualizado = await prisma.chamado.updateMany({
            where: { id: idNumber, tecnico_id: null },
            data: { tecnico_id, status: 'EM_ATENDIMENTO' }
        })

        if(atualizado.count === 0){
            res.status(409).json({error: "Chamado já atendido"})
            return
        }

        await prisma.historico_chamado.create({
            data: {
                chamado_id: idNumber,
                novo_status: 'EM_ATENDIMENTO',
                pessoa_id: tecnico_id
            }
        })

        const tecnico_responsavel = await prisma.chamado.findUnique({
            where: { id: idNumber }
        })

        res.status(200).json(tecnico_responsavel)
    } catch (error) {
        res.status(500).json({error: "Falha ao assumir chamado"})
    }
}


//CONTROLLER PARA ATUALIZAR O STATUS DO CHAMADO
export async function AtualizarStatus(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params
        const tecnico_id = req.pessoa_id
        const idNumber = Number(id)
        const { novo_status, solucao_problema } = req.body

        if(!tecnico_id){
            res.status(401).json({error:"usuario não identificado."})
            return
        }

        if(!id){
            res.status(400).json({error:"chamado não identificado."})
            return
        }

        if(Number.isNaN(idNumber)){
            res.status(400).json({error:"id do chamado inválido."})
            return
        }

        if(!novo_status){
            res.status(400).json({error: "novo_status é obrigatório."})
            return
        }

        if(!STATUS_VALIDOS.includes(novo_status)){
            res.status(400).json({error: "novo_status inválido."})
            return
        }

        //SE O STATUS JA ESTIVER COMO RESOLVIDO ELE BLOQUEIA SE NAO TIVER UM TEXTO DE SOLUÇAO DAQUELE PROBLEMA
        if(novo_status === 'RESOLVIDO' && (!solucao_problema || !String(solucao_problema).trim())){
            res.status(400).json({error: "obrigatória solução do problema."})
            return
        }

        const chamadoExistente = await prisma.chamado.findFirst({
            where: { id: idNumber, tecnico_id }
        })

        if(!chamadoExistente){
            res.status(403).json({error: "Você não pode atualizar este chamado."})
            return
        }

        const atualizar = await prisma.chamado.update({
            where:{id: idNumber},
            data:{
                tecnico_id, status: novo_status, solucao_problema: solucao_problema || undefined,
                historico_chamados:{
                    create:{
                        novo_status: novo_status,
                        pessoa_id: tecnico_id
                    }
                }
            }
        })

        res.status(200).json(atualizar)
    } catch (error) {
        res.status(500).json({error: "Falha ao atualizar status do chamado"})
    }
}

// AQUI CANCELA O CHAMADO CASO O USUARIO QUEIRA, ELE PODE CANCELAR A QUALQUER MOMENTOS
export async function CancelarChamado(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params
        const pessoa_id = req.pessoa_id
        const cargo = req.cargo
        const idNumber = Number(id)

        if(!pessoa_id){
            res.status(401).json({error:"usuario não identificado."})
            return
        }

        if(!cargo){
            res.status(403).json({error:"acesso negado: cargo não identificado."})
            return
        }

        if(!id){
            res.status(400).json({error:"chamado não identificado."})
            return
        }

        if(Number.isNaN(idNumber)){
            res.status(400).json({error:"id do chamado inválido."})
            return
        }

        const chamado = await prisma.chamado.findUnique({
            where: { id: idNumber },
            select: { id: true, usuario_id: true, tecnico_id: true }
        })

        if(!chamado){
            res.status(404).json({error: "Chamado não encontrado."})
            return
        }

        if(cargo === 'USUARIO' && chamado.usuario_id !== pessoa_id){
            res.status(403).json({error: "Você não pode cancelar este chamado."})
            return
        }

        if(cargo === 'TECNICO' && chamado.tecnico_id !== pessoa_id){
            res.status(403).json({error: "Você não pode cancelar este chamado."})
            return
        }

        const cancelar = await prisma.chamado.update({
            where:{id: idNumber },
            data:{
                status: `CANCELADO`,  //DEFINE O STATUS PARA CANCELADO
                historico_chamados:{ 
                    create:{
                        novo_status: 'CANCELADO',
                        pessoa_id
                    }
                }
            }
        })

        res.status(200).json(cancelar)
    } catch (error) {
        res.status(500).json({error: "Falha ao cancelar chamado"})
    }
}