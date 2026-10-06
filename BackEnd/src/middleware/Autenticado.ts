import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

/* Estrutura mínima esperada no token já utilizado pelo projeto. */
interface Payload {
  sub: string;
}

/* Valida o Bearer Token e disponibiliza o id do usuário nas rotas protegidas. */
export function estaAutenticado(req: Request, res: Response, next: NextFunction) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao) {
    return res.status(401).json({ mensagem: "Token inexistente." });
  }

  const [, token] = autorizacao.split(" ");
  if (!token) {
    return res.status(401).json({ mensagem: "Formato de token inválido." });
  }

  try {
    const { sub } = verify(token, process.env.JWT_SECRETO || "troque-este-segredo") as Payload;
    req.usuarioId = sub;
    return next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
}
