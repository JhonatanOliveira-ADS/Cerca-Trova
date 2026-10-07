import adminServices from "../../Services/adminServices/adminServices";
import { Request, Response } from "express";

export default class adminControllers{
    async criarAdmin(req: Request, res: Response){
        const { nome ,email, senha} = req.body
        const criar = new adminServices()
        const resposta = await criar.criarAdmin({
            nome,
            email,
            senha
        })
        return res.json(resposta)
    }
}

