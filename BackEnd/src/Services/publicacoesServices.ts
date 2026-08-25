import prismaClient from "../prismaCliente";

interface cadPublicacoes{
    tipo: string, 
    nome_pet: string,
    especie: string
    raca: string,
    idade_pet: string,
    porte: string,
    descricao: string,
    id_usuario: string
}

interface altPublicacoes{
    id: string,
    tipo: string, 
    nome_pet: string,
    especie: string
    raca: string,
    idade_pet: string,
    porte: string,
    descricao: string,
}


class publicacoesServices{

    async cadastrarPublicacao ({ tipo, nome_pet, especie, raca, idade_pet, porte, descricao, id_usuario} : cadPublicacoes){
        await prismaClient.publicacoes.create({
            data:{
                tipo: tipo,
                nome_pet: nome_pet,
                especie: especie,
                raca: raca,
                idade_pet: idade_pet,
                porte: porte,
                descricao: descricao,
                id_usuario: id_usuario
            }
        })
    }

    async visualizarPublicacaoUnico(id: string){
       const idExiste = await prismaClient.publicacoes.findFirst({
        where:{
            id:id
        }
       })
       
       if(!idExiste){
        return ("Publicação não existe")
       }
       
        const visualizar = await prismaClient.publicacoes.findFirst({
            where:{
                id: id
            }, 
            select:{
                id: true,
                tipo: true,
                status: true,
                nome_pet: true,
                especie: true,
                raca: true,
                idade_pet: true,
                porte: true,
                descricao: true,
                id_usuario: true
            }
        })
    }

    async atualizarPublicacao({id, tipo, nome_pet, especie, raca, idade_pet, porte, descricao} : altPublicacoes){
       
       const idExiste = await prismaClient.publicacoes.findFirst({
        where:{
            id:id
        }
       })

       if(!idExiste){
        return("Publicação não existe")
       }
       
        const atualizarPublicacao = await prismaClient.publicacoes.update({
            where:{
                id:id
            },
            data:{
                tipo: tipo,
                status: status,
                nome_pet: nome_pet,
                especie: especie,
                raca: raca,
                idade_pet: idade_pet,
                porte: porte,
                descricao: descricao
            }
        })
        
        return("Dados alterados com sucesso")
    }


    async deletarPublicacao(id: string){
        const idExiste = await prismaClient.publicacoes.findFirst({
            where:{
                id:id
            }
        })

        if(!idExiste){
            return("Publicação não existe")
        }


        const deletar = await prismaClient.publicacoes.delete({
            where:{
                id:id
            }
        })
    }
}

export default publicacoesServices