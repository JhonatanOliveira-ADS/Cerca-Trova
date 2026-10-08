import prismaClient from "../../prismaCliente";
import { hash } from "bcryptjs";

/* Dados recebidos pelo endpoint usado para criar administradores via Insomnia. */
interface CriarAdministrador {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

class AdminServices {
  /* Cria uma conta administrativa na mesma tabela usada pelo login do sistema. */
  async criarAdministrador({
    nome,
    email,
    senha,
    telefone = "",
  }: CriarAdministrador) {
    const emailNormalizado = email.trim().toLowerCase();

    /* Impede duplicidade porque o campo email é único no schema Prisma. */
    const administradorExistente = await prismaClient.usuarios.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (administradorExistente) {
      throw new Error("Já existe uma conta cadastrada com este e-mail.");
    }

    /* A senha é armazenada somente como hash, nunca em texto puro. */
    const senhaHash = await hash(senha, 8);

    const administrador = await prismaClient.usuarios.create({
      data: {
        nome,
        email: emailNormalizado,
        senha: senhaHash,
        telefone,
        tipo: "ADMIN",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        verificado: true,
      },
    });

    return administrador;
  }
}

export default AdminServices;
