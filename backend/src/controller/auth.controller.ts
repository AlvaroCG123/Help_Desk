import type { Response } from "express";
import type { AuthRequest } from "../middleware/AuthMiddleware.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export async function Login(req: AuthRequest, res: Response) {
    try {
        const { email, senha } = req.body //EMAIL E SENHA PARA O LOGIN

        if(!email || !senha){ //VALIDAÇAO SE A PESSOA ENVIOU O EMAIL E SENHA
            res.status(400).json({error: "email e senha obrigatórios."})
            return
        }

        const pessoa = await prisma.pessoa.findUnique({ // ENCONTRA A PESSOA
            where: {email}
        })

        if(!pessoa || !(await bcrypt.compare(senha, pessoa.senha))){ // SE NAO ENCONTROU OU A SENHA ESTIVER INVALIDA CAI AQUI
            res.status(401).json({error: "email ou senha inválidos."})
            return
        }

        const token = jwt.sign( //LOGIN DOS DADOS DO BODY(EMAIL E SENHA)
            {pessoa_id: pessoa.id, cargo: pessoa.cargo},
            process.env.JWT_SECRET as string,
            {expiresIn: "1d"} //TEMPO DE EXPIRAÇAO DO TOKEN NO CASO AQUI ESTA 1 DIA DE TOKEN
        )

        res.status(200).json({mensagem: "Login com sucesso", token, pessoa: { nome_completo: pessoa.nome_completo, cargo: pessoa.cargo, }})
    } catch (error) {
        res.status(500).json({error: "falha no servidor"})
    }
}