 import usuariosServices from "../Services/usuariosServices";
 import { Request, Response } from "express";


class usuariosControllers {

    async criarUsuarios(req: Request, res: Response){
        const {nome,email,senha, telefone} = req.body
        // O arquivo é opcional: contas podem ser criadas sem foto de perfil.
        const foto_perfil = req.file?.filename || null
        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.criarUsuario({
            nome,email,senha, telefone,foto_perfil
        })
        return res.json(resposta)
    }

    async visualizarDadosGeral(req: Request, res: Response){
        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.visualizarDadosGeral()
        return res.json(resposta)
    }

    async visualizarDadosUnico (req: Request, res: Response){
        // O perfil consultado é o usuário autenticado, não um id arbitrário do body.
        const id = req.usuarioId
        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.visualizarDadosUnico(id)
        return res.json(resposta) 
    }

    async atualizarDadosUsuario(req: Request, res: Response){
        // Dados editáveis vêm do body; o id é derivado da sessão autenticada.
        const {nome, email, telefone, foto_perfil: fotoInformada} = req.body
        /* O endpoint usa upload.fields para receber avatar e capa no mesmo formulário. */
        const arquivos = req.files as {
            [campo: string]: Express.Multer.File[]
        } | undefined
        const foto_perfil = arquivos?.avatar?.[0]?.filename || req.file?.filename || fotoInformada
        const foto_capa = arquivos?.capa?.[0]?.filename
        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.atualizarDados({
            id: req.usuarioId,
            nome,
            email,
            telefone,
            foto_perfil,
            foto_capa
        })
        return res.json(resposta)
    }


    /* Recebe a foto de perfil no campo file, seguindo o padrão das outras rotas. */
    async atualizarFotoPerfil(req: Request, res: Response){
        if (!req.file) {
            return res.status(400).json({ mensagem: "Envie uma imagem no campo file." })
        }

        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.atualizarFotoPerfil(req.usuarioId, req.file.filename)
        return res.json(resposta)
    }

    /* Recebe a capa no campo file, seguindo o mesmo padrão do Multer. */
    async atualizarFotoCapa(req: Request, res: Response){
        if (!req.file) {
            return res.status(400).json({ mensagem: "Envie uma imagem no campo file." })
        }

        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.atualizarFotoCapa(req.usuarioId, req.file.filename)
        return res.json(resposta)
    }

    async deletarUsuario(req: Request, res: Response){
        const enviarDados = new usuariosServices()
        const resposta = await enviarDados.deletarDadosUsuarios(req.usuarioId)
        return res.json(resposta)
    }


}

 export default usuariosControllers
