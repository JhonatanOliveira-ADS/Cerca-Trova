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

        // Evita duplicar o mesmo favorito para o mesmo usuário e publicação.
        const favoritoExistente = await prismaClient.favoritos.findFirst({
            where: {
                id_usuarios,
                id_publicacoes
            }
        })

        if (favoritoExistente) {
            return favoritoExistente
        }

        const criarFavorito = await prismaClient.favoritos.create({
            data: {
                id_usuarios,
                id_publicacoes
            }
        })

        return criarFavorito
    }

    async visualizarFavorito(id_usuarios: string) {

        const resposta = await prismaClient.favoritos.findMany({
            where: {
                id_usuarios
            },
            include: {
                publicacao: true
            }
        })
    
        return resposta

    }

    async deletarFavorito(id: string, id_usuarios: string) {

        const favorito = await prismaClient.favoritos.findFirst({
            where: {
                id_usuarios,
                OR: [
                    { id },
                    { id_publicacoes: id }
                ]
            }
        })

        if (!favorito) {
            return ("Favorito não encontrado para este usuário")
        }

        await prismaClient.favoritos.delete({
            where: {
                id: favorito.id
            }
        })

        return ("Publicação retirada dos favoritos")
    }
}
export default favoritosServices
