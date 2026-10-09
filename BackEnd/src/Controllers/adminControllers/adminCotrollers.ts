
/* ==========================================================
   CERCA TROVA - ADMIN CONTROLLERS

   Arquivo:
   src/Controllers/adminControllers/adminCotrollers.ts

   RESPONSABILIDADES:
   1. Retornar o resumo administrativo
   2. Listar dados reais do painel
   3. Listar usuários
   4. Listar publicações
   5. Atualizar status das publicações
   6. Criar administrador

   O controller recebe as requisições HTTP
   e utiliza AdminServices para acessar o banco.

   IMPORTANTE:
   As rotas administrativas precisam utilizar
   middleware que verifica JWT e perfil ADMIN.
========================================================== */

/* ==========================================================
   1. IMPORTAÇÕES
========================================================== */

import { Request, Response } from "express";

import AdminServices from
  "../../Services/adminServices/adminServices";

/* ==========================================================
   2. CLASSE ADMIN CONTROLLERS
========================================================== */

class AdminControllers {
  /* ========================================================
     RESUMO ADMINISTRATIVO

     GET /admin/resumo

     Recebe opcionalmente a data "desde"
     para filtrar atividades recentes.
  ======================================================== */

  async obterResumo(req: Request, res: Response) {
    try {
      const service = new AdminServices();

      /* Lê o filtro de data da URL. */
      const desde =
        typeof req.query.desde === "string"
          ? req.query.desde
          : undefined;

      /* Consulta o service. */
      const resposta = await service.obterResumo(desde);

      return res.status(200).json(resposta);
    } catch (erro) {
      console.error(
        "Erro ao carregar resumo administrativo:",
        erro
      );

      return res.status(500).json({
        mensagem:
          "Não foi possível carregar o resumo administrativo.",
      });
    }
  }

  /* ========================================================
     CONSULTAR DADOS DO PAINEL

     GET /admin/dados

     Integra os cadastros reais do site
     com o painel administrativo.

     Retorna:
     - Usuários
     - Publicações
     - Tinder Pet
     - Metadados das conversas
  ======================================================== */

  async listarDadosPainel(req: Request, res: Response) {
    try {
      /* Instancia o service administrativo. */
      const service = new AdminServices();

      /* Carrega os registros do MySQL. */
      const dados = await service.listarDadosPainel();

      /* Retorna os dados em JSON. */
      return res.status(200).json(dados);
    } catch (erro) {
      console.error(
        "Erro ao carregar dados do painel:",
        erro
      );

      return res.status(500).json({
        mensagem:
          "Não foi possível carregar os dados administrativos.",
      });
    }
  }

  /* ========================================================
     LISTAR USUÁRIOS

     GET /admin/usuarios

     Retorna os usuários cadastrados,
     sem o hash da senha.
  ======================================================== */

  async listarUsuarios(req: Request, res: Response) {
    try {
      const service = new AdminServices();

      const usuarios = await service.listarUsuarios();

      return res.status(200).json(usuarios);
    } catch (erro) {
      console.error(
        "Erro ao listar usuários:",
        erro
      );

      return res.status(500).json({
        mensagem:
          "Não foi possível listar os usuários.",
      });
    }
  }

  /* ========================================================
     LISTAR PUBLICAÇÕES

     GET /admin/publicacoes

     Retorna as publicações registradas
     pelos usuários do Cerca Trova.
  ======================================================== */

  async listarPublicacoes(req: Request, res: Response) {
    try {
      const service = new AdminServices();

      const publicacoes =
        await service.listarPublicacoes();

      return res.status(200).json(publicacoes);
    } catch (erro) {
      console.error(
        "Erro ao listar publicações:",
        erro
      );

      return res.status(500).json({
        mensagem:
          "Não foi possível listar as publicações.",
      });
    }
  }

  /* ========================================================
     ATUALIZAR STATUS DA PUBLICAÇÃO

     PATCH /admin/publicacoes/:id/status

     Permite:
     - Ativar publicação
     - Desativar publicação

     A publicação não será excluída.
  ======================================================== */

  async atualizarStatusPublicacao(
    req: Request,
    res: Response
  ) {
    try {
      /* Obtém o ID da publicação. */
      const id = req.params.id;

      /* Recebe o status enviado pelo frontend. */
      const { status } = req.body;

      /* Aceita apenas true/false ou suas strings. */
      if (
        status !== true &&
        status !== false &&
        status !== "true" &&
        status !== "false"
      ) {
        return res.status(400).json({
          mensagem:
            "O status deve ser true ou false.",
        });
      }

      /* Converte o status para booleano. */
      const statusBooleano =
        status === true || status === "true";

      const service = new AdminServices();

      /* Atualiza a publicação no banco. */
      const resposta =
        await service.atualizarStatusPublicacao(
          id,
          statusBooleano
        );

      return res.status(200).json(resposta);
    } catch (erro) {
      console.error(
        "Erro ao atualizar publicação:",
        erro
      );

      if (
        erro instanceof Error &&
        erro.message === "Publicação não encontrada."
      ) {
        return res.status(404).json({
          mensagem: erro.message,
        });
      }

      return res.status(500).json({
        mensagem:
          "Não foi possível atualizar a publicação.",
      });
    }
  }

  /* ========================================================
     CRIAR ADMINISTRADOR

     POST /CadastrarAdmin

     Mantido para compatibilidade com o projeto.

     Esta operação precisa ser restrita.
     Não disponibilize cadastro público de ADMIN.
  ======================================================== */

  async criarAdministrador(req: Request, res: Response) {
    try {
      /* Recebe as informações do cadastro. */
      const {
        nome,
        email,
        senha,
        telefone,
      } = req.body;

      /* Valida os campos obrigatórios. */
      if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof senha !== "string" ||
        !senha
      ) {
        return res.status(400).json({
          mensagem:
            "Nome, e-mail e senha são obrigatórios.",
        });
      }

      /* Instancia o service administrativo. */
      const service = new AdminServices();

      /* Cadastra o administrador. */
      const administrador =
        await service.criarAdministrador({
          nome,
          email,
          senha,
          telefone,
        });

      /* Retorna o cadastro realizado. */
      return res.status(201).json(administrador);
    } catch (erro) {
      console.error(
        "Erro ao cadastrar administrador:",
        erro
      );

      if (
        erro instanceof Error &&
        erro.message.includes(
          "Já existe uma conta cadastrada"
        )
      ) {
        return res.status(409).json({
          mensagem: erro.message,
        });
      }

      return res.status(500).json({
        mensagem:
          "Não foi possível cadastrar o administrador.",
      });
    }
  }
}

/* ==========================================================
   EXPORTAÇÃO DO CONTROLLER
========================================================== */

export default AdminControllers;
