import publicacoesServices from "../Services/publicacoesServices";
import {Request, Response} from 'express'

class publicacoesControllers{

    async publicarPost(req: Request, res: Response){
        // Os dados descritivos continuam no body porque pertencem ao recurso publicado.
        const {tipo, nome_pet, especie, raca, idade_pet, porte, descricao,sexo,cidade,estado} = req.body
        // O usuário é obtido do token validado pelo middleware, não de um campo manipulável do body.
        const id_usuario = req.usuarioId
        // O arquivo é opcional durante a integração para permitir posts sem imagem.
        const foto = req.file?.filename || ""
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
        // A query é preferida para GET; o body continua aceito para compatibilidade.
        const id = (req.query.id as string) || req.body?.id
        const enviarDados = new publicacoesServices()
        const resposta = await enviarDados.visualizarPublicacaoUnico(id)
        return res.json(resposta)
    }

    async atualizarPublicacao(req: Request, res: Response){
        // O identificador continua no body para preservar o contrato de controle existente.
        const {id, tipo, nome_pet, especie, raca, idade_pet, porte, foto, sexo, cidade, estado,status, descricao} = req.body
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
            // O service usa este valor para impedir alterações em publicação de outro usuário.
            id_usuario: req.usuarioId
        })

        return res.json(resposta)
    }

    async deletarPublicacao(req: Request, res: Response){
        // O id permanece no body para manter compatibilidade com o contrato atual da rota DELETE.
        const {id} = req.body
        const enviarDados = new publicacoesServices()
        const resposta = await enviarDados.deletarPublicacao(id, req.usuarioId)
        return res.json(resposta)
    }
}

export default publicacoesControllers
