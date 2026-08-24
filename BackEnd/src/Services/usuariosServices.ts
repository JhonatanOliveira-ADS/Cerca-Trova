import prismaClient from "../prismaCliente"

interface cadUsuario{
    id: string
    email: string
    senha: string
    telefone: string
    verificado: boolean
}

class usuariosServices{

    async criarUsuario({id, email, senha, telefone, verificado}: cadUsuario){
        const verificarEmail = await prismaClient.usuarios.findFirst({
            email: email
        })

        if(verificarEmail){
            return('Já existe um usuário cadastrado com esse E-mail')
        }
    }
}


export default usuariosServices