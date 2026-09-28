import { Router } from "express";

import {
  comparePassword,
  findUserByEmail,
} from "../store.js";
import { createAdminToken } from "../middleware/adminAuth.js";
import { LoginBody } from "../types.js";

/* Router separado para manter autenticação organizada por domínio. */
const authRouter = Router();

/*
  Login administrativo.
  Apenas usuários cujo perfil persistido é admin recebem um token administrativo.
*/
authRouter.post("/admin/login", async (request, response) => {
  const { email, senha } = request.body

  if (!email || !senha) {
    response.status(400).json({ message: "E-mail e senha são obrigatórios." });
    return;
  }

  const usuario = findUserByEmail(email);
  const senhaValida = usuario
    ? await comparePassword(senha, usuario.senhaHash)
    : false;

  if (!usuario || usuario.perfil !== "admin" || !senhaValida) {
    response.status(401).json({
      message: "E-mail ou senha de administrador inválidos.",
    });
    return;
  }

  const token = createAdminToken({
    sub: usuario.id,
    email: usuario.email,
    perfil: usuario.perfil,
  });

  response.json({
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      perfil: usuario.perfil,
    },
  });
});

/*
  Ponto de extensão para o login comum.
  O fluxo de usuário pode receber aqui sua própria regra de cadastro e sessão.
*/
authRouter.post("/login", (_request, response) => {
  response.status(501).json({
    message: "O login comum ainda precisa ser conectado ao provedor de usuários.",
  });
});

export default authRouter;
