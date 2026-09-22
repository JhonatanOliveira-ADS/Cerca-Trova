import OngsServices from "../Services/ongsServices";
import { Request, Response } from "express";

class ongsControllers {
    async criarOng(req: Request, res: Response) {
        const { nome,email,senha,descricao, cidade, estado, telefone, instagram, site } = req.body
        const{ originalname, filename: foto} = req.file
        const enviarDadosServices = new OngsServices()
        const resposta = await enviarDadosServices.criarOng({
            nome,
            email,
            senha,
            descricao,
            foto,
            cidade,
            estado,
            telefone,
            instagram,
            site
        })
        return res.json(resposta)

    }

    async visualizarONG (req: Request, res: Response){
        const {id} = req.body
        const enviarDados = new OngsServices()
        const resposta = await enviarDados.visualizarONG()
        return res.json(resposta) 
    }
    async atualizarONG(req: Request, res: Response){
        const {id,nome,email,descricao,foto,cidade,estado,telefone,instagram,site} = req.body
        const enviarDados = new OngsServices()
        const resposta = await enviarDados.atualizarONG({
            id,
            nome,
            email,
            descricao,
            foto,
            cidade,
            estado,
            telefone,
            instagram,
            site
        })
        return res.json(resposta)
    }
    async deletarOng(req: Request, res: Response){
        const {id} = req.body
        const enviarDados = new OngsServices()
        const resposta = await enviarDados.deletarOng(id)
        return res.json(resposta)
    }
}


export default ongsControllers