import prismaClient from "../prismaCliente";

interface cadPublicacoes {
    tipo: "ADOCAO" | "ENCONTRADO" | "PERDIDO" | "TINDER_PET" | string,
    nome_pet: string,
    especie: string
    raca: string,
    idade_pet: string,
    porte: string,
    sexo: string,
    descricao: string,
    foto: string,
    cidade: string,
    estado: string,
    id_usuario: string
}

interface altPublicacoes {
    id: string,
    tipo: "ADOCAO" | "ENCONTRADO" | "PERDIDO" | "TINDER_PET" | string,
    nome_pet: string,
    especie: string,
    raca: string,
    idade_pet: string,
    porte: string,
    sexo: string,
    descricao: string,
    foto?: string,
    cidade: string,
    estado: string,
    // O formulário legado pode enviar texto; o Prisma aceita somente Boolean.
    status?: boolean | string,
    id_usuario: string

}


class publicacoesServices {

    async cadastrarPublicacao({ tipo, nome_pet, especie, raca, idade_pet, porte, sexo, descricao, foto, cidade, estado, id_usuario }: cadPublicacoes) {
        // O registro criado é retornado para que o frontend atualize o feed sem depender de mock local.
        const publicacao = await prismaClient.publicacoes.create({
            data: {
                /* Normaliza a etiqueta visual para a categoria do TinderPet. */
                tipo: tipo === "TinderPet" || tipo === "Tinder Pet" ? "TINDER_PET" : tipo,
                nome_pet: nome_pet,
                especie: especie,
                raca: raca,
                idade_pet: idade_pet,
                porte: porte,
                sexo: sexo,
                descricao: descricao,
                foto: foto,
                cidade: cidade,
                estado: estado,
                id_usuario: id_usuario
            }
        })
        return publicacao
    }

    async visualizarPublicacaoUnico(id?: string) {
        // Sem id, o endpoint entrega o feed completo para as páginas públicas.
        if (!id) {
            return prismaClient.publicacoes.findMany({
                where: {
                    status: true
                },
                orderBy: {
                    data_criacao: "desc"
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                }
            })
        }

        const idExiste = await prismaClient.publicacoes.findFirst({
            where: {
                id: id
            }
        })

        if (!idExiste) {
            return ("Publicação não existe")
        }

        const visualizar = await prismaClient.publicacoes.findFirst({
            
            where: {
                id: id
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        })

        return visualizar

    }

    async atualizarPublicacao({ id, tipo, nome_pet, especie, raca, idade_pet,sexo, porte, descricao, foto, cidade, estado,status, id_usuario}: altPublicacoes) {

        const idExiste = await prismaClient.publicacoes.findFirst({
            where: {
                id: id
            }
        })

        if (!idExiste) {
            return ("Publicação não existe")
        }

        // A publicação só pode ser alterada pelo usuário que a criou.
        if (idExiste.id_usuario !== id_usuario) {
            return ("Você não pode alterar esta publicação")
        }

        /*
          Preserva o status atual quando o formulário envia textos como
          "Perdido", evitando que uma String seja enviada para um campo Boolean.
        */
        const dadosAtualizacao = {
            tipo: tipo === "TinderPet" || tipo === "Tinder Pet" ? "TINDER_PET" : tipo,
            ...(typeof status === "boolean" ? { status } : {}),
            nome_pet,
            especie,
            raca,
            idade_pet,
            sexo,
            porte,
            descricao,
            ...(foto ? { foto } : {}),
            cidade,
            estado
        }

        const atualizarPublicacao = await prismaClient.publicacoes.update({
            where: {
                id: id
            },
            data: dadosAtualizacao
        })

        return ("Dados alterados com sucesso")
    }


    async deletarPublicacao(id: string, id_usuario: string) {
        const idExiste = await prismaClient.publicacoes.findFirst({
            where: {
                id: id
            }
        })

        if (!idExiste) {
            return ("Publicação não existe")
        }


        // A exclusão também é limitada ao proprietário do registro autenticado.
        if (idExiste.id_usuario !== id_usuario) {
            return ("Você não pode excluir esta publicação")
        }

        const deletar = await prismaClient.publicacoes.delete({
            where: {
                id: id
            }
        })
        return ("Publicação deletada")
    }
}

export default publicacoesServices
