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

/* Emojis rápidos continuam sendo uma ferramenta local da interface, não dados de conversa. */
const emojisDisponiveis = [
  "🐾",
  "🐶",
  "🐱",
  "❤️",
  "😊",
  "😂",
  "😍",
  "👍",
  "🙏",
  "🎉",
  "😢",
  "📍",
];

/* Normaliza uma conversa da API para o formato usado pela interface existente. */
function adaptarConversa(conversa) {
  return {
    ...conversa,
    nome: conversa.outroUsuario?.nome || "Usuário",
    avatar: conversa.outroUsuario?.foto_perfil
      ? `${API_BASE_URL}/files/${conversa.outroUsuario.foto_perfil}`
      : null,
    ultima: conversa.ultimaMensagem?.texto || "Nenhuma mensagem ainda.",
    horario: conversa.ultimaMensagem?.data_criacao
      ? formatarHorario(conversa.ultimaMensagem.data_criacao)
      : formatarHorario(conversa.data_atualizacao),
    categoria: conversa.publicacao?.tipo || "GERAL",
  };
}

/* Apresenta horários reais sem depender de valores fixos no componente. */
function formatarHorario(data) {
  if (!data) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

/* Converte a mensagem persistida para o formato visual do chat. */
function adaptarMensagem(mensagem, idUsuarioAtual) {
  return {
    ...mensagem,
    lado: mensagem.id_usuario === idUsuarioAtual ? "enviada" : "recebida",
    texto: mensagem.texto,
    hora: formatarHorario(mensagem.data_criacao),
    lida: mensagem.id_usuario === idUsuarioAtual,
    avatar: mensagem.usuario?.foto_perfil
      ? `${API_BASE_URL}/files/${mensagem.usuario.foto_perfil}`
      : null,
  };
}

/* Define em qual aba uma conversa de publicação deve aparecer. */
function abaDaCategoria(categoria) {
  if (categoria === "TINDER_PET") {
    return "tinder";
  }

  if (categoria === "ADOCAO") {
    return "adocao";
  }

  return "achados";
}

/* Filtra as conversas reais sem criar registros artificiais para as abas. */
function conversaPertenceAba(conversa, aba) {
  if (aba === "tinder") {
    return conversa.categoria === "TINDER_PET";
  }

  if (aba === "adocao") {
    return conversa.categoria === "ADOCAO";
  }

  return ["PERDIDO", "ENCONTRADO", "GERAL"].includes(conversa.categoria);
}

export default function Chat() {
  const [conversas, setConversas] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [carregandoConversas, setCarregandoConversas] = useState(true);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [erro, setErro] = useState("");
  const [barraRecolhida, setBarraRecolhida] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("achados");
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [emojisAbertos, setEmojisAbertos] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const localizacao = useLocation();
  const navegar = useNavigate();
  const usuarioAtual = obterUsuarioAtual();
  const idUsuarioAtual = usuarioAtual?.id;

  /* Carrega exclusivamente as conversas persistidas do usuário autenticado. */
  useEffect(() => {
    let ativo = true;

    async function carregarConversasReais() {
      try {
        setCarregandoConversas(true);
        const resposta = await listarConversas();
        if (!ativo) {
          return;
        }

        const conversasAdaptadas = Array.isArray(resposta)
          ? resposta.map(adaptarConversa)
          : [];
        setConversas(conversasAdaptadas);

        const idSolicitado = new URLSearchParams(localizacao.search).get("conversa");
        const conversaSolicitada = conversasAdaptadas.find(
          (conversa) => conversa.id === idSolicitado,
        );
        const conversaInicial = conversaSolicitada || conversasAdaptadas[0] || null;

        if (conversaInicial) {
          setConversaAtiva(conversaInicial);
          setAbaAtiva(abaDaCategoria(conversaInicial.categoria));
        }
      } catch (erroApi) {
        if (ativo) {
          setErro(erroApi.message || "Não foi possível carregar suas conversas.");
        }
      } finally {
        if (ativo) {
          setCarregandoConversas(false);
        }
      }
    }

    carregarConversasReais();

    return () => {
      ativo = false;
    };
  }, [localizacao.search]);

  /* Busca as mensagens sempre que o usuário troca a conversa ativa. */
  useEffect(() => {
    let ativo = true;

    async function carregarMensagensReais() {
      if (!conversaAtiva?.id || !idUsuarioAtual) {
        setMensagens([]);
        return;
      }

      try {
        setCarregandoMensagens(true);
        const resposta = await listarMensagensConversa(conversaAtiva.id);
        if (ativo) {
          setMensagens(
            Array.isArray(resposta)
              ? resposta.map((mensagem) =>
                  adaptarMensagem(mensagem, idUsuarioAtual),
                )
              : [],
          );
        }
      } catch (erroApi) {
        if (ativo) {
          setErro(erroApi.message || "Não foi possível carregar as mensagens.");
        }
      } finally {
        if (ativo) {
          setCarregandoMensagens(false);
        }
      }
    }

    carregarMensagensReais();

    return () => {
      ativo = false;
    };
  }, [conversaAtiva?.id, idUsuarioAtual]);

  /* Mantém a busca limitada às conversas reais recebidas da API. */
  const conversasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return conversas.filter(
      (conversa) =>
        conversaPertenceAba(conversa, abaAtiva) &&
        conversa.nome.toLowerCase().includes(termo),
    );
  }, [abaAtiva, busca, conversas]);

  /* Seleciona uma conversa real e atualiza a URL para permitir compartilhamento interno. */
  function selecionarConversa(conversa) {
    setConversaAtiva(conversa);
    navegar(`/chat?conversa=${encodeURIComponent(conversa.id)}`, {
      replace: true,
    });
  }

  /* Troca a categoria sem inventar conversas vazias. */
  function trocarAba(aba) {
    setAbaAtiva(aba);
    setTexto("");
    setEmojisAbertos(false);

    const primeiraConversaDaAba = conversas.find((conversa) =>
      conversaPertenceAba(conversa, aba),
    );
    if (primeiraConversaDaAba) {
      selecionarConversa(primeiraConversaDaAba);
    } else {
      setConversaAtiva(null);
    }
  }

  /* Persiste a mensagem e atualiza o painel sem inserir mensagem mockada. */
  async function enviarMensagem(event) {
    event.preventDefault();
    const mensagemLimpa = texto.trim();

    if (!mensagemLimpa || !conversaAtiva || enviando) {
      return;
    }

    try {
      setEnviando(true);
      const resposta = await enviarMensagemConversa(
        conversaAtiva.id,
        mensagemLimpa,
      );
      setMensagens((atuais) => [
        ...atuais,
        adaptarMensagem(resposta, idUsuarioAtual),
      ]);
      setConversas((atuais) =>
        atuais.map((conversa) =>
          conversa.id === conversaAtiva.id
            ? {
                ...conversa,
                ultima: resposta.texto,
                horario: formatarHorario(resposta.data_criacao),
                ultimaMensagem: resposta,
              }
            : conversa,
        ),
      );
      setTexto("");
      setEmojisAbertos(false);
    } catch (erroApi) {
      setErro(erroApi.message || "Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  /* Insere um emoji no campo de texto sem alterar a persistência do chat. */
  function inserirEmoji(emoji) {
    setTexto((textoAtual) => `${textoAtual}${emoji}`);
    setEmojisAbertos(false);
  }

  const conversaVazia = !carregandoConversas && conversasFiltradas.length === 0;

  return (
    <main
      className={`chat-page chat-theme-${abaAtiva} ${
        barraRecolhida ? "chat-sidebar-collapsed" : ""
      }`}
    >
      <aside className="chat-sidebar">
        <button
          className="chat-sidebar-toggle"
          type="button"
          onClick={() => setBarraRecolhida((estado) => !estado)}
          aria-label={barraRecolhida ? "Expandir barra de conversas" : "Recolher barra de conversas"}
          aria-expanded={!barraRecolhida}
        >
          {barraRecolhida ? "›" : "‹"}
        </button>

        <Link
          to="/"
          className="chat-brand"
          aria-label="Voltar para a página inicial"
        >
          <img className="chat-brand-logo" src={logotipo} alt="Cerca Trova" />
        </Link>

        <div className="chat-sidebar-title">
          <span className="chat-bubble-icon" aria-hidden="true">◌</span>
          <h1>Chat</h1>
        </div>

        <label className="chat-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Pesquisar conversas"
            aria-label="Pesquisar conversas"
          />
        </label>

        <div className="conversation-list">
          {carregandoConversas ? (
            <p className="chat-empty-state">Carregando conversas...</p>
          ) : conversaVazia ? (
            <p className="chat-empty-state">Nenhuma conversa nesta categoria.</p>
          ) : (
            conversasFiltradas.map((conversa) => (
              <button
                key={conversa.id}
                type="button"
                className={`conversation-item ${
                  conversaAtiva?.id === conversa.id ? "active" : ""
                }`}
                onClick={() => selecionarConversa(conversa)}
              >
                <span className="pet-avatar avatar-azul">
                  {conversa.avatar ? (
                    <img src={conversa.avatar} alt={conversa.nome} />
                  ) : (
                    "🐾"
                  )}
                </span>
                <span className="conversation-copy">
                  <strong>{conversa.nome}</strong>
                  <small>{conversa.ultima}</small>
                </span>
                <span className="conversation-meta">
                  <small>{conversa.horario}</small>
                </span>
              </button>
            ))
          )}
        </div>

        <button className="chat-settings" type="button" aria-label="Configurações">
          ⚙
        </button>
      </aside>

      <section className="chat-conversation">
        <div className="chat-tabs" aria-label="Categorias do chat">
          <button
            className={`tab-search ${abaAtiva === "achados" ? "active" : ""}`}
            type="button"
            onClick={() => trocarAba("achados")}
            aria-pressed={abaAtiva === "achados"}
          >
            <span className="tab-icon">⌕</span>
            <span className="tab-text">Achados e Perdidos</span>
          </button>
          <button
            className={`tab-match ${abaAtiva === "tinder" ? "active" : ""}`}
            type="button"
            onClick={() => trocarAba("tinder")}
            aria-pressed={abaAtiva === "tinder"}
          >
            <span className="tab-icon">♥</span>
            <span className="tab-text">TinderPet</span>
          </button>
          <button
            className={`tab-adoption ${abaAtiva === "adocao" ? "active" : ""}`}
            type="button"
            onClick={() => trocarAba("adocao")}
            aria-pressed={abaAtiva === "adocao"}
          >
            <span className="tab-icon">♣</span>
            <span className="tab-text">Adoção</span>
          </button>
        </div>

        {conversaAtiva ? (
          <>
            <header className="conversation-header">
              <span className="pet-avatar avatar-azul">
                {conversaAtiva.avatar ? (
                  <img src={conversaAtiva.avatar} alt={conversaAtiva.nome} />
                ) : (
                  "🐾"
                )}
              </span>
              <div>
                <h2>{conversaAtiva.nome}</h2>
                <p>Conversa sobre uma publicação da comunidade</p>
              </div>
              <button className="more-button" type="button" aria-label="Mais opções">
                ⋮
              </button>
            </header>

            <div className="messages-area">
              {carregandoMensagens ? (
                <p className="chat-empty-state">Carregando mensagens...</p>
              ) : mensagens.length === 0 ? (
                <p className="chat-empty-state">
                  Esta conversa ainda não tem mensagens. Envie uma mensagem para começar.
                </p>
              ) : (
                mensagens.map((mensagem) => (
                  <div key={mensagem.id} className={`message-row ${mensagem.lado}`}>
                    {mensagem.lado === "recebida" && (
                      <span className="pet-avatar small avatar-laranja">
                        {mensagem.avatar ? (
                          <img src={mensagem.avatar} alt="" />
                        ) : (
                          "🐾"
                        )}
                      </span>
                    )}
                    <div className="message-group">
                      <div className="message-bubble">
                        {mensagem.texto.split("\n").map((linha, index) => (
                          <span key={`${mensagem.id}-${index}`}>
                            {linha}
                            {index < mensagem.texto.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                      <small>
                        {mensagem.hora}
                        {mensagem.lida && <b className="read-mark">✓✓</b>}
                      </small>
                    </div>
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

            <form className="message-composer" onSubmit={enviarMensagem}>
              <div className="emoji-picker-wrapper">
                <button
                  type="button"
                  className={`composer-icon ${emojisAbertos ? "active" : ""}`}
                  onClick={() => setEmojisAbertos((estado) => !estado)}
                  aria-label="Adicionar emoji"
                  aria-expanded={emojisAbertos}
                >
                  ☺
                </button>
                {emojisAbertos && (
                  <div className="chat-emoji-picker" role="dialog" aria-label="Selecionar emoji">
                    {emojisDisponiveis.map((emoji) => (
                      <button key={emoji} type="button" onClick={() => inserirEmoji(emoji)}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
                placeholder="Digite sua mensagem..."
                aria-label="Digite sua mensagem"
                disabled={enviando}
              />
              <button type="submit" className="send-button" aria-label="Enviar mensagem" disabled={enviando}>
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="chat-no-conversation">
            <span aria-hidden="true">🐾</span>
            <h2>Selecione uma conversa</h2>
            <p>Clique em “Tenho interesse” em uma publicação para iniciar um chat com o dono.</p>
          </div>
        )}

        {erro && <p className="chat-error" role="alert">{erro}</p>}
      </section>
    </main>
  );
}
