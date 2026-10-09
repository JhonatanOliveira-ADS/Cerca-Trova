
/* ==========================================================
   CERCA TROVA - ADMIN SERVICES

   Arquivo:
   src/Services/adminServices/adminServices.ts

   RESPONSABILIDADES:
   1. Consultar resumo administrativo
   2. Listar dados reais do painel
   3. Listar usuários
   4. Listar publicações
   5. Atualizar status das publicações
   6. Criar administrador

   IMPORTANTE:
   - Não utiliza dados fictícios.
   - Não retorna senhas.
   - Não modifica o schema do Prisma.
   - A autorização deve ser validada nas rotas.
========================================================== */

import prismaClient from "../../prismaCliente";
import { hash } from "bcryptjs";

/* ==========================================================
   INTERFACE PARA CADASTRO ADMINISTRATIVO
========================================================== */

interface CriarAdministrador {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

/* ==========================================================
   CLASSE PRINCIPAL DOS SERVIÇOS ADMINISTRATIVOS
========================================================== */

class AdminServices {
  /* ========================================================
     1. RESUMO ADMINISTRATIVO

     Consulta as atividades cadastradas no sistema.

     Tabelas utilizadas:
     - usuarios
     - publicacoes
     - petsTinder
     - conversas

     O parâmetro "desde" permite filtrar as
     atividades mais recentes.

     Promise.allSettled impede que uma consulta
     com erro bloqueie todas as outras.
  ======================================================== */

  async obterResumo(desde?: string) {
    /* Valida a data informada no filtro. */
    const dataDesde = desde ? new Date(desde) : null;

    const filtroDesde =
      dataDesde && !Number.isNaN(dataDesde.getTime())
        ? { gte: dataDesde }
        : undefined;

    /* Consulta os dados reais do banco. */
    const resultados = await Promise.allSettled([
      /* USUÁRIOS */
      prismaClient.usuarios.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          data_criacao: true,
        },
        orderBy: {
          data_criacao: "desc",
        },
      }),

      /* PUBLICAÇÕES */
      prismaClient.publicacoes.findMany({
        select: {
          id: true,
          nome_pet: true,
          tipo: true,
          status: true,
          data_criacao: true,

          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
        orderBy: {
          data_criacao: "desc",
        },
      }),

      /* TINDER PET */
      prismaClient.petsTinder.findMany({
        select: {
          id: true,
          nome: true,
          ativo: true,
          data_criacao: true,

          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
        orderBy: {
          data_criacao: "desc",
        },
      }),

      /* CONVERSAS */
      prismaClient.conversas.findMany({
        select: {
          id: true,
          data_criacao: true,

          remetente: {
            select: {
              id: true,
              nome: true,
            },
          },

          destinatario: {
            select: {
              id: true,
              nome: true,
            },
          },

          publicacao: {
            select: {
              id: true,
              nome_pet: true,
              tipo: true,
            },
          },
        },
        orderBy: {
          data_criacao: "desc",
        },
      }),
    ]);

    /* ======================================================
       VERIFICA AS CONSULTAS

       Caso uma das tabelas apresente erro,
       as outras consultas podem ser utilizadas.
    ====================================================== */

    const usuarios =
      resultados[0].status === "fulfilled"
        ? resultados[0].value
        : [];

    const publicacoes =
      resultados[1].status === "fulfilled"
        ? resultados[1].value
        : [];

    const petsTinder =
      resultados[2].status === "fulfilled"
        ? resultados[2].value
        : [];

    const conversas =
      resultados[3].status === "fulfilled"
        ? resultados[3].value
        : [];

    /* ======================================================
       MONTA HISTÓRICO DE ATIVIDADES
    ====================================================== */

