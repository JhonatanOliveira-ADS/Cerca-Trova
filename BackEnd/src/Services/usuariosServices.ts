import prismaClient from "../prismaCliente"
import {hash} from 'bcryptjs'

interface cadUsuario {
    nome: string
    email: string
    senha: string
    telefone: string
    foto_perfil: string
}


interface altUsuario {
    id: string
    nome: string
    email: string
    telefone: string
    foto_perfil: string
}

class usuariosServices {

    async criarUsuario({ nome, email, senha, telefone, foto_perfil }: cadUsuario) {
        const verificarEmail = await prismaClient.usuarios.findFirst({
            where: {
                email: email
            }
        })

        if (verificarEmail) {
            return ('Já existe um usuário cadastrado com esse E-mail')
        }

        const senhaHash = await hash(senha, 8 )

        const usuario = await prismaClient.usuarios.create({
            data: {
                nome: nome,
                email: email,
                senha: senhaHash,
                telefone: telefone,
                foto_perfil: foto_perfil
            }
        })
        return usuario
    }
    async visualizarDadosGeral() {
        const visualizar = await prismaClient.usuarios.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                foto_perfil: true,
                tipo: true,
                verificado: true
            }
        })
        return visualizar
    }


    async visualizarDadosUnico(id: string) {
        const resposta = await prismaClient.usuarios.findFirst({
            where: {
                id: id
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                foto_perfil: true,
                tipo: true,
                verificado: true
            }
        })
        return resposta
    }


    async atualizarDados({ id, nome, email, telefone, foto_perfil }: altUsuario) {
        const atualizarDados = await prismaClient.usuarios.update({
            where: {
                id: id
            },
            data: {
                id,
                nome,
                email,
                telefone,
                foto_perfil,
            }
        })
        return atualizarDados
    }


    async deletarDadosUsuarios(id: string) {
        const deletarDadosUsuarios = await prismaClient.usuarios.delete({
            where: {
                id: id
            }
        })
        return ("Dados de usuário deletado")
    }
}


export default usuariosServices
