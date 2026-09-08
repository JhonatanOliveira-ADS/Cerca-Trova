import prismaClient from "../../prismaCliente";
import bcrypt, {compare} from 'bcryptjs'
import {sign} from 'jsonwebtoken'

interface logONG{
    email: string,
    senha: string
}

class LoginONGServices{
    async logarONG({email, senha}: logONG){
        const emailExiste = await prismaClient.ongs.findFirst({
            where:{
                email:email
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
        token
    }
    }
}

export default LoginONGServices