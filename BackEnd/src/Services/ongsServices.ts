import { hash } from "bcryptjs";
import prismaClient from "../prismaCliente";

interface CadOngs {
    nome: string,
    email: string,
    senha: string,
    descricao: string,
    foto: string,
    cidade: string,
    estado: string,
    telefone: string,
    instagram: string,
    site: string

}

interface AltOngs {
    id: string,
    nome: string,
    email: string,
    descricao: string,
    foto: string,
    cidade: string,
    estado: string,
    telefone: string,
    instagram: string,
    site: string
}

class OngsServices {
    async criarOng({ nome, email, senha, descricao, foto, cidade, estado, telefone, instagram, site }: CadOngs) {
        const senhaHash = await hash(senha, 8)

        await prismaClient.ongs.create({
            data: {
                nome: nome,
                email: email,
                senha: senhaHash,
                descricao: descricao,
                foto: foto,
                cidade: cidade,
                estado: estado,
                telefone: telefone,
                instagram: instagram,
                site: site
            }
        })
        return ({ dados: 'Dados Salvo Com Sucesso' })
    }
    async visualizarONG() {
        const resposta = await prismaClient.ongs.findMany({
            select: {
                nome: true,
                email: true,
                descricao: true,
                foto: true,
                cidade: true,
                estado: true,
                telefone: true,
                instagram: true,
                site: true
            }
        })
        return resposta
    }
    async atualizarONG({ id, nome, email, descricao, foto, cidade, estado, telefone, instagram, site }: AltOngs) {
        await prismaClient.ongs.update({
            where: {
                id: id
            },
            data: {
                id: id,
                nome:nome ,
                email: email,
                descricao: descricao,
                foto: foto,
                cidade: cidade,
                estado: estado,
                telefone: telefone,
                instagram: instagram,
                site: site
            }
        })
        return ({ dados: 'Dados Alterados com Sucesso' })
    }
    async deletarOng(id: string) {
        const resposta = await prismaClient.ongs.delete({
            where: {
                id: id
            }
        })
        return ({ dados: 'Dados apagados com Sucesso' })
    }
}

export default OngsServices