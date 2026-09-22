import prismaClient from "../prismaCliente";

interface cadFavorito {
    id_usuarios: string,
    id_publicacoes: string
}



interface deletarFavorito {
    id_usuarios: string,
    id_publicacoes: string,
    id: string
}

class favoritosServices {
    async criarFavorito({ id_usuarios, id_publicacoes }: cadFavorito) {

        const usuarioExiste = await prismaClient.usuarios.findFirst({
            where: {
                id: id_usuarios
            }
        })

        if (!usuarioExiste) {
            return ("Usuario não existe")
        }

        const publicacaoExiste = await prismaClient.publicacoes.findFirst({
            where: {
                id: id_publicacoes
            }
        })

        if (!publicacaoExiste) {
            return ("Publicação não existe")
        }

        const criarFavorito = await prismaClient.favoritos.create({
            data: {
                id_usuarios,
                id_publicacoes
            }
        })
    }

    async visualizarFavorito(id: string) {

        const resposta = await prismaClient.favoritos.findFirst({
            where: {
                id: id
            },
            select:{
                id: true
            }
        })
    
        return resposta

    }

    async deletarFavorito({ id_usuarios, id_publicacoes, id }: deletarFavorito) {

        const resposta = await prismaClient.favoritos.delete({
            where: {
                id: id
            }
        })

        return ("Publicação retirada dos favoritos")
    }
}
export default favoritosServices