import publicacoesServices from "../Services/publicacoesServices";
import {Request, Response} from 'express'

class publicacoesControllers{

    async publicarPost(req: Request, res: Response){
        const {tipo, nome_pet, especie, raca, idade_pet, porte, descricao,foto,sexo,cidade,estado, id_usuario} = req.body
        const enviarDados = new publicacoesServices()
        const resposta = await enviarDados.cadastrarPublicacao({
            tipo, 
            nome_pet,
            especie,
            raca,
            idade_pet,
            porte,
            descricao,
            foto,
            sexo,
            cidade,
            estado,
            id_usuario
        })

        return res.json(resposta)
    }

    async visualizarPublicacoes(req: Request, res: Response){
        const {id} = req.body
        const enviarDados = new publicacoesServices()
        const resposta = await enviarDados.visualizarPublicacaoUnico(id)
        return res.json(resposta)
    }

    async atualizarPublicacao(req: Request, res: Response){
        const {id, tipo, nome_pet, especie, raca, idade_pet, porte, foto, sexo, cidade, estado,status,id_usuario, descricao} = req.body
        const enviarDados = new publicacoesServices()
        const resposta = await enviarDados.atualizarPublicacao({
            id,
            tipo,
            nome_pet,
            especie,
            raca,
            idade_pet,
            porte,
            foto,
            sexo,
            cidade,
            estado,
            status,
            descricao,
            id_usuario
        })

        return res.json(resposta)
    }

    async deletarPublicacao(req: Request, res: Response){
        const {id} = req.body
        const enviarDados = new publicacoesServices()
        const resposta = await enviarDados.deletarPublicacao(id)
        return res.json(resposta)
    }
}

export default publicacoesControllers