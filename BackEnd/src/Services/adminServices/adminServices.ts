import prismaClient from "../../prismaCliente";
import { hash } from "bcryptjs";

interface criarAdmin{
    email: string,
    senha: string,
    nome: string
}

export default class adminServices{
    async criarAdmin ({email, senha, nome}: criarAdmin){
        const criar = await prismaClient.admin.create({
            data:{
                nome: nome,
                email: email,
                senha: senha
            }
        })
        return criar
    }

    

    
}
