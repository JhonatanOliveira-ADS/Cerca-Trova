import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import prismaClient from "../prismaCliente";

/*
  Proteção adicional para o painel administrativo.
  A sessão precisa ter um JWT válido e a conta precisa continuar marcada como ADMIN
  no banco; o frontend nunca é a única barreira de segurança.
*/
export async function adminEstaAutenticado(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao) {
    return res.status(401).json({ mensagem: "Token administrativo inexistente." });
  }

  const [, token] = autorizacao.split(" ");

  if (!token) {
    return res.status(401).json({ mensagem: "Formato de token inválido." });
  }

  try {
    const payload = verify(
      token,
      process.env.JWT_SECRETO || "troque-este-segredo",
    ) as { sub?: string };

    if (!payload.sub) {
      return res.status(401).json({ mensagem: "Token sem usuário identificado." });
    }

    const usuario = await prismaClient.usuarios.findUnique({
      where: { id: payload.sub },
      select: { id: true, tipo: true },
    });

    if (!usuario || usuario.tipo !== "ADMIN") {
      return res.status(403).json({ mensagem: "Acesso restrito a administradores." });
    }

    req.usuarioId = usuario.id;
    return next();
  } catch {
    return res.status(401).json({ mensagem: "Token administrativo inválido ou expirado." });
  }
}
