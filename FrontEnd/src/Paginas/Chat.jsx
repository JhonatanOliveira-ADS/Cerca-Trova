import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../assets/css/Chat.css";

import logotipo from "../assets/imagens/logotipo.png";

// ======================================================
// CONVERSAS
// ======================================================

const conversasIniciais = [
  {
    id: 1,
    nome: "Luna",
    especie: "Gata",
    idade: "2 anos",
    detalhe: "SRD",
    horario: "14:32",
    ultima: "Sim, acho que encontrei...",
    avatar: "/src/assets/loki.png",
    naoLidas: 1,
    cor: "azul",
  },
  {
    id: 2,
    nome: "Thor",
    especie: "Cachorro",
    idade: "4 anos",
    detalhe: "Beagle",
    horario: "12:17",
    ultima: "Obrigado pela ajuda! 🙏",
    avatar: "/src/assets/husky.jpg",
    online: true,
    cor: "laranja",
  },
  {
    id: 3,
    nome: "Mel",
    especie: "Gata",
    idade: "1 ano",
    detalhe: "Siamês",
    horario: "11:03",
    ultima: "Perfeito! Vou chamar meus...",
    avatar: "/src/assets/lalinha.jpg",
    cor: "rosa",
  },
  {
    id: 4,
    nome: "Billy",
    especie: "Cachorro",
    idade: "3 anos",
    detalhe: "SRD",
    horario: "Ontem",
    ultima: "Até mais! 🐾",
    avatar: "/src/assets/rottweiler.webp",
    cor: "azul",
  },
  {
    id: 5,
    nome: "Lupita",
    especie: "Gata",
    idade: "2 anos",
    detalhe: "SRD",
    horario: "Ontem",
    ultima: "Você tem alguma novidade?",
    avatar: "/src/assets/lalinha.jpg",
    cor: "laranja",
  },
  {
    id: 6,
    nome: "Jade",
    especie: "Cachorro",
    idade: "5 anos",
    detalhe: "SRD",
    horario: "Seg",
    ultima: "Obrigada! ❤️",
    avatar: "/src/assets/border-collie.webp",
    cor: "rosa",
  },
  {
    id: 7,
    nome: "Simba",
    especie: "Gato",
    idade: "1 ano",
    detalhe: "SRD",
    horario: "Seg",
    ultima: "Vamos marcar um encontro?",
    avatar: "/src/assets/loki.png",
    cor: "azul",
  },
];

// ======================================================
// MENSAGENS
// ======================================================

const mensagensIniciais = [
  {
    id: 1,
    lado: "recebida",
    texto: "Oi! Você encontrou a Luna?",
    hora: "14:12",
  },
  {
    id: 2,
    lado: "enviada",
    texto: "Sim, acho que encontrei perto da praça!",
    hora: "14:20",
    lida: true,
  },
  {
    id: 3,
    lado: "recebida",
    texto: "Que ótimo! Ela estava bem?\nVocê pode me enviar uma foto?",
    hora: "14:24",
  },
  {
    id: 4,
    lado: "enviada",
    texto: "Sim, ela está bem! Vou te mandar uma foto agora.",
    hora: "14:28",
    lida: true,
  },
  {
    id: 5,
    lado: "recebida",
    texto: "Nossa! É ela mesmo! ❤️",
    hora: "14:32",
  },
];

const mensagensPorAbaIniciais = {
  achados: mensagensIniciais,

  tinder: [
    {
      id: 11,
      lado: "recebida",
      texto: "Oi! Gostei muito do perfil da Luna!",
      hora: "13:40",
    },
    {
      id: 12,
      lado: "enviada",
      texto: "Ela também parece ter gostado do Thor!",
      hora: "13:46",
      lida: true,
    },
    {
      id: 13,
      lado: "recebida",
      texto: "Que tal marcarmos um encontro no parque?",
      hora: "13:49",
    },
  ],

  adocao: [
    {
      id: 21,
      lado: "recebida",
      texto: "Olá! Ainda está disponível para adoção?",
      hora: "10:15",
    },
    {
      id: 22,
      lado: "enviada",
      texto: "Sim! Podemos conversar sobre os cuidados dela.",
      hora: "10:21",
      lida: true,
    },
    {
      id: 23,
      lado: "recebida",
      texto: "Perfeito. Vou enviar meus dados para a entrevista.",
      hora: "10:25",
    },
  ],
};

/* Emojis mais usados no contexto de pets e conversas da plataforma. */
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

// ======================================================
// COMPONENTE
// ======================================================

