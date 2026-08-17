import type { Response } from "express";
import type { AuthRequest } from "../middleware/AuthMiddleware.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from 'bcrypt'

//LISTAGEM DOS USUARIOS
export async function ListarUsuario(req: AuthRequest, res: Response) {
    try {
        const listar = await prisma.pessoa.findMany({
            where: { cargo: 'USUARIO' }, //CHAMA O CARGO PARA ENCONTRAR SOMENTE USUARIOS
            omit:{senha:true}
        })

        res.status(200).json(listar)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar usuarios"})
    }
}

//PESQUISA POR NOME DO USUARIO
export async function PesquisaNomeUsuario(req: AuthRequest, res: Response) {
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
                }, cargo:'USUARIO'
            },
            omit:{senha:true}
        })

        res.status(200).json(pesquisa)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar usuarios pela pesquisa"})
    }
}

//CRIAÇAO DO USUARIO
export async function CriarUsuario(req: AuthRequest, res: Response) {
    try {
        const { nome_completo, cpf, email, telefone, setor, senha } = req.body

        if( !nome_completo  || !cpf  || !email  || !telefone  || !setor  || !senha ){
            res.status(400).json({error: "Todos os dados são obrigatório."})
            return
        }

        const senha_hash = await bcrypt.hash(senha, 10)

        const criar = await prisma.pessoa.create({
            data:{
                nome_completo, cpf, email, telefone, setor, senha: senha_hash, cargo: 'USUARIO'
            },
            omit:{senha:true}
        })

        res.status(200).json(criar)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar usuario"})
    }
}

//AQUI ATUALIZA OS DADOS DO USUARIO
export async function AtualizarUsuario(req: AuthRequest, res: Response) {
    try {
        const {id} = req.params

        if(!id){
            res.status(401).json({error:"id invalido."})
            return
        }

        const { nome_completo, cpf, email, telefone, setor, senha } = req.body

        if( !nome_completo  || !cpf  || !email  || !telefone  || !setor  || !senha ){
            res.status(400).json({error: "Todos os dados são obrigatório."})
            return
        }

        const senha_hash = await bcrypt.hash(senha, 10)

        const atualizar = await prisma.pessoa.update({
            where: { id: Number(id)},
            data:{
                nome_completo, cpf, email, telefone, setor, senha:senha_hash, cargo: 'USUARIO'
            },
            omit:{senha:true}
        })

        res.status(200).json(atualizar)
    } catch (error) {
        res.status(500).json({error: "Falha ao litar usuarios"})
    }
}

// CONTROLLER PARA DELETAR OS DADOS DO USUARIO
export async function DeletarUsuario(req: AuthRequest, res: Response) {
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
        res.status(500).json({error: "Falha ao deletar usuario."})
    }
}