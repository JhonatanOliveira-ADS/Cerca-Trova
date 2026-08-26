import { Request, Response } from "express";
import favoritosServices from "../Services/favoritosServices";

class favoritosControllers{
    
    async criarFavorito(req: Request, res: Response){
        const {id_usuarios, id_publicacoes} = req.body
        const enviarDados = new favoritosServices()
        const resposta = await enviarDados.criarFavorito({
            id_usuarios,
            id_publicacoes
        })
        return res.json(resposta)
    }


    async visualizarFavorito(req: Request, res: Response){
        const {id} = req.body
        const enviarDados = new favoritosServices()
        const resposta = await enviarDados.visualizarFavorito(id)
        return res.json(resposta)
    }


    async deletarFavorito(req: Request, res: Response){
        const {id} = req.body
        const enviarDados = new favoritosServices()
        const resposta = await enviarDados.deletarFavorito(id)
        return res.json(resposta)
    }
}

export default favoritosControllers