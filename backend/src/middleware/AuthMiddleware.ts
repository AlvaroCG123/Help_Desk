import type { NextFunction, Request, Response } from "express";
import type { cargo } from "../../generated/prisma/enums.js";
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    pessoa_id?: number,
    cargo?: cargo
}

export function AuthMiddleware(req: AuthRequest, res: Response, next: NextFunction){
    const AuthHeader = req.headers.authorization

    if(!AuthHeader || !AuthHeader.startsWith("Bearer")){
        res.status(401).json({error: "Token expirado ou Invalido."})
        return
    }

    const token = AuthHeader.split(" ")[1]!

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string ) as {
            pessoa_id: number,
            cargo: cargo
        }

        req.cargo = payload.cargo
        req.pessoa_id = payload.pessoa_id

        next()
    } catch (error) {
        res.status(401).json({error: "Token expirado ou Invalido."})
    }
}

export function CargoPermitido(VerificarCargo: cargo[]){
return (req: AuthRequest, res: Response, next: NextFunction)=>{
    try {
        if(!req.cargo){
            res.status(403).json({error:"acesso negado: cargo não identificado."})
            return
        }

        if(!VerificarCargo.includes( req.cargo)){
            res.status(403).json({error:"acesso negado: cargo não tem acesso."})
            return
        }

        next()
    } catch (error) {
        res.status(401).json({error: "Token expirado ou Invalido."})
    }
}
}