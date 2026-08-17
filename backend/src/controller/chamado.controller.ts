import type { Response } from "express";
import type { AuthRequest } from "../middleware/AuthMiddleware.js";
import { prisma } from "../../lib/prisma.js";

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
            res.status(401).json({error: "Parametro Invalido."})
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

        const { titulo, descricao, prioridade, categoria_id } = req.body

        if( !titulo  || !descricao  || !prioridade || !categoria_id ){
            res.status(400).json({error: "Todos os dados são obrigatório."})
            return
        }

        const criar = await prisma.chamado.create({
            data:{
                titulo, descricao, prioridade, usuario_id, categoria_id,
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

        if(!id){
            res.status(401).json({error:"chamado não identificado."})
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

        const tecnico_responsavel = await prisma.chamado.update({
            where:{id: Number(id), tecnico_id: null},
            data:{
                tecnico_id, status:'EM_ATENDIMENTO',
                historico_chamados:{ //AQUI ADCIONA NA TABELA HISTORICO O QUE ACONTECEU DE MUDANCA NO CHAMADO
                    create:{
                        novo_status: 'EM_ATENDIMENTO',
                        pessoa_id: tecnico_id
                    }
                }
            }
        })

        res.status(200).json(tecnico_responsavel)
    } catch (error) {
        res.status(409).json({error: "Chamado já atendido"})
    }
}


//CONTROLLER PARA ATUALIZAR O STATUS DO CHAMADO
export async function AtualizarStatus(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params
        const tecnico_id = req.pessoa_id
        const { novo_status, solucao_problema } = req.body

        //SE O STATUS JA ESTIVER COMO RESOLVIDO ELE BLOQUEIA SE NAO TIVER UM TEXTO DE SOLUÇAO DAQUELE PROBLEMA
        if(novo_status === 'RESOLVIDO' && !solucao_problema){
            res.status(400).json({error: "obrigatória solução do problema."})
            return
        }

        if(!tecnico_id){
            res.status(401).json({error:"usuario não identificado."})
            return
        }

        if(!id){
            res.status(401).json({error:"chamado não identificado."})
            return
        }

        const atualizar = await prisma.chamado.update({
            where:{id: Number(id), tecnico_id: tecnico_id },
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
        const tecnico_id = req.pessoa_id
        const { novo_status } = req.body

        if(!tecnico_id){
            res.status(401).json({error:"usuario não identificado."})
            return
        }

        if(!id){
            res.status(401).json({error:"chamado não identificado."})
            return
        }

        const cancelar = await prisma.chamado.update({
            where:{id: Number(id) },
            data:{
                tecnico_id, status: `CANCELADO`,//DEFINE O STATUS PARA CANCELADO
                historico_chamados:{ 
                    create:{
                        novo_status: novo_status,
                        pessoa_id: tecnico_id
                    }
                }
            }
        })

        res.status(200).json(cancelar)
    } catch (error) {
        res.status(500).json({error: "Falha ao cancelar chamado"})
    }
}