import type { Response } from "express";
import type { AuthRequest } from "../middleware/AuthMiddleware.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from 'bcrypt';

export async function ListarUsuario(req: AuthRequest, res: Response) {
    try {
        const listar = await prisma.pessoa.findMany({
            where: { cargo: 'USUARIO' },
            omit:{senha:true}
        });
        res.status(200).json(listar);
    } catch (error) {
        res.status(500).json({error: "Falha ao listar usuários"});
    }
}

export async function PesquisaNomeUsuario(req: AuthRequest, res: Response) {
    try {
        const { nome_completo } = req.query;

        if(!nome_completo || typeof nome_completo !== 'string'){
            return res.status(400).json({error: "Parâmetro Inválido."});
        }

        const pesquisa = await prisma.pessoa.findMany({
            where: {
                nome_completo: { contains: nome_completo }, 
                cargo: 'USUARIO'
            },
            omit:{senha:true}
        });

        res.status(200).json(pesquisa);
    } catch (error) {
        res.status(500).json({error: "Falha ao listar usuários pela pesquisa"});
    }
}

export async function CriarUsuario(req: AuthRequest, res: Response) {
    try {
        // Atenção: Schema obriga setor_id E especialidade_id
        const { nome_completo, cpf, email, telefone, setor_id, especialidade_id, senha } = req.body;

        if(!nome_completo || !cpf || !email || !telefone || !setor_id || !especialidade_id || !senha){
            return res.status(400).json({error: "Todos os dados são obrigatórios."});
        }

        // RF07: Validar unicidade
        const duplicado = await prisma.pessoa.findFirst({
            where: { OR: [{ cpf }, { email }] }
        });
        if (duplicado) {
            if (duplicado.cpf === cpf) return res.status(409).json({ error: "CPF já cadastrado." });
            if (duplicado.email === email) return res.status(409).json({ error: "E-mail já cadastrado." });
        }

        const senha_hash = await bcrypt.hash(senha, 10);

        const criar = await prisma.pessoa.create({
            data:{
                nome_completo, 
                cpf, 
                email, 
                telefone, 
                setor_id: Number(setor_id), 
                especialidade_id: Number(especialidade_id),
                senha: senha_hash, 
                cargo: 'USUARIO'
            },
            omit:{senha:true}
        });

        res.status(201).json(criar);
    } catch (error) {
        res.status(500).json({error: "Falha ao criar usuário"});
    }
}

export async function AtualizarUsuario(req: AuthRequest, res: Response) {
    try {
        const idNumber = Number(req.params.id);
        if (Number.isNaN(idNumber)) return res.status(400).json({error: "ID inválido."});

        const { nome_completo, cpf, email, telefone, setor_id, especialidade_id, senha } = req.body;

        if(!nome_completo || !cpf || !email || !telefone || !setor_id || !especialidade_id || !senha){
            return res.status(400).json({error: "Todos os dados são obrigatórios."});
        }

        const usuarioExistente = await prisma.pessoa.findFirst({
            where: { id: idNumber, cargo: 'USUARIO' },
        });

        if(!usuarioExistente){
            return res.status(404).json({error: "Usuário não encontrado."});
        }

        // RF07: Validar unicidade excluindo o próprio usuário
        const duplicado = await prisma.pessoa.findFirst({
            where: { id: { not: idNumber }, OR: [{ cpf }, { email }] }
        });
        if (duplicado) {
            if (duplicado.cpf === cpf) return res.status(409).json({ error: "CPF já está em uso." });
            if (duplicado.email === email) return res.status(409).json({ error: "E-mail já está em uso." });
        }

        const senha_hash = await bcrypt.hash(senha, 10);

        const atualizar = await prisma.pessoa.update({
            where: { id: idNumber},
            data:{
                nome_completo, 
                cpf, 
                email, 
                telefone, 
                setor_id: Number(setor_id), 
                especialidade_id: Number(especialidade_id),
                senha: senha_hash, 
                cargo: 'USUARIO'
            },
            omit:{senha:true}
        });

        res.status(200).json(atualizar);
    } catch (error) {
        res.status(500).json({error: "Falha ao atualizar usuário"});
    }
}

export async function DeletarUsuario(req: AuthRequest, res: Response) {
    try {
        const idNumber = Number(req.params.id);
        if (Number.isNaN(idNumber)) return res.status(400).json({error: "ID inválido."});

        const usuarioExistente = await prisma.pessoa.findFirst({
            where: { id: idNumber, cargo: 'USUARIO' },
        });

        if(!usuarioExistente){
            return res.status(404).json({error: "Usuário não encontrado."});
        }

        const deletar = await prisma.pessoa.delete({
            where: { id: idNumber },
            omit:{senha:true}
        });

        res.status(200).json(deletar);
    } catch (error) {
        res.status(500).json({error: "Falha ao deletar usuário."});
    }
}