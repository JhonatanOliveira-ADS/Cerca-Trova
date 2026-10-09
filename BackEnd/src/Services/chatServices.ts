import prismaClient from "../prismaCliente";

/*
  O service concentra as regras do chat para que o controller apenas valide
  a requisição e devolva a resposta HTTP.
*/
class chatServices {
  /*
    Cria ou recupera uma conversa entre o usuário logado e o dono do post.
    O usuário nunca é recebido pelo body: ele sempre vem do JWT validado.
  */
  async criarOuObterConversa(idPublicacao: string, idUsuarioAtual: string) {
    const publicacao = await prismaClient.publicacoes.findUnique({
      where: { id: idPublicacao },
      include: {
        usuario: {
          select: { id: true, nome: true },
        },
      },
    });

    if (!publicacao) {
      throw new Error("A publicação informada não existe.");
    }

    if (publicacao.usuario.id === idUsuarioAtual) {
      throw new Error("Você não pode iniciar uma conversa com você mesmo.");
    }

    const conversaExistente = await prismaClient.conversas.findFirst({
      where: {
        OR: [
          {
            id_remetente: idUsuarioAtual,
            id_destinatario: publicacao.usuario.id,
          },
          {
            id_remetente: publicacao.usuario.id,
            id_destinatario: idUsuarioAtual,
          },
        ],
      },
      include: {
        destinatario: { select: { id: true, nome: true } },
        remetente: { select: { id: true, nome: true } },
        publicacao: { select: { id: true, nome_pet: true, tipo: true } },
      },
    });

    if (conversaExistente) {
      return conversaExistente;
    }

    return prismaClient.conversas.create({
      data: {
        id_publicacao: publicacao.id,
        id_remetente: idUsuarioAtual,
        id_destinatario: publicacao.usuario.id,
      },
      include: {
        destinatario: { select: { id: true, nome: true } },
        remetente: { select: { id: true, nome: true } },
        publicacao: { select: { id: true, nome_pet: true, tipo: true } },
      },
    });
  }

  /* Lista as conversas do usuário e inclui a última mensagem de cada uma. */
  async listarConversas(idUsuarioAtual: string) {
    const conversas = await prismaClient.conversas.findMany({
      where: {
        OR: [
          { id_remetente: idUsuarioAtual },
          { id_destinatario: idUsuarioAtual },
        ],
      },
      include: {
        remetente: { select: { id: true, nome: true, foto_perfil: true } },
        destinatario: { select: { id: true, nome: true, foto_perfil: true } },
        publicacao: { select: { id: true, nome_pet: true, foto: true } },
        mensagens: {
          orderBy: { data_criacao: "desc" },
          take: 1,
          select: { id: true, texto: true, id_usuario: true, data_criacao: true },
        },
      },
      orderBy: { data_atualizacao: "desc" },
    });

    return conversas.map((conversa) => ({
      ...conversa,
      outroUsuario:
        conversa.id_remetente === idUsuarioAtual
          ? conversa.destinatario
          : conversa.remetente,
      ultimaMensagem: conversa.mensagens[0] || null,
    }));
  }

  /* Garante que o usuário atual participa da conversa antes de ler mensagens. */
  private async obterConversaDoUsuario(idConversa: string, idUsuarioAtual: string) {
    const conversa = await prismaClient.conversas.findFirst({
      where: {
        id: idConversa,
        OR: [
          { id_remetente: idUsuarioAtual },
          { id_destinatario: idUsuarioAtual },
        ],
      },
    });

    if (!conversa) {
      throw new Error("Conversa não encontrada ou sem permissão.");
    }

    return conversa;
  }

  /* Lista as mensagens ordenadas cronologicamente para a conversa selecionada. */
  async listarMensagens(idConversa: string, idUsuarioAtual: string) {
    await this.obterConversaDoUsuario(idConversa, idUsuarioAtual);

    return prismaClient.mensagens.findMany({
      where: { id_conversa: idConversa },
      orderBy: { data_criacao: "asc" },
      include: {
        usuario: { select: { id: true, nome: true, foto_perfil: true } },
      },
    });
  }

  /* Persiste uma nova mensagem somente se o remetente estiver na conversa. */
  async criarMensagem(idConversa: string, idUsuarioAtual: string, texto: string) {
    const mensagemLimpa = texto.trim();

    if (!mensagemLimpa) {
      throw new Error("A mensagem não pode ficar vazia.");
    }

    await this.obterConversaDoUsuario(idConversa, idUsuarioAtual);

    return prismaClient.mensagens.create({
      data: {
        id_conversa: idConversa,
        id_usuario: idUsuarioAtual,
        texto: mensagemLimpa,
      },
      include: {
        usuario: { select: { id: true, nome: true, foto_perfil: true } },
      },
    });
  }
}

export default chatServices;
