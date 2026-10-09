
/*
========================================================
 CERCA TROVA - CHAT
========================================================
 - Conversas reais carregadas pela API
 - Abas Achados, Tinder Pet e Adoção
 - Pesquisa de conversas
 - Envio de mensagens
 - Emojis
 - Menu lateral recolhível
 - Estado vazio centralizado
========================================================
*/

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../assets/css/Chat.css";
import logotipo from "../assets/imagens/logotipo.png";

import {
  API_BASE_URL,
  enviarMensagemConversa,
  listarConversas,
  listarMensagensConversa,
  obterUsuarioAtual,
} from "../servicos/autenticacao";

/* EMOJIS DISPONÍVEIS NO CAMPO DE MENSAGEM */
const emojisDisponiveis = [
  "🐾", "🐶", "🐱", "❤️",
  "😊", "😂", "😍", "👍",
  "🙏", "🎉", "😢", "📍",
];

/* FORMATA O HORÁRIO DE UMA MENSAGEM */
function formatarHorario(data) {
  if (!data) return "";

  const dataConvertida = new Date(data);
  if (Number.isNaN(dataConvertida.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(dataConvertida);
}

/* ADAPTA OS DADOS DE CONVERSAS RECEBIDOS DA API */
function adaptarConversa(conversa) {
  return {
    ...conversa,

    nome: conversa.outroUsuario?.nome || "Usuário",

    avatar: conversa.outroUsuario?.foto_perfil
      ? `${API_BASE_URL}/files/${conversa.outroUsuario.foto_perfil}`
      : null,

    ultima:
      conversa.ultimaMensagem?.texto ||
      "Nenhuma mensagem ainda.",

    horario: formatarHorario(
      conversa.ultimaMensagem?.data_criacao ||
      conversa.data_atualizacao
    ),

    categoria: conversa.publicacao?.tipo || "GERAL",
  };
}

/* ADAPTA UMA MENSAGEM PARA O LADO CORRETO DO CHAT */
function adaptarMensagem(mensagem, idUsuarioAtual) {
  return {
    ...mensagem,

    lado:
      String(mensagem.id_usuario) ===
      String(idUsuarioAtual)
        ? "enviada"
        : "recebida",

    texto: mensagem.texto || "",

    hora: formatarHorario(mensagem.data_criacao),

    lida:
      String(mensagem.id_usuario) ===
      String(idUsuarioAtual),

    avatar: mensagem.usuario?.foto_perfil
      ? `${API_BASE_URL}/files/${mensagem.usuario.foto_perfil}`
      : null,
  };
}

/* IDENTIFICA A ABA CORRESPONDENTE */
function abaDaCategoria(categoria) {
  if (categoria === "TINDER_PET") return "tinder";
  if (categoria === "ADOCAO") return "adocao";
  return "achados";
}

/* DEFINE QUAIS CONVERSAS PERTENCEM A CADA ABA */
function conversaPertenceAba(conversa, aba) {
  if (aba === "tinder") {
    return conversa.categoria === "TINDER_PET";
  }

  if (aba === "adocao") {
    return conversa.categoria === "ADOCAO";
  }

  return ["PERDIDO", "ENCONTRADO", "GERAL"].includes(
    conversa.categoria
  );
}

/*
========================================================
 TELA DE BOAS-VINDAS

 Aparece quando não existe conversa selecionada.
 Não interfere nas mensagens e não cria dados falsos.
========================================================
*/
function ChatSemConversa() {
  return (
    <div className="chat-no-conversation">
      <div className="chat-welcome-card">
        {/* Elementos decorativos */}
        <div
          className="chat-welcome-paws"
          aria-hidden="true"
        >
          <span>🐾</span>
          <span>🐾</span>
        </div>

        {/* Ícone principal */}
        <div
          className="chat-welcome-icon"
          aria-hidden="true"
        >
          💬
        </div>

        <h2>Suas conversas começam aqui!</h2>

        <p>
          Escolha uma conversa ao lado ou demonstre
          interesse em uma publicação para começar
          a conversar com outro tutor.
        </p>

        {/* Detalhes visuais */}
        <div className="chat-welcome-tags">
          <span>🐾 Conecte-se</span>
          <span>❤️ Cuide</span>
          <span>🏡 Adote</span>
        </div>
      </div>
    </div>
  );
}

/*
========================================================
 COMPONENTE PRINCIPAL
========================================================
*/
export default function Chat() {
  /* ESTADOS DAS CONVERSAS */
  const [conversas, setConversas] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);

  /* ESTADOS DE CARREGAMENTO */
  const [carregandoConversas, setCarregandoConversas] =
    useState(true);

  const [carregandoMensagens, setCarregandoMensagens] =
    useState(false);

  /* CONTROLES DA INTERFACE */
  const [erro, setErro] = useState("");
  const [barraRecolhida, setBarraRecolhida] =
    useState(false);

  const [abaAtiva, setAbaAtiva] = useState("achados");
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [emojisAbertos, setEmojisAbertos] = useState(false);
  const [enviando, setEnviando] = useState(false);

  /* NAVEGAÇÃO E USUÁRIO ATUAL */
  const localizacao = useLocation();
  const navegar = useNavigate();
  const usuarioAtual = obterUsuarioAtual();
  const idUsuarioAtual = usuarioAtual?.id;

  /*
  ======================================================
   CARREGAR CONVERSAS REAIS
  ======================================================
  */
  useEffect(() => {
    let ativo = true;

    async function carregarConversas() {
      try {
        setCarregandoConversas(true);
        setErro("");

        const resposta = await listarConversas();

        if (!ativo) return;

        const lista = Array.isArray(resposta)
          ? resposta.map(adaptarConversa)
          : [];

        setConversas(lista);

        /* Verifica se uma conversa veio pela URL */
        const idSolicitado = new URLSearchParams(
          localizacao.search
        ).get("conversa");

        const solicitada = lista.find(
          (conversa) =>
            String(conversa.id) === String(idSolicitado)
        );

        const inicial = solicitada || lista[0] || null;

        setConversaAtiva(inicial);

        if (inicial) {
          setAbaAtiva(abaDaCategoria(inicial.categoria));
        }
      } catch (erroApi) {
        if (ativo) {
          setErro(
            erroApi.message ||
            "Não foi possível carregar suas conversas."
          );
        }
      } finally {
        if (ativo) {
          setCarregandoConversas(false);
        }
      }
    }

    carregarConversas();

    return () => {
      ativo = false;
    };
  }, [localizacao.search]);

  /*
  ======================================================
   CARREGAR MENSAGENS DA CONVERSA SELECIONADA
  ======================================================
  */
  useEffect(() => {
    let ativo = true;

    async function carregarMensagens() {
      if (!conversaAtiva?.id || !idUsuarioAtual) {
        setMensagens([]);
        return;
      }

      try {
        setCarregandoMensagens(true);
        setErro("");

        const resposta = await listarMensagensConversa(
          conversaAtiva.id
        );

        if (!ativo) return;

        setMensagens(
          Array.isArray(resposta)
            ? resposta.map((mensagem) =>
                adaptarMensagem(mensagem, idUsuarioAtual)
              )
            : []
        );
      } catch (erroApi) {
        if (ativo) {
          setErro(
            erroApi.message ||
            "Não foi possível carregar as mensagens."
          );
        }
      } finally {
        if (ativo) {
          setCarregandoMensagens(false);
        }
      }
    }

    carregarMensagens();

    return () => {
      ativo = false;
    };
  }, [conversaAtiva?.id, idUsuarioAtual]);

  /*
  ======================================================
   PESQUISAR CONVERSAS DA ABA ATIVA
  ======================================================
  */
  const conversasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return conversas.filter((conversa) => {
      return (
        conversaPertenceAba(conversa, abaAtiva) &&
        conversa.nome.toLowerCase().includes(termo)
      );
    });
  }, [conversas, abaAtiva, busca]);

  /*
  ======================================================
   SELECIONAR CONVERSA
  ======================================================
  */
  function selecionarConversa(conversa) {
    setConversaAtiva(conversa);
    setEmojisAbertos(false);

    navegar(
      `/chat?conversa=${encodeURIComponent(conversa.id)}`,
      { replace: true }
    );
  }

  /*
  ======================================================
   TROCAR ABA
  ======================================================
  */
  function trocarAba(aba) {
    setAbaAtiva(aba);
    setTexto("");
    setEmojisAbertos(false);

    const primeira = conversas.find((conversa) =>
      conversaPertenceAba(conversa, aba)
    );

    if (primeira) {
      selecionarConversa(primeira);
    } else {
      setConversaAtiva(null);
      navegar("/chat", { replace: true });
    }
  }

  /*
  ======================================================
   ENVIAR MENSAGEM PELA API
  ======================================================
  */
  async function enviarMensagem(event) {
    event.preventDefault();

    const mensagemLimpa = texto.trim();

    if (
      !mensagemLimpa ||
      !conversaAtiva ||
      enviando
    ) {
      return;
    }

    try {
      setEnviando(true);
      setErro("");

      const resposta = await enviarMensagemConversa(
        conversaAtiva.id,
        mensagemLimpa
      );

      /* Atualiza a lista de mensagens exibidas */
      setMensagens((atuais) => [
        ...atuais,
        adaptarMensagem(resposta, idUsuarioAtual),
      ]);

      /* Atualiza a prévia da última mensagem */
      setConversas((atuais) =>
        atuais.map((conversa) =>
          conversa.id === conversaAtiva.id
            ? {
                ...conversa,
                ultima: resposta.texto,
                horario: formatarHorario(
                  resposta.data_criacao
                ),
                ultimaMensagem: resposta,
              }
            : conversa
        )
      );

      setTexto("");
      setEmojisAbertos(false);
    } catch (erroApi) {
      setErro(
        erroApi.message ||
        "Não foi possível enviar a mensagem."
      );
    } finally {
      setEnviando(false);
    }
  }

  /* INSERIR EMOJI NA MENSAGEM */
  function inserirEmoji(emoji) {
    setTexto((atual) => `${atual}${emoji}`);
    setEmojisAbertos(false);
  }

  /* IDENTIFICA QUANDO A LISTA ESTÁ VAZIA */
  const conversaVazia =
    !carregandoConversas &&
    conversasFiltradas.length === 0;

  /*
  ======================================================
   INTERFACE DO CHAT
  ======================================================
  */
  return (
    <main
      className={`chat-page chat-theme-${abaAtiva} ${
        barraRecolhida ? "chat-sidebar-collapsed" : ""
      }`}
    >
      {/* ================================================
          MENU LATERAL DE CONVERSAS
      ================================================ */}

      <aside className="chat-sidebar">
        {/* Recolher / expandir menu */}
        <button
          className="chat-sidebar-toggle"
          type="button"
          onClick={() =>
            setBarraRecolhida((atual) => !atual)
          }
          aria-label={
            barraRecolhida
              ? "Expandir barra de conversas"
              : "Recolher barra de conversas"
          }
          aria-expanded={!barraRecolhida}
        >
          {barraRecolhida ? "›" : "‹"}
        </button>

        {/* Logo clicável */}
        <Link
          to="/"
          className="chat-brand"
          aria-label="Voltar para a página inicial"
        >
          <img
            className="chat-brand-logo"
            src={logotipo}
            alt="Cerca Trova"
          />
        </Link>

        {/* Título do menu */}
        <div className="chat-sidebar-title">
          <span
            className="chat-bubble-icon"
            aria-hidden="true"
          >
            ◌
          </span>
          <h1>Chat</h1>
        </div>

        {/* Buscar conversas */}
        <label className="chat-search">
          <span aria-hidden="true">⌕</span>

          <input
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
            placeholder="Pesquisar conversas"
            aria-label="Pesquisar conversas"
          />
        </label>

        {/* Lista real de conversas */}
        <div className="conversation-list">
          {carregandoConversas ? (
            <p className="chat-inline-status">
              Carregando conversas...
            </p>
          ) : conversaVazia ? (
            <p className="chat-inline-status">
              Nenhuma conversa nesta categoria.
            </p>
          ) : (
            conversasFiltradas.map((conversa) => (
              <button
                key={conversa.id}
                type="button"
                className={`conversation-item ${
                  conversaAtiva?.id === conversa.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  selecionarConversa(conversa)
                }
              >
                {/* Avatar */}
                <span className="pet-avatar avatar-azul">
                  {conversa.avatar ? (
                    <img
                      src={conversa.avatar}
                      alt={conversa.nome}
                    />
                  ) : (
                    "🐾"
                  )}
                </span>

                {/* Nome e última mensagem */}
                <span className="conversation-copy">
                  <strong>{conversa.nome}</strong>
                  <small>{conversa.ultima}</small>
                </span>

                {/* Horário */}
                <span className="conversation-meta">
                  <small>{conversa.horario}</small>
                </span>
              </button>
            ))
          )}
        </div>

        {/* Ícone de configurações visual existente */}
        <span
          className="chat-settings"
          aria-hidden="true"
        >
          ⚙
        </span>
      </aside>

      {/* ================================================
          ÁREA DIREITA DO CHAT
      ================================================ */}

      <section className="chat-conversation">
        {/* TRÊS ABAS SUPERIORES */}
        <div
          className="chat-tabs"
          aria-label="Categorias do chat"
        >
          <button
            type="button"
            className={`tab-search ${
              abaAtiva === "achados" ? "active" : ""
            }`}
            onClick={() => trocarAba("achados")}
            aria-pressed={abaAtiva === "achados"}
          >
            <span className="tab-icon">⌕</span>
            <span className="tab-text">
              Achados e Perdidos
            </span>
          </button>

          <button
            type="button"
            className={`tab-match ${
              abaAtiva === "tinder" ? "active" : ""
            }`}
            onClick={() => trocarAba("tinder")}
            aria-pressed={abaAtiva === "tinder"}
          >
            <span className="tab-icon">♥</span>
            <span className="tab-text">
              TinderPet
            </span>
          </button>

          <button
            type="button"
            className={`tab-adoption ${
              abaAtiva === "adocao" ? "active" : ""
            }`}
            onClick={() => trocarAba("adocao")}
            aria-pressed={abaAtiva === "adocao"}
          >
            <span className="tab-icon">♣</span>
            <span className="tab-text">
              Adoção
            </span>
          </button>
        </div>

        {/* ==============================================
            CONVERSA SELECIONADA
        ============================================== */}
        {conversaAtiva ? (
          <>
            {/* Cabeçalho da conversa */}
            <header className="conversation-header">
              <span className="pet-avatar avatar-azul">
                {conversaAtiva.avatar ? (
                  <img
                    src={conversaAtiva.avatar}
                    alt={conversaAtiva.nome}
                  />
                ) : (
                  "🐾"
                )}
              </span>

              <div>
                <h2>{conversaAtiva.nome}</h2>
                <p>
                  Conversa sobre uma publicação
                  da comunidade
                </p>
              </div>
            </header>

            {/* Mensagens recebidas e enviadas */}
            <div className="messages-area">
              {carregandoMensagens ? (
                <p className="chat-inline-status">
                  Carregando mensagens...
                </p>
              ) : mensagens.length === 0 ? (
                <div className="chat-messages-empty">
                  <span aria-hidden="true">💌</span>
                  <p>
                    Esta conversa ainda não tem mensagens.
                    Envie uma mensagem para começar!
                  </p>
                </div>
              ) : (
                mensagens.map((mensagem) => (
                  <div
                    key={mensagem.id}
                    className={`message-row ${mensagem.lado}`}
                  >
                    {/* Avatar de quem enviou */}
                    {mensagem.lado === "recebida" && (
                      <span className="pet-avatar small avatar-laranja">
                        {mensagem.avatar ? (
                          <img
                            src={mensagem.avatar}
                            alt=""
                          />
                        ) : (
                          "🐾"
                        )}
                      </span>
                    )}

                    {/* Bolha de mensagem */}
                    <div className="message-group">
                      <div className="message-bubble">
                        {mensagem.texto}
                      </div>

                      <small>
                        {mensagem.hora}
                        {mensagem.lida && (
                          <b className="read-mark">✓✓</b>
                        )}
                      </small>
                    </div>

                    {/* Avatar do usuário atual */}
                    {mensagem.lado === "enviada" && (
                      <span className="pet-avatar small avatar-azul">
                        {usuarioAtual?.foto_perfil ? (
                          <img
                            src={`${API_BASE_URL}/files/${usuarioAtual.foto_perfil}`}
                            alt=""
                          />
                        ) : (
                          "🐾"
                        )}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Campo de envio de mensagens */}
            <form
              className="message-composer"
              onSubmit={enviarMensagem}
            >
              {/* Seletor de emojis */}
              <div className="emoji-picker-wrapper">
                <button
                  type="button"
                  className={`composer-icon ${
                    emojisAbertos ? "active" : ""
                  }`}
                  onClick={() =>
                    setEmojisAbertos((atual) => !atual)
                  }
                  aria-label="Adicionar emoji"
                  aria-expanded={emojisAbertos}
                >
                  ☺
                </button>

                {/* Paleta de emojis */}
                {emojisAbertos && (
                  <div
                    className="chat-emoji-picker"
                    role="dialog"
                    aria-label="Selecionar emoji"
                  >
                    {emojisDisponiveis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => inserirEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Texto da mensagem */}
              <input
                value={texto}
                onChange={(event) =>
                  setTexto(event.target.value)
                }
                placeholder="Digite sua mensagem..."
                aria-label="Digite sua mensagem"
                disabled={enviando}
              />

              {/* Enviar */}
              <button
                type="submit"
                className="send-button"
                aria-label="Enviar mensagem"
                disabled={enviando || !texto.trim()}
              >
                ➤
              </button>
            </form>
          </>
        ) : (
          /*
           ============================================
           NENHUMA CONVERSA SELECIONADA
           ============================================
           Exibe o novo estado vazio centralizado.
          */
          <ChatSemConversa />
        )}

        {/* Erros recebidos da API */}
        {erro && (
          <p className="chat-error" role="alert">
            {erro}
          </p>
        )}
      </section>
    </main>
  );
}

/* FIM DO CHAT.JSX */
