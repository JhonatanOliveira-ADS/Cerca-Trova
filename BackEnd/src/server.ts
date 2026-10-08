import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import "dotenv/config";
import cors from "cors";
import path from "path";
import router from "./router";

const app = express();

/* O limite maior permite descrições e formulários multipart sem cortar dados válidos. */
app.use(express.json({ limit: "2mb" }));

/* Em produção, CORS_ORIGINS deve conter apenas os domínios autorizados separados por vírgula. */
const origensPermitidas = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origem) => origem.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origensPermitidas,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* Arquivos enviados pelo multer são disponibilizados somente pela rota de mídia. */
app.use("/files", express.static(path.resolve(__dirname, "..", "tmp")));
app.use(router);

/* Resposta centralizada para erros das rotas assíncronas. */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({
    status: "Erro",
    message: "Erro interno do servidor",
  });
});

/* A porta pode ser definida pelo provedor de hospedagem. */
const porta = Number(process.env.PORT || 3333);

app.listen(porta, () => {
  console.log(`Servidor online na porta ${porta}`);
});

export default app;
