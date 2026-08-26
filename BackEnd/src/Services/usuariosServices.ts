import prismaClient from "../prismaCliente"

interface cadUsuario {
    nome: string
    email: string
    senha: string
    telefone: string
    foto_perfil: string
    tipo: "USUARIO" | "ONG"
}


interface altUsuario {
    id: string
    nome: string
    email: string
    senha: string
    telefone: string
    foto_perfil: string
    tipo: "USUARIO" | "ONG"
}

class usuariosServices {

    async criarUsuario({ nome, email, senha, telefone, foto_perfil, tipo }: cadUsuario) {
        const verificarEmail = await prismaClient.usuarios.findFirst({
            where: {
                email: email
            }
        })

        if (verificarEmail) {
            return ('Já existe um usuário cadastrado com esse E-mail')
        }

        const usuario = await prismaClient.usuarios.create({
            data: {
                nome: nome,
                email: email,
                senha: senha,
                telefone: telefone,
                foto_perfil: foto_perfil,
                tipo: tipo
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
        const visualizarDadosUnico = await prismaClient.usuarios.findFirst({
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
        return visualizarDadosUnico
    }


    async atualizarDados({ id, nome, email, senha, telefone, foto_perfil, tipo }: altUsuario) {
        const atualizarDados = await prismaClient.usuarios.update({
            where: {
                id: id
            },
            data: {
                id,
                nome,
                email,
                senha,
                telefone,
                foto_perfil,
                tipo
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
        return deletarDadosUsuarios
    }
}


export default usuariosServices
