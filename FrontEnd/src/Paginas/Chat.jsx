import { useMemo, useState } from "react";
import "../assets/css/Chat.css";
import simbolo from "../assets/imagens/simbolo.png";

// Dados exibidos na coluna lateral: cada objeto representa uma conversa.
// Lista inicial de conversas usada para reproduzir a lateral da referência.
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

const mensagensIniciais = [
  // Cada mensagem informa sua direção, conteúdo, horário e estado de leitura.
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
  { id: 5, lado: "recebida", texto: "Nossa! É ela mesmo! ❤️", hora: "14:32" },
];

// Cada aba possui seu próprio histórico, mantendo as conversas independentes dentro do mesmo layout.
const mensagensPorAbaIniciais = {
  // O objeto separa os históricos para que uma aba não misture mensagens com outra.
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

export default function Chat() {
  // Estados principais da interface: conversas, conversa selecionada, aba e composição.
  const [conversas, setConversas] = useState(conversasIniciais);
  const [conversaAtiva, setConversaAtiva] = useState(conversasIniciais[0]);
  const [abaAtiva, setAbaAtiva] = useState("achados");
  const [mensagensPorAba, setMensagensPorAba] = useState(
    mensagensPorAbaIniciais,
  );
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [anexoSelecionado, setAnexoSelecionado] = useState(false);

  // useMemo recalcula a lista somente quando a busca ou as conversas mudam.
  // Filtra as conversas sem alterar os dados originais da aplicação.
  const conversasFiltradas = useMemo(
    () =>
      conversas.filter((conversa) =>
        conversa.nome.toLowerCase().includes(busca.toLowerCase()),
      ),
    [busca, conversas],
  );
  const mensagens = mensagensPorAba[abaAtiva];

  // Impede o recarregamento do formulário e cria a mensagem no histórico da aba atual.
  // Acrescenta uma nova mensagem localmente para deixar a interface funcional.
  function enviarMensagem(event) {
    event.preventDefault();
    const mensagem = texto.trim();
    if (!mensagem && !anexoSelecionado) return;
    setMensagensPorAba((atuais) => ({
      ...atuais,
      [abaAtiva]: [
        ...atuais[abaAtiva],
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
  }

  function selecionarConversa(conversa) {
    // Atualiza o cabeçalho para mostrar a pessoa ou o pet escolhido.
    setConversaAtiva(conversa);
    setConversas((atuais) =>
      atuais.map((item) =>
        item.id === conversa.id ? { ...item, naoLidas: 0 } : item,
      ),
    );
  }

  // Troca somente o contexto da conversa, sem sair da tela e sem misturar históricos.
  function trocarAba(aba) {
    setAbaAtiva(aba);
    setTexto("");
    setAnexoSelecionado(false);
  }

  return (
    // A classe da aba ativa permite aplicar o tema visual correspondente ao conteúdo.
    <main className={`chat-page chat-theme-${abaAtiva}`}>
      {/* Coluna lateral: identidade visual, busca e lista de conversas. */}
      <aside className="chat-sidebar">
        {/* Marca provisória da interface, formada pelo símbolo e pelo nome do projeto. */}
        <div className="chat-brand" aria-label="Cerca Trova">
          <img
            className="chat-brand-logo"
            src={simbolo}
            alt="Símbolo Cerca Trova"
          />
          <strong>CERCA TROVA</strong>
        </div>

        {/* Título da área lateral e ícone visual do recurso de mensagens. */}
        <div className="chat-sidebar-title">
          <span className="chat-bubble-icon" aria-hidden="true">
            ◌
          </span>
          <h1>Chat</h1>
        </div>
        {/* Campo controlado: o valor digitado fica sincronizado com o estado busca. */}
        <label className="chat-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Pesquisar conversas"
            aria-label="Pesquisar conversas"
          />
        </label>

        {/* Renderiza somente as conversas que passaram pelo filtro de pesquisa. */}
        <div className="conversation-list">
          {conversasFiltradas.map((conversa) => (
            <button
              key={conversa.id}
              className={`conversation-item ${conversaAtiva.id === conversa.id ? "active" : ""}`}
              onClick={() => selecionarConversa(conversa)}
            >
              <span className={`pet-avatar avatar-${conversa.cor}`}>
                <img src={conversa.avatar} alt="" />
              </span>
              <span className="conversation-copy">
                <strong>{conversa.nome}</strong>
                <small>{conversa.ultima}</small>
              </span>
              <span className="conversation-meta">
                <small>{conversa.horario}</small>
                {conversa.naoLidas ? (
                  <b>{conversa.naoLidas}</b>
                ) : conversa.online ? (
                  <i aria-label="online" />
                ) : null}
              </span>
            </button>
          ))}
        </div>

        {/* Botão visual reservado para futuras configurações do chat. */}
        <button
          className="chat-settings"
          type="button"
          aria-label="Configurações"
        >
          ⚙
        </button>
      </aside>

      {/* Área principal: abas, cabeçalho, mensagens e campo de envio. */}
      <section className="chat-conversation">
        {/* Cada botão troca o histórico independente e o tema da aba selecionada. */}
        <div className="chat-tabs" aria-label="Navegação principal">
          <button
            className={`tab-search ${abaAtiva === "achados" ? "active" : ""}`}
            type="button"
            onClick={() => trocarAba("achados")}
            aria-pressed={abaAtiva === "achados"}
          >
            ⌕ <span>Achados e Perdidos</span>
          </button>
          <button
            className={`tab-match ${abaAtiva === "tinder" ? "active" : ""}`}
            type="button"
            onClick={() => trocarAba("tinder")}
            aria-pressed={abaAtiva === "tinder"}
          >
            ♥ <span>TinderPet</span>
          </button>
          <button
            className={`tab-adoption ${abaAtiva === "adocao" ? "active" : ""}`}
            type="button"
            onClick={() => trocarAba("adocao")}
            aria-pressed={abaAtiva === "adocao"}
          >
            ♣ <span>Adoção</span>
          </button>
        </div>

        {/* Cabeçalho atualizado com os dados da conversa selecionada. */}
        <header className="conversation-header">
          <span className="pet-avatar avatar-azul">
            <img src={conversaAtiva.avatar} alt="" />
          </span>
          <div>
            <h2>
              {conversaAtiva.nome} <i aria-label="online" />
            </h2>
            <p>
              {conversaAtiva.especie} <span>•</span> {conversaAtiva.idade}{" "}
              <span>•</span> {conversaAtiva.detalhe}
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

        {/* Lista de mensagens do histórico correspondente à aba ativa. */}
        <div className="messages-area">
          <div className="today-label">Hoje</div>
          {mensagens.map((mensagem, index) => (
            <div key={mensagem.id} className={`message-row ${mensagem.lado}`}>
              {mensagem.lado === "recebida" && (
                <span className="pet-avatar small avatar-laranja">
                  <img src="/src/assets/husky.jpg" alt="" />
                </span>
              )}
              <div className="message-group">
                <div className="message-bubble">
                  {mensagem.texto.split("\n").map((linha) => (
                    <span key={linha}>
                      {linha}
                      <br />
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
                  <img src="/src/assets/loki.png" alt="" />
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Formulário de composição: texto, emoji, anexo e envio. */}
        <form className="message-composer" onSubmit={enviarMensagem}>
          <button
            type="button"
            className="composer-icon"
            aria-label="Adicionar emoji"
          >
            ☺
          </button>
          <input
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder="Digite sua mensagem..."
            aria-label="Digite sua mensagem"
          />
          <label
            className={`composer-icon attach ${anexoSelecionado ? "selected" : ""}`}
            aria-label="Anexar arquivo"
          >
            <input type="file" onChange={() => setAnexoSelecionado(true)} />⌕
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