export default function Chat() {
  const [conversas, setConversas] = useState(conversasIniciais);

  // Controla se a barra lateral permanece recolhida, como o painel lateral do VS Code.
  const [barraRecolhida, setBarraRecolhida] = useState(false);

  const [conversaAtiva, setConversaAtiva] = useState(
    conversasIniciais[0]
  );

  const [abaAtiva, setAbaAtiva] = useState("achados");

  const [mensagensPorAba, setMensagensPorAba] = useState(
    mensagensPorAbaIniciais
  );

  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [anexoSelecionado, setAnexoSelecionado] = useState(false);
  const [emojisAbertos, setEmojisAbertos] = useState(false);

  // ====================================================
  // PESQUISA
  // ====================================================

  const conversasFiltradas = useMemo(() => {
    return conversas.filter((conversa) =>
      conversa.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca, conversas]);

  const mensagens = mensagensPorAba[abaAtiva] || [];

  // ====================================================
  // ENVIAR MENSAGEM
  // ====================================================

  function enviarMensagem(event) {
    event.preventDefault();

    const mensagem = texto.trim();

    if (!mensagem && !anexoSelecionado) {
      return;
    }

    setMensagensPorAba((atuais) => ({
      ...atuais,

      [abaAtiva]: [
        ...(atuais[abaAtiva] || []),

        {
          id: Date.now(),
          lado: "enviada",
          texto: mensagem || "📎 Arquivo anexado",
          hora: "agora",
          lida: true,
        },
      ],
    }));

    setTexto("");
    setAnexoSelecionado(false);
    setEmojisAbertos(false);
  }

  // ====================================================
  // SELECIONAR CONVERSA
  // ====================================================

  function selecionarConversa(conversa) {
    setConversaAtiva(conversa);

    setConversas((atuais) =>
      atuais.map((item) =>
        item.id === conversa.id
          ? {
              ...item,
              naoLidas: 0,
            }
          : item
      )
    );
  }

  // ====================================================
  // TROCAR ABA
  // ====================================================

  function trocarAba(aba) {
    setAbaAtiva(aba);
    setTexto("");
    setAnexoSelecionado(false);
    setEmojisAbertos(false);
  }

  /* Insere o emoji selecionado no final da mensagem em edição. */
  function inserirEmoji(emoji) {
    setTexto((textoAtual) => `${textoAtual}${emoji}`);
    setEmojisAbertos(false);
  }

  // Alterna o estado fixo da barra lateral entre expandida e recolhida.
  function alternarBarraLateral() {
    setBarraRecolhida((estadoAtual) => !estadoAtual);
  }

  // ====================================================
  // JSX
  // ====================================================

  return (
    <main
      className={`chat-page chat-theme-${abaAtiva} ${
        barraRecolhida ? "chat-sidebar-collapsed" : ""
      }`}
    >
      {/* =================================================
          PAINEL ESQUERDO
      ================================================= */}

      <aside className="chat-sidebar">
        {/* CONTROLE DA BARRA LATERAL: alterna exclusivamente pelo clique no botão. */}
        <button
          className="chat-sidebar-toggle"
          type="button"
          onClick={alternarBarraLateral}
          aria-label={
            barraRecolhida
              ? "Expandir barra de conversas"
              : "Recolher barra de conversas"
          }
          aria-expanded={!barraRecolhida}
          title={
            barraRecolhida
              ? "Expandir barra de conversas"
              : "Recolher barra de conversas"
          }
        >
          {barraRecolhida ? "›" : "‹"}
        </button>

        {/* LOGO - CLICA E VOLTA PARA HOME */}

        <Link
          to="/"
          className="chat-brand"
          aria-label="Voltar para a página inicial"
          title="Voltar para o início"
        >
          <img
            className="chat-brand-logo"
            src={logotipo}
            alt="Cerca Trova"
          />
        </Link>

        {/* TÍTULO */}

        <div className="chat-sidebar-title">
          <span
            className="chat-bubble-icon"
            aria-hidden="true"
          >
            ◌
          </span>

          <h1>Chat</h1>
        </div>

        {/* PESQUISA */}

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

        {/* LISTA DE CONVERSAS */}

        <div className="conversation-list">
          {conversasFiltradas.map((conversa) => (
            <button
              key={conversa.id}
              type="button"
              className={`conversation-item ${
                conversaAtiva.id === conversa.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                selecionarConversa(conversa)
              }
            >
              <span
                className={`pet-avatar avatar-${conversa.cor}`}
              >
                <img
                  src={conversa.avatar}
                  alt={conversa.nome}
                />
              </span>

              <span className="conversation-copy">
                <strong>{conversa.nome}</strong>

                <small>
                  {conversa.ultima}
                </small>
              </span>

              <span className="conversation-meta">
                <small>
                  {conversa.horario}
                </small>

                {conversa.naoLidas ? (
                  <b>{conversa.naoLidas}</b>
                ) : conversa.online ? (
                  <i aria-label="online" />
                ) : null}
              </span>
            </button>
          ))}
        </div>

        {/* CONFIGURAÇÕES */}

        <button
          className="chat-settings"
          type="button"
          aria-label="Configurações"
        >
          ⚙
        </button>
      </aside>

      {/* =================================================
          CONVERSA
      ================================================= */}

      <section className="chat-conversation">
        {/* ===============================================
            3 BOTÕES SUPERIORES
        =============================================== */}

        <div
          className="chat-tabs"
          aria-label="Categorias do chat"
        >
          <button
            className={`tab-search ${
              abaAtiva === "achados"
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() =>
              trocarAba("achados")
            }
            aria-pressed={
              abaAtiva === "achados"
            }
          >
            <span className="tab-icon">
              ⌕
            </span>

            <span className="tab-text">
              Achados e Perdidos
            </span>
          </button>

          <button
            className={`tab-match ${
              abaAtiva === "tinder"
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() =>
              trocarAba("tinder")
            }
            aria-pressed={
              abaAtiva === "tinder"
            }
          >
            <span className="tab-icon">
              ♥
            </span>

            <span className="tab-text">
              TinderPet
            </span>
          </button>

          <button
            className={`tab-adoption ${
              abaAtiva === "adocao"
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() =>
              trocarAba("adocao")
            }
            aria-pressed={
              abaAtiva === "adocao"
            }
          >
            <span className="tab-icon">
              ♣
            </span>

            <span className="tab-text">
              Adoção
            </span>
          </button>
        </div>

        {/* ===============================================
            CABEÇALHO DA CONVERSA
        =============================================== */}

        <header className="conversation-header">
          <span className="pet-avatar avatar-azul">
            <img
              src={conversaAtiva.avatar}
              alt={conversaAtiva.nome}
            />
          </span>

          <div>
            <h2>
              {conversaAtiva.nome}

              <i aria-label="online" />
            </h2>

            <p>
              {conversaAtiva.especie}

              <span>•</span>

              {conversaAtiva.idade}

              <span>•</span>

              {conversaAtiva.detalhe}
            </p>
          </div>

          <button
            className="more-button"
            type="button"
            aria-label="Mais opções"
          >
            ⋮
          </button>
        </header>

        {/* ===============================================
            MENSAGENS
        =============================================== */}

        <div className="messages-area">
          <div className="today-label">
            Hoje
          </div>

          {mensagens.map(
            (mensagem) => (
              <div
                key={mensagem.id}
                className={`message-row ${mensagem.lado}`}
              >
                {mensagem.lado ===
                  "recebida" && (
                  <span className="pet-avatar small avatar-laranja">
                    <img
                      src="/src/assets/husky.jpg"
                      alt=""
                    />
                  </span>
                )}

                <div className="message-group">
                  <div className="message-bubble">
                    {mensagem.texto
                      .split("\n")
                      .map(
                        (
                          linha,
                          index
                        ) => (
                          <span
                            key={`${mensagem.id}-${index}`}
                          >
                            {linha}

                            {index <
                              mensagem.texto.split(
                                "\n"
                              ).length -
                                1 && (
                              <br />
                            )}
                          </span>
                        )
                      )}
                  </div>

                  <small>
                    {mensagem.hora}

                    {mensagem.lida && (
                      <b className="read-mark">
                        ✓✓
                      </b>
                    )}
                  </small>
                </div>

                {mensagem.lado ===
                  "enviada" && (
                  <span className="pet-avatar small avatar-azul">
                    <img
                      src="/src/assets/loki.png"
                      alt=""
                    />
                  </span>
                )}
              </div>
            )
          )}
        </div>

        {/* ===============================================
            CAMPO DE MENSAGEM
        =============================================== */}

        <form
          className="message-composer"
          onSubmit={enviarMensagem}
        >
          {/* Botão que abre e fecha a paleta de emojis do compositor. */}
          <div className="emoji-picker-wrapper">
            <button
              type="button"
              className={`composer-icon ${emojisAbertos ? "active" : ""}`}
              onClick={() => setEmojisAbertos((estadoAtual) => !estadoAtual)}
              aria-label="Adicionar emoji"
              aria-expanded={emojisAbertos}
              aria-controls="chat-emoji-picker"
            >
              ☺
            </button>

            {/* Paleta acessível com seleção rápida de emojis. */}
            {emojisAbertos && (
              <div
                id="chat-emoji-picker"
                className="chat-emoji-picker"
                role="dialog"
                aria-label="Selecionar emoji"
              >
                {emojisDisponiveis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => inserirEmoji(emoji)}
                    aria-label={`Inserir ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            value={texto}
            onChange={(event) =>
              setTexto(event.target.value)
            }
            placeholder="Digite sua mensagem..."
            aria-label="Digite sua mensagem"
          />

          <label
            className={`composer-icon attach ${
              anexoSelecionado
                ? "selected"
                : ""
            }`}
            aria-label="Anexar arquivo"
          >
            <input
              type="file"
              onChange={(event) =>
                setAnexoSelecionado(
                  Boolean(
                    event.target.files?.length
                  )
                )
              }
            />

            ⌕
          </label>

          <button
            type="submit"
            className="send-button"
            aria-label="Enviar mensagem"
          >
            ➤
          </button>
        </form>
      </section>
    </main>
  );
}
