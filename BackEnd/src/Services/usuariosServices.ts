
/* ====================================================
   CERCA TROVA - SERVIÇO DE USUÁRIOS

   Responsabilidades:
   - Cadastrar usuários
   - Consultar usuários
   - Atualizar informações pessoais
   - Salvar foto de perfil
   - Salvar foto de capa
   - Excluir usuários

   As imagens são armazenadas como nomes/caminhos
   de arquivos no banco de dados.
==================================================== */

import prismaClient from "../prismaCliente";
import { hash } from "bcryptjs";

/* ====================================================
   1. INTERFACE DE CADASTRO
==================================================== */

interface cadUsuario {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  foto_perfil?: string;
}

/* ====================================================
   2. INTERFACE DE ATUALIZAÇÃO

   Os campos são opcionais porque o usuário pode
   atualizar apenas uma informação.
==================================================== */

interface altUsuario {
  id: string;
  nome?: string;
  email?: string;
  telefone?: string;
  foto_perfil?: string;
  foto_capa?: string;
}

/* ====================================================
   3. CAMPOS PÚBLICOS DO USUÁRIO

   Evita retornar o hash da senha nas consultas.
==================================================== */

const camposUsuario = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  foto_perfil: true,
  foto_capa: true,
  tipo: true,
  verificado: true,
} as const;

/* ====================================================
   4. CLASSE DE SERVIÇOS
==================================================== */

class usuariosServices {

  /* ==================================================
     CADASTRAR USUÁRIO
  ================================================== */

  async criarUsuario({
    nome,
    email,
    senha,
    telefone,
    foto_perfil,
  }: cadUsuario) {

    // Verifica se o e-mail já está cadastrado.
    const verificarEmail =
      await prismaClient.usuarios.findFirst({
        where: { email },
      });

    if (verificarEmail) {
      throw new Error(
        "Já existe um usuário cadastrado com esse e-mail."
      );
    }

    // Protege a senha utilizando bcrypt.
    const senhaHash = await hash(senha, 8);

    // Salva os dados no banco.
    const usuario = await prismaClient.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        telefone,
        ...(foto_perfil ? { foto_perfil } : {}),
      },
      select: camposUsuario,
    });

    return usuario;
  }

  /* ==================================================
     LISTAR TODOS OS USUÁRIOS

     Futuramente poderá alimentar o painel Admin.
     Esta operação deverá ser protegida no backend.
  ================================================== */

  async visualizarDadosGeral() {
    return prismaClient.usuarios.findMany({
      select: camposUsuario,
    });
  }

  /* ==================================================
     BUSCAR USUÁRIO POR ID

     Recupera também foto_perfil e foto_capa.
  ================================================== */

  async visualizarDadosUnico(id: string) {
    return prismaClient.usuarios.findUnique({
      where: { id },
      select: camposUsuario,
    });
  }

  /* ==================================================
     ATUALIZAR DADOS PESSOAIS

     Apenas os campos informados serão atualizados.
     As imagens anteriores serão preservadas caso
     nenhuma imagem nova seja enviada.
  ================================================== */

  async atualizarDados({
    id,
    nome,
    email,
    telefone,
    foto_perfil,
    foto_capa,
  }: altUsuario) {

    return prismaClient.usuarios.update({
      where: { id },

      data: {
        ...(nome !== undefined ? { nome } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(telefone !== undefined ? { telefone } : {}),

        ...(foto_perfil !== undefined
          ? { foto_perfil }
          : {}),

        ...(foto_capa !== undefined
          ? { foto_capa }
          : {}),
      },

      select: camposUsuario,
    });
  }

  /* ==================================================
     ATUALIZAR FOTO DE PERFIL

     Recebe o nome do arquivo salvo pelo Multer.

     Exemplo:
     foto_perfil = "imagem-123.jpg"

     O arquivo físico precisa estar armazenado
     no servidor e disponível pela rota /files.
  ================================================== */

  async atualizarFotoPerfil(
    id: string,
    foto_perfil: string
  ) {

    if (!foto_perfil) {
      throw new Error(
        "Nenhuma foto de perfil foi informada."
      );
    }

    return prismaClient.usuarios.update({
      where: { id },

      data: {
        foto_perfil,
      },

      select: camposUsuario,
    });
  }

  /* ==================================================
     ATUALIZAR FOTO DE CAPA

     Salva o nome/caminho da capa no MySQL.

     Não altera a foto de perfil.
  ================================================== */

  async atualizarFotoCapa(
    id: string,
    foto_capa: string
  ) {

    if (!foto_capa) {
      throw new Error(
        "Nenhuma foto de capa foi informada."
      );
    }

    return prismaClient.usuarios.update({
      where: { id },

      data: {
        foto_capa,
      },

      select: camposUsuario,
    });
  }

  /* ==================================================
     EXCLUIR USUÁRIO

     A autorização da exclusão deve ser validada
     pelo controller/middleware administrativo.
  ================================================== */

  async deletarDadosUsuarios(id: string) {
    await prismaClient.usuarios.delete({
      where: { id },
    });

    return "Dados de usuário deletados.";
  }
}

export default usuariosServices;
