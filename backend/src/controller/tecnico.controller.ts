import type { Response } from "express";
import type { AuthRequest } from "../middleware/AuthMiddleware.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from 'bcrypt'

// LISTA OS TECNICOS 
export async function ListarTecnico(req: AuthRequest, res: Response) {
    try {
        const listar = await prisma.pessoa.findMany({
            where: { cargo: 'TECNICO' }, //COMO USO A MESMA TABELA COMO PRINCIPAL ACHO SE O CARGO FOR TECNICO
            omit:{senha:true} //OMITO A SENHA PARA NAO VAZAR NENHUM DADO DE SEGURANÇA
        })

        res.status(200).json(listar)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar tecnicos"})
    }
}

// PESQUISA POR NOME DOS TECNICOS 
export async function PesquisaNomeTecnico(req: AuthRequest, res: Response) {
    try {
        const { nome_completo } = req.query

        if(!nome_completo || typeof nome_completo !== 'string'){
            res.status(401).json({error: "Parametro Invalido."})
            return
        }

        const pesquisa = await prisma.pessoa.findMany({
            where: {
                nome_completo:{
                    contains: nome_completo
                }, cargo:'TECNICO'
            },
            omit:{senha:true}
        })

        res.status(200).json(pesquisa)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar tecnicos pela pesquisa"})
    }
}

//CRIAÇAO DE TECNICO COM A DIFERENÇA DE ESPECIALIDADE E NAO TEM TELEFONE
export async function CriarTecnico(req: AuthRequest, res: Response) {
    try {
        const { nome_completo, cpf, email, especialidade, senha } = req.body

        if( !nome_completo  || !cpf  || !email  || !especialidade  || !senha ){
            res.status(400).json({error: "Todos os dados são obrigatório."})
            return
        }

        const senha_hash = await bcrypt.hash(senha, 10) //HASH DA SENHA PARA ENCRIPTAR

        const criar = await prisma.pessoa.create({
            data:{
                nome_completo, cpf, email, especialidade, senha: senha_hash, cargo: 'TECNICO' //ENVIA OS DADOS E O HASH DA SENHA
            },
            omit:{senha:true}
        })

        res.status(200).json(criar)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar tecnico"})
    }
}

//ATUALIZAR DADOS DO TECNICO
export async function AtualizarTecnico(req: AuthRequest, res: Response) {
    try {
        const {id} = req.params

        if(!id){
            res.status(401).json({error:"tecnico não identificado."})
            return
        }
        const { nome_completo, cpf, email, especialidade, senha } = req.body

        if( !nome_completo  || !cpf  || !email  || !especialidade  || !senha ){
            res.status(400).json({error: "Todos os dados são obrigatório."})
            return
        }

        const senha_hash = await bcrypt.hash(senha, 10)

        const atualizar = await prisma.pessoa.update({
            where: { id: Number(id)},
            data:{
                nome_completo, cpf, email, especialidade, senha:senha_hash, cargo: 'TECNICO'
            },
            omit:{senha:true}
        })

        res.status(200).json(atualizar)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar tecnicos"})
    }
}

//DELETAR TECNICO
export async function DeletarTecnico(req: AuthRequest, res: Response) {
    try {
        const {id} = req.params

        if(!id){ //VALIDAÇAO SE ENCONTRA O USUARIO DO AUTHREQUEST
            res.status(401).json({error:"id invalido."})
            return
        }

        const deletar = await prisma.pessoa.delete({
            where: { id: Number(id) },
            omit:{senha:true}
        })

        res.status(200).json(deletar)
    } catch (error) {
        res.status(500).json({error: "Falha ao deletar tecnico."})
    }
}