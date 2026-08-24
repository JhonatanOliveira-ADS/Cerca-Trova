import { data } from "react-router-dom"
import prismaClient from "../prismaCliente"

interface cadUsuario{
    id: string
    email: string
    senha: string
    telefone: string
    verificado: boolean
}


interface altUsuario{
    id: string,
    email: string,
    senha: string,
    telefone: string,
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

        await prismaClient.usuarios.create({
            data:{
                id: id,
                email: email,
                senha: senha,
                telefone:telefone,
                verificado: false
            }
        })
    }

    async visualizarDadosGeral(){
        const visualizar = await prismaClient.usuarios.get({
            select:{
                id: true,
                email: true,
                senha: true,
                telefone: true,
                verificado: true 
            }
        })
    }


    async visualizarDadosUnico(id: string){
        const visualizarDadosUnico = await prismaClient.usuarios.findFirst({
            where:{
                id:id
            },
            select:{
                email: true,
                senha: true,
                telefone: true,
                verificado: true
            }
        })
    }


    async atualizarDados({id, email, senha, telefone, verificado}: altUsuario){
        const atualizarDados = await prismaClient.usuarios.PUT({
            where:{
                id: id
            },
            data:{
                email,
                senha,
                telefone,
                verificado
            }
        })
    }


    async deletarDadosUsuarios(id: string){
        const deletarDadosUsuarios = await prismaClient.usuarios.DELETE({
            where:{
                id:id
            }
        }) 
    }
}


export default usuariosServices