    const atividades = [
      /* USUÁRIOS CADASTRADOS */
      ...usuarios.map((usuario) => ({
        id: `usuario-${usuario.id}`,
        tipo: "USUARIO_CRIADO",
        titulo: "Novo usuário cadastrado",

        descricao:
          `${usuario.nome} entrou para a comunidade.`,

        data: usuario.data_criacao,
        entidadeId: usuario.id,
        dados: usuario,
      })),

      /* PUBLICAÇÕES CRIADAS */
      ...publicacoes.map((publicacao) => ({
        id: `publicacao-${publicacao.id}`,
        tipo: "PUBLICACAO_CRIADA",
        titulo: "Nova publicação criada",

        descricao:
          `${publicacao.nome_pet} foi publicado por ` +
          `${publicacao.usuario.nome}.`,

        data: publicacao.data_criacao,
        entidadeId: publicacao.id,
        dados: publicacao,
      })),

      /* CADASTROS NO TINDER PET */
      ...petsTinder.map((pet) => ({
        id: `pet-tinder-${pet.id}`,
        tipo: "PET_TINDER_CRIADO",
        titulo: "Novo pet cadastrado no TinderPet",

        descricao:
          `${pet.nome} foi cadastrado por ` +
          `${pet.usuario.nome}.`,

        data: pet.data_criacao,
        entidadeId: pet.id,
        dados: pet,
      })),

      /* CONVERSAS INICIADAS */
      ...conversas.map((conversa) => ({
        id: `conversa-${conversa.id}`,
        tipo: "INTERESSE_INICIADO",
        titulo: "Novo interesse iniciado",

        descricao:
          `${conversa.remetente.nome} iniciou uma ` +
          `conversa com ${conversa.destinatario.nome}.`,

        data: conversa.data_criacao,
        entidadeId: conversa.id,
        dados: conversa,
      })),
    ]
      /* Filtra pela data solicitada. */
      .filter(
        (atividade) =>
          !filtroDesde ||
          new Date(atividade.data) >= filtroDesde.gte
      )

      /* Ordena as atividades da mais nova para a antiga. */
      .sort(
        (a, b) =>
          new Date(b.data).getTime() -
          new Date(a.data).getTime()
      )

      /* Limita o histórico às 30 atividades recentes. */
      .slice(0, 30);

    /* Conta as publicações recentes. */
    const novasPublicacoes = publicacoes.filter(
      (publicacao) =>
        !filtroDesde ||
        new Date(publicacao.data_criacao) >=
          filtroDesde.gte
    ).length;

    /* ======================================================
       RETORNA OS INDICADORES E ATIVIDADES
    ====================================================== */

    return {
      indicadores: {
        usuarios: usuarios.length,

        publicacoes: publicacoes.length,

        publicacoesAtivas: publicacoes.filter(
          (publicacao) => publicacao.status
        ).length,

        administradores: usuarios.filter(
          (usuario) => usuario.tipo === "ADMIN"
        ).length,

        petsTinder: petsTinder.length,

        conversas: conversas.length,

        porCategoria: {
          ADOCAO: publicacoes.filter(
            (publicacao) => publicacao.tipo === "ADOCAO"
          ).length,

          PERDIDO: publicacoes.filter(
            (publicacao) => publicacao.tipo === "PERDIDO"
          ).length,

          ENCONTRADO: publicacoes.filter(
            (publicacao) =>
              publicacao.tipo === "ENCONTRADO"
          ).length,

          TINDER_PET: publicacoes.filter(
            (publicacao) =>
              publicacao.tipo === "TINDER_PET"
          ).length,
        },
      },

      novas: {
        publicacoes: novasPublicacoes,

        usuarios: usuarios.filter(
          (usuario) =>
            !filtroDesde ||
            new Date(usuario.data_criacao) >=
              filtroDesde.gte
        ).length,

        petsTinder: petsTinder.filter(
          (pet) =>
            !filtroDesde ||
            new Date(pet.data_criacao) >=
              filtroDesde.gte
        ).length,

        atividades: atividades.length,
      },

      atividades,
      atualizadoEm: new Date(),
    };
  }

  /* ========================================================
     2. LISTAR DADOS REAIS DO PAINEL

     Este método será chamado pelo AdminControllers.

     Retorna:
     - Usuários
     - Publicações
     - Pets do Tinder Pet
     - Metadados das conversas

     Não retorna o conteúdo das mensagens privadas.
  ======================================================== */

