import e from "express";
import prismaClient from "../prismaCliente";

interface cadOng {
    id_usuario: string
    nome: string
    descricao: string
    foto: string
    cidade: string
    estado: string
    telefone: string
    instagram: string
    site: string
}

class ongsServices {
    async criarOng({ id_usuario, nome, descricao, foto, cidade, estado, telefone, instagram, site }: cadOng) {
        const verificarOng = await prismaClient.ongs.findFirst({
            where: {
                id_usuario: id_usuario
            }
        })
        if (verificarOng) {
            return "Esse usuário já possui um perfil de ONG"
        }
        const ong = await prismaClient.ongs.create({
            data: {
                id_usuario,
                nome,
                descricao,
                foto,
                cidade,
                estado,
                telefone,
                instagram,
                site
            }
        })
        return ong
    }
    
}
export default ongsServices