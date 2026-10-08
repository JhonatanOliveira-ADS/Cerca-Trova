import prismaClient from "../prismaCliente";

/* Dados necessários para cadastrar um pet real no catálogo TinderPet. */
interface CriarPetTinder {
  nome: string;
  especie: string;
  raca: string;
  idade: string;
  sexo: string;
  porte: string;
  cidade: string;
  descricao: string;
  foto: string;
  personalidade: string;
  id_usuario: string;
}

class PetsTinderServices {
  /* Lista pets ativos do catálogo público, sem dados demonstrativos. */
  async listarPetsAtivos() {
    return prismaClient.petsTinder.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        data_criacao: "desc",
      },
    });
  }

  /* Cadastra o pet relacionando-o ao usuário autenticado. */
  async criarPet(dados: CriarPetTinder) {
    return prismaClient.petsTinder.create({
      data: dados,
    });
  }
}

export default PetsTinderServices;
