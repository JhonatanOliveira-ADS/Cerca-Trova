import prismaClient from "../../prismaCliente";
import bcrypt, {compare} from 'bcryptjs'
import {sign} from 'jsonwebtoken'

interface logAdmin{
    email: string,
    senha: string
}

class LoginAdminServices{
    async logarAdmin({email, senha} : logAdmin){
        const emailExiste = await prismaClient.usuarios.findFirst({
            where:{
                email: email
            }
        })

        if(!emailExiste){
            throw new Error("Usuario ou senha incorretos")
        }

        const senhaCrypt = await compare(senha, emailExiste.senha)

        if(!senhaCrypt){
            throw new Error("Usuario ou senha incorretos")
        }

        const token = sign({
            id: emailExiste.id,
            nome: emailExiste.nome,
            email: emailExiste.email
        },
        process.env.JWT_SECRETO,
        {
            subject: emailExiste.id,
            expiresIn:"24h"
        }
    )

    return{
        id: emailExiste.id,
        nome: emailExiste.nome,
        email: emailExiste.email,
        token: token
    }

    }
}

export default LoginAdminServices