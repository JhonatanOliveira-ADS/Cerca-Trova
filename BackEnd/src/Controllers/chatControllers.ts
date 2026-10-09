import { Request, Response } from "express";
import chatServices from "../Services/chatServices";

/* Controller responsável por traduzir as ações do chat para respostas HTTP. */
class chatControllers {
  /* Abre a conversa relacionada ao post clicado em “Tenho interesse”. */
  async criarOuObterConversa(req: Request, res: Response) {
    const { id_publicacao } = req.body;

    if (!id_publicacao) {
      return res.status(400).json({ mensagem: "Informe a publicação de interesse." });
    }

    const service = new chatServices();
    const resposta = await service.criarOuObterConversa(id_publicacao, req.usuarioId);

    return res.status(200).json(resposta);
  }

  /* Lista somente as conversas das quais o usuário autenticado participa. */
  async listarConversas(req: Request, res: Response) {
    const service = new chatServices();
    const resposta = await service.listarConversas(req.usuarioId);

    return res.json(resposta);
  }

  /* Lista as mensagens de uma conversa autorizada. */
  async listarMensagens(req: Request, res: Response) {
    const service = new chatServices();
    const resposta = await service.listarMensagens(req.params.id, req.usuarioId);

    return res.json(resposta);
  }

  /* Cria uma mensagem vinculada ao usuário do token. */
  async criarMensagem(req: Request, res: Response) {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ mensagem: "Informe o texto da mensagem." });
    }

    const service = new chatServices();
    const resposta = await service.criarMensagem(
      req.params.id,
      req.usuarioId,
      texto,
    );

    return res.status(201).json(resposta);
  }
}

export default chatControllers;