  async listarDadosPainel() {
    /* Utiliza métodos existentes e novas consultas. */
    const [
      usuarios,
      publicacoes,
      petsTinder,
      conversas,
    ] = await Promise.all([
      /* USUÁRIOS */
      this.listarUsuarios(),

      /* PUBLICAÇÕES */
      this.listarPublicacoes(),

      /* TINDER PET */
      prismaClient.petsTinder.findMany({
        select: {
          id: true,
          nome: true,
          ativo: true,
          data_criacao: true,

          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
        orderBy: {
          data_criacao: "desc",
        },
      }),

      /* CONVERSAS */
      prismaClient.conversas.findMany({
        select: {
          id: true,
          data_criacao: true,

          remetente: {
            select: {
              id: true,
              nome: true,
            },
          },

          destinatario: {
            select: {
              id: true,
              nome: true,
            },
          },

          publicacao: {
            select: {
              id: true,
              nome_pet: true,
              tipo: true,
            },
          },

          /* Conta mensagens sem expor o texto. */
          _count: {
            select: {
              mensagens: true,
            },
          },
        },
        orderBy: {
          data_criacao: "desc",
        },
      }),
    ]);

    /* Dados retornados à API administrativa. */
    return {
      usuarios,
      publicacoes,
      petsTinder,
      conversas,
      atualizadoEm: new Date().toISOString(),
    };
  }

  /* ========================================================
     3. LISTAR USUÁRIOS

     Utilizado pelo painel administrativo.

     Não seleciona o campo senha.
  ======================================================== */

  async listarUsuarios() {
    return prismaClient.usuarios.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        foto_perfil: true,
        foto_capa: true,
        tipo: true,
        verificado: true,
        data_criacao: true,

        /* Conta publicações e favoritos. */
        _count: {
          select: {
            publicacoes: true,
            favoritos: true,
          },
        },
      },
      orderBy: {
        data_criacao: "desc",
      },
    });
  }

  /* ========================================================
     4. LISTAR PUBLICAÇÕES

     Retorna publicações ativas e inativas,
     incluindo o nome do responsável.
  ======================================================== */

  async listarPublicacoes() {
    return prismaClient.publicacoes.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        data_criacao: "desc",
      },
    });
  }

  /* ========================================================
     5. ATUALIZAR STATUS DE PUBLICAÇÃO

     Permite ativar e desativar publicações.

     Não exclui registros do banco.
  ======================================================== */

  async atualizarStatusPublicacao(
    id: string,
    status: boolean
  ) {
    /* Verifica se a publicação existe. */
    const publicacao =
      await prismaClient.publicacoes.findUnique({
        where: { id },
      });

    if (!publicacao) {
      throw new Error("Publicação não encontrada.");
    }

    /* Atualiza somente o status solicitado. */
    return prismaClient.publicacoes.update({
      where: { id },
      data: { status },

      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  /* ========================================================
     6. CRIAR ADMINISTRADOR

     Mantém o método já existente no projeto.

     ATENÇÃO:
     A rota de cadastro administrativo não deve
     ficar pública em produção.

     O objetivo é manter apenas o administrador
     previamente autorizado.
  ======================================================== */

  async criarAdministrador({
    nome,
    email,
    senha,
    telefone = "",
  }: CriarAdministrador) {
    /* Normaliza o email informado. */
    const emailNormalizado =
      email.trim().toLowerCase();

    /* Verifica se o email já existe. */
    const administradorExistente =
      await prismaClient.usuarios.findUnique({
        where: {
          email: emailNormalizado,
        },
      });

    if (administradorExistente) {
      throw new Error(
        "Já existe uma conta cadastrada com este e-mail."
      );
    }

    /* Gera o hash da senha. */
    const senhaHash = await hash(senha, 8);

    /* Salva o administrador. */
    const administrador =
      await prismaClient.usuarios.create({
        data: {
          nome,
          email: emailNormalizado,
          senha: senhaHash,
          telefone,
          tipo: "ADMIN",
        },

        /* Não devolve a senha ao controller. */
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

/* ==========================================================
   EXPORTAÇÃO DO SERVICE
========================================================== */

export default AdminServices;
