import { Request, Response } from "express";
import favoritosServices from "../Services/favoritosServices";

class favoritosControllers{
    
    async criarFavorito(req: Request, res: Response){
        // O cliente envia somente a publicação; o usuário vem do token autenticado.
        const {id_publicacoes} = req.body
        const enviarDados = new favoritosServices()
        const resposta = await enviarDados.criarFavorito({
            id_usuarios: req.usuarioId,
            id_publicacoes
        })
        return res.json(resposta)
    }


    async visualizarFavorito(req: Request, res: Response){
        // A consulta pode continuar recebendo body, mas a identidade vem do token.
        const enviarDados = new favoritosServices()
        const resposta = await enviarDados.visualizarFavorito(req.usuarioId)
        return res.json(resposta)
    }


    async deletarFavorito(req: Request, res: Response){
        const {id} = req.body
        const enviarDados = new favoritosServices()
        const resposta = await enviarDados.deletarFavorito(id, req.usuarioId)
        return res.json(resposta)
    }
}

export default favoritosControllers
