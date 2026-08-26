import prismaClient from "../prismaCliente";

interface cadFavorito{
    id_usuarios: string,
    id_publicacoes: string
}

class favoritosServices{
    async criarFavorito({id_usuarios, id_publicacoes}: cadFavorito){
        
        const usuarioExiste = await prismaClient.usuarios.findFirst({
            where:{
                id:id_usuarios
            }
        }) 

        if(!usuarioExiste){
            return("Usuario não existe")
        }

        const publicacaoExiste = await prismaClient.publicacoes.findFirst({
            where:{
                id:id_usuarios
            }
        })

        if(!publicacaoExiste){
            return("Publicação não existe")
        }

       const criarFavorito = await prismaClient.favoritos.create({
            data:{
                id_usuarios,
                id_publicacoes
            }
        })
    }

    async visualizarFavorito(id: string){
         const usuarioExiste = await prismaClient.usuarios.findFirst({
            where:{
                id:id
            }
        }) 

        if(!usuarioExiste){
            return("Usuario não existe")
        }

        const publicacaoExiste = await prismaClient.publicacoes.findFirst({
            where:{
                id:id
            }
        })

        if(!publicacaoExiste){
            return("Publicação não existe")
        }

        await prismaClient.favoritos.findFirst({
            where:{
                id:id
            }
        })
    }


    async deletarFavorito(id: string){
         const usuarioExiste = await prismaClient.usuarios.findFirst({
            where:{
                id:id
            }
        }) 

        if(!usuarioExiste){
            return("Usuario não existe")
        }

        const publicacaoExiste = await prismaClient.publicacoes.findFirst({
            where:{
                id:id
            }
        })

        if(!publicacaoExiste){
            return("Publicação não existe")
        }

        await prismaClient.favoritos.delete({
            where:{
                id:id
            }
        })
    }
}

export default favoritosServices