 import usuariosServices from "../Services/usuariosServices";
 import { Request, Response } from "express";


class usuariosControllers {

    async criarUsuarios(req: Request, res: Response){
        const {nome,email,senha, telefone,foto_perfil,tipo} = req.body
        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.criarUsuario({
            nome,email,senha, telefone,foto_perfil,tipo
        })
        return res.json(resposta)
    }

    async visualizarDadosGeral(req: Request, res: Response){
        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.visualizarDadosGeral()
        return res.json(resposta)
    }

    async visualizarDadosUnico (req: Request, res: Response){
        const {id} = req.body
        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.visualizarDadosUnico(id)
        return res.json(resposta) 
    }

    async atualizarDadosUsuario(req: Request, res: Response){
        
    }


    async deletarUsuario(req: Request, res: Response){
        const {id} = req.body
        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.deletarDadosUsuarios(id)
        return res.json(resposta)
    }


}

 export default usuariosControllers
