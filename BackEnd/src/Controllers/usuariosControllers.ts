import usuariosServices from "../Services/usuariosServices";
import { Request, Response } from 'express'

class usuariosControllers {

    async criarUsuarios(req: Request, res: Response) {
        const { nome, email, senha, telefone, foto_perfil, tipo } = req.body
        const enviarDadosServices = new usuariosServices()
        const resposta = await enviarDadosServices.criarUsuario({
            nome, email, senha, telefone, foto_perfil, tipo
        })
        return res.json(resposta)
    }
}

export default usuariosControllers