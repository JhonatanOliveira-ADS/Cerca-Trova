// src/PaginasAdmin/Admin.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Admin.css";

const usuariosMock = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao@email.com",
    status: "Ativo",
    tipo: "Usuário",
    pontos: 120,
  },
  {
    id: 2,
    nome: "Maria Souza",
    email: "maria@email.com",
    status: "Ativo",
    tipo: "Protetora",
    pontos: 540,
  },
  {
    id: 3,
    nome: "Carlos Lima",
    email: "carlos@email.com",
    status: "Bloqueado",
    tipo: "Usuário",
    pontos: 20,
  },

  {
    id:123,
    nome:"samuel",
    email:"sam@admin.com",
    senha:"123",
    tipo:"admin"
  }
];

const petsMock = [
  {
    id: 1,
    nome: "Thor",
    especie: "Cão",
    tipo: "Perdido",
    tutor: "João Silva",
    status: "Ativo",
  },
  {
    id: 2,
    nome: "Luna",
    especie: "Gato",
    tipo: "Adoção",
    tutor: "Maria Souza",
    status: "Disponível",
  },
  {
    id: 3,
    nome: "Max",
    especie: "Cão",
    tipo: "Encontrado",
    tutor: "Carlos Lima",
    status: "Resolvido",
  },
];

const adocoesMock = [
  {
    id: 1,
    pet: "Luna",
    responsavel: "Maria Souza",
    interessados: 4,
    status: "Disponível",
  },
  {
    id: 2,
    pet: "Nina",
    responsavel: "ONG Patinhas",
    interessados: 2,
    status: "Em análise",
  },
];

const achadosPerdidosMock = [
  {
    id: 1,
    pet: "Thor",
    tipo: "Perdido",
    local: "Bauru - SP",
    confirmacoes: 8,
    status: "Ativo",
  },
  {
    id: 2,
    pet: "Bob",
    tipo: "Encontrado",
    local: "Centro",
    confirmacoes: 3,
    status: "Ativo",
  },
];

const tinderMock = [
  {
    id: 1,
    pet: "Lalinha",
    tutor: "Ana",
    curtidas: 18,
    matches: 5,
    status: "Ativo",
  },
  {
    id: 2,
    pet: "Loki",
    tutor: "Pedro",
    curtidas: 11,
    matches: 2,
    status: "Ativo",
  },
  {
    id: 3,
    pet: "Sky",
    tutor: "Marina",
    curtidas: 22,
    matches: 7,
    status: "Ativo",
  },
];

const publicacoesMock = [
  {
    id: 33,
    titulo: "Thor desaparecido",
    tipo: "Perdido",
    autor: "João Silva",
    status: "Ativa",
  },
  {
    id: 34,
    titulo: "Luna para adoção",
    tipo: "Adoção",
    autor: "Maria Souza",
    status: "Ativa",
  },
];

const denunciasMock = [
  {
    id: 101,
    motivo: "Informação falsa",
    alvo: "Postagem #33",
    autor: "Usuário #18",
    status: "Pendente",
  },
  {
    id: 102,
    motivo: "Conteúdo impróprio",
    alvo: "Usuário #12",
    autor: "Usuário #41",
    status: "Pendente",
  },
];

const matchesIaMock = [
  {
    id: 1,
    perdido: "Thor",
    encontrado: "Cão encontrado - Centro",
    similaridade: 92,
    status: "Pendente",
  },
  {
    id: 2,
    perdido: "Mel",
    encontrado: "Cadela vista - Vila",
    similaridade: 81,
    status: "Pendente",
  },
];

const publicidadeMock = [
  {
    id: 1,
    empresa: "Cobasi Bauru",
    local: "Home",
    status: "Ativa",
  },
  {
    id: 2,
    empresa: "Agrosolo",
    local: "Adoção",
    status: "Pausada",
  },
];

const mensagensMock = [
  {
    id: 1,
    usuario: "João Silva",
    motivo: "Denúncia no chat",
    status: "Pendente",
  },
  {
    id: 2,
    usuario: "Maria Souza",
    motivo: "Solicitação de suporte",
    status: "Aberto",
  },
];

const honrariasMock = [
  {
    id: 1,
    nome: "Bronze",
    minimo: 0,
    maximo: 100,
  },
  {
    id: 2,
    nome: "Prata",
    minimo: 101,
    maximo: 500,
  },
  {
    id: 3,
    nome: "Ouro",
    minimo: 501,
    maximo: 99999,
  },
];

const secoes = [
  ["visao", "Visão geral", "▦"],
  ["usuarios", "Usuários", "👥"],
  ["pets", "Pets", "🐾"],
  ["adocoes", "Adoções / Doações", "🏠"],
  ["achados", "Achados / Perdidos", "📍"],
  ["tinder", "Tinder Pet", "💜"],
  ["publicacoes", "Publicações", "📰"],
  ["ia", "Matches IA", "🤖"],
  ["denuncias", "Denúncias", "🚨"],
  ["chat", "Chat / Suporte", "💬"],
  ["publicidade", "Publicidade", "📢"],
  ["honrarias", "Pontos / Honrarias", "🏆"],
  ["relatorios", "Relatórios", "📊"],
  ["config", "Configurações", "⚙️"],
];

export default function Admin() {
  const navigate = useNavigate();

  const [autorizado, setAutorizado] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState("visao");
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [usuarios, setUsuarios] = useState(usuariosMock);
  const [pets, setPets] = useState(petsMock);
  const [adocoes, setAdocoes] = useState(adocoesMock);
  const [achados, setAchados] = useState(achadosPerdidosMock);
  const [tinder, setTinder] = useState(tinderMock);
  const [publicacoes, setPublicacoes] = useState(publicacoesMock);
  const [denuncias, setDenuncias] = useState(denunciasMock);
  const [matchesIa, setMatchesIa] = useState(matchesIaMock);
  const [publicidade, setPublicidade] = useState(publicidadeMock);
  const [mensagens, setMensagens] = useState(mensagensMock);
  const [honrarias] = useState(honrariasMock);

  useEffect(() => {
    const adminAutenticado =
      sessionStorage.getItem("cercaTrovaAdminAutenticado") === "true";

    if (!adminAutenticado) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    setAutorizado(true);
  }, [navigate]);

  const resumo = useMemo(
    () => ({
      usuarios: usuarios.length,

      pets: pets.length,

      perdidos: achados.filter(
        (item) =>
          item.tipo === "Perdido" &&
          item.status === "Ativo"
      ).length,

      adocoes: adocoes.filter(
        (item) => item.status !== "Concluída"
      ).length,

      denuncias: denuncias.filter(
        (item) => item.status === "Pendente"
      ).length,

      ia: matchesIa.filter(
        (item) => item.status === "Pendente"
      ).length,

      tinderMatches: tinder.reduce(
        (total, item) => total + item.matches,
        0
      ),
    }),
    [
      usuarios,
      pets,
      achados,
      adocoes,
      denuncias,
      matchesIa,
      tinder,
    ]
  );

  function avisar(texto) {
    setMensagem(texto);

    window.clearTimeout(
      window.__cercaTrovaAdminToast
    );

    window.__cercaTrovaAdminToast =
      window.setTimeout(() => {
        setMensagem("");
      }, 2400);
  }

  function sairAdmin() {
    sessionStorage.removeItem(
      "cercaTrovaAdminAutenticado"
    );

    navigate("/login", {
      replace: true,
    });
  }

  function filtrar(itens) {
    const termo = busca
      .trim()
      .toLowerCase();

    if (!termo) {
      return itens;
    }

    return itens.filter((item) =>
      Object.values(item).some((valor) =>
        String(valor)
          .toLowerCase()
          .includes(termo)
      )
    );
  }

  function alternarStatusUsuario(id) {
    setUsuarios((lista) =>
      lista.map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,

              status:
                usuario.status === "Ativo"
                  ? "Bloqueado"
                  : "Ativo",
            }
          : usuario
      )
    );

    avisar(
      "Status do usuário atualizado."
    );
  }

  function excluirItem(
    setter,
    id,
    nome
  ) {
    const confirmar = window.confirm(
      `Deseja realmente excluir ${nome}?`
    );

    if (!confirmar) {
      return;
    }

    setter((lista) =>
      lista.filter(
        (item) => item.id !== id
      )
    );

    avisar(`${nome} removido.`);
  }

  function atualizarStatus(
    setter,
    id,
    status,
    texto
  ) {
    setter((lista) =>
      lista.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item
      )
    );

    avisar(texto);
  }

  function definirSimilaridade(
    id,
    valor
  ) {
    setMatchesIa((lista) =>
      lista.map((item) =>
        item.id === id
          ? {
              ...item,
              similaridade:
                Number(valor),
            }
          : item
      )
    );
  }

  if (!autorizado) {
    return null;
  }

  return (
    <div className="ct-admin">

      <aside className="ct-admin-sidebar">

        <div className="ct-admin-brand">

          <div className="ct-admin-brand-mark">
            🐾
          </div>

          <div>

            <strong>
              Cerca Trova
            </strong>

            <span>
              Administração
            </span>

          </div>

        </div>

        <nav className="ct-admin-nav">

          {secoes.map(
            ([id, label, icon]) => (

              <button
                key={id}
                type="button"
                className={
                  secaoAtiva === id
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setSecaoAtiva(id);
                  setBusca("");
                }}
              >

                <span>
                  {icon}
                </span>

                {label}

              </button>

            )
          )}

        </nav>

        <button
          type="button"
          className="ct-admin-logout"
          onClick={sairAdmin}
        >
          Sair do Admin
        </button>

      </aside>

      <main className="ct-admin-main">

        <header className="ct-admin-header">

          <div>

            <span className="ct-admin-eyebrow">
              PAINEL ADMINISTRATIVO
            </span>

            <h1>
              {
                secoes.find(
                  ([id]) =>
                    id === secaoAtiva
                )?.[1]
              }
            </h1>

            <p>
              Controle central do Cerca Trova.
            </p>

          </div>

          <div className="ct-admin-header-actions">

            {secaoAtiva !== "visao" && (

              <input
                type="text"
                value={busca}
                onChange={(event) =>
                  setBusca(
                    event.target.value
                  )
                }
                placeholder="Pesquisar nesta seção..."
              />

            )}

            <div className="ct-admin-avatar">
              ADM
            </div>

          </div>

        </header>

        {mensagem && (

          <div className="ct-admin-toast">
            {mensagem}
          </div>

        )}

        {secaoAtiva === "visao" && (

          <>

            <section className="ct-admin-stats">

              <StatCard
                titulo="Usuários"
                valor={resumo.usuarios}
                texto="Contas cadastradas"
              />

              <StatCard
                titulo="Pets"
                valor={resumo.pets}
                texto="Animais cadastrados"
              />

              <StatCard
                titulo="Perdidos ativos"
                valor={resumo.perdidos}
                texto="Buscas em andamento"
              />

              <StatCard
                titulo="Adoções"
                valor={resumo.adocoes}
                texto="Processos ativos"
              />

              <StatCard
                titulo="Denúncias"
                valor={resumo.denuncias}
                texto="Aguardando análise"
              />

              <StatCard
                titulo="Matches IA"
                valor={resumo.ia}
                texto="Aguardando validação"
              />

              <StatCard
                titulo="Matches Tinder"
                valor={
                  resumo.tinderMatches
                }
                texto="Matches registrados"
              />

            </section>

            <section className="ct-admin-grid-2">

              <Card
                titulo="Ações rápidas"
                subtitulo="Acesse funções importantes do sistema."
              >

                <div className="ct-admin-quick">

                  <button
                    onClick={() =>
                      setSecaoAtiva(
                        "usuarios"
                      )
                    }
                  >
                    Gerenciar usuários
                  </button>

                  <button
                    onClick={() =>
                      setSecaoAtiva(
                        "achados"
                      )
                    }
                  >
                    Ver perdidos
                  </button>

                  <button
                    onClick={() =>
                      setSecaoAtiva("ia")
                    }
                  >
                    Analisar IA
                  </button>

                  <button
                    onClick={() =>
                      setSecaoAtiva(
                        "denuncias"
                      )
                    }
                  >
                    Ver denúncias
                  </button>

                  <button
                    onClick={() =>
                      setSecaoAtiva(
                        "publicidade"
                      )
                    }
                  >
                    Publicidade
                  </button>

                  <button
                    onClick={() =>
                      setSecaoAtiva(
                        "relatorios"
                      )
                    }
                  >
                    Relatórios
                  </button>

                </div>

              </Card>

              <Card
                titulo="Pendências"
                subtitulo="O que precisa de atenção."
              >

                <div className="ct-admin-pendencias">

                  <p>
                    <strong>
                      {resumo.denuncias}
                    </strong>{" "}
                    denúncias pendentes
                  </p>

                  <p>
                    <strong>
                      {resumo.ia}
                    </strong>{" "}
                    possíveis matches da IA
                  </p>

                  <p>
                    <strong>
                      {resumo.perdidos}
                    </strong>{" "}
                    pets perdidos ativos
                  </p>

                  <p>
                    <strong>
                      {
                        mensagens.filter(
                          (mensagem) =>
                            mensagem.status !==
                            "Resolvido"
                        ).length
                      }
                    </strong>{" "}
                    solicitações no chat
                  </p>

                </div>

              </Card>

            </section>

          </>

        )}

        {secaoAtiva === "usuarios" && (

          <Card
            titulo="Usuários"
            subtitulo="Bloqueie, ative, exclua e acompanhe pontos."
          >

            <AdminTable
              headers={[
                "Nome",
                "E-mail",
                "Tipo",
                "Pontos",
                "Status",
                "Ações",
              ]}
            >

              {filtrar(
                usuarios
              ).map((usuario) => (

                <tr key={usuario.id}>

                  <td>
                    {usuario.nome}
                  </td>

                  <td>
                    {usuario.email}
                  </td>

                  <td>
                    {usuario.tipo}
                  </td>

                  <td>
                    {usuario.pontos}
                  </td>

                  <td>

                    <StatusBadge
                      value={
                        usuario.status
                      }
                    />

                  </td>

                  <td className="ct-admin-actions">

                    <button
                      className="secondary"
                      onClick={() =>
                        alternarStatusUsuario(
                          usuario.id
                        )
                      }
                    >
                      {usuario.status ===
                      "Ativo"
                        ? "Bloquear"
                        : "Ativar"}
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        excluirItem(
                          setUsuarios,
                          usuario.id,
                          "usuário"
                        )
                      }
                    >
                      Excluir
                    </button>

                  </td>

                </tr>

              ))}

            </AdminTable>

          </Card>

        )}

        {secaoAtiva === "pets" && (

          <Card
            titulo="Pets"
            subtitulo="Controle todos os animais cadastrados."
          >

            <AdminTable
              headers={[
                "Pet",
                "Espécie",
                "Tipo",
                "Tutor",
                "Status",
                "Ações",
              ]}
            >

              {filtrar(
                pets
              ).map((pet) => (

                <tr key={pet.id}>

                  <td>
                    {pet.nome}
                  </td>

                  <td>
                    {pet.especie}
                  </td>

                  <td>
                    {pet.tipo}
                  </td>

                  <td>
                    {pet.tutor}
                  </td>

                  <td>

                    <StatusBadge
                      value={
                        pet.status
                      }
                    />

                  </td>

                  <td className="ct-admin-actions">

                    <button
                      className="success"
                      onClick={() =>
                        atualizarStatus(
                          setPets,
                          pet.id,
                          "Resolvido",
                          "Status do pet atualizado."
                        )
                      }
                    >
                      Resolver
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        excluirItem(
                          setPets,
                          pet.id,
                          "pet"
                        )
                      }
                    >
                      Excluir
                    </button>

                  </td>

                </tr>

              ))}

            </AdminTable>

          </Card>

        )}

        {secaoAtiva === "adocoes" && (

          <Card
            titulo="Adoções e doações"
            subtitulo="Acompanhe anúncios, interessados e conclusões."
          >

            <AdminTable
              headers={[
                "Pet",
                "Responsável",
                "Interessados",
                "Status",
                "Ações",
              ]}
            >

              {filtrar(
                adocoes
              ).map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.pet}
                  </td>

                  <td>
                    {item.responsavel}
                  </td>

                  <td>
                    {item.interessados}
                  </td>

                  <td>

                    <StatusBadge
                      value={
                        item.status
                      }
                    />

                  </td>

                  <td className="ct-admin-actions">

                    <button
                      className="success"
                      onClick={() =>
                        atualizarStatus(
                          setAdocoes,
                          item.id,
                          "Concluída",
                          "Adoção marcada como concluída."
                        )
                      }
                    >
                      Concluir
                    </button>

                    <button
                      className="secondary"
                      onClick={() =>
                        atualizarStatus(
                          setAdocoes,
                          item.id,
                          "Pausada",
                          "Adoção pausada."
                        )
                      }
                    >
                      Pausar
                    </button>

                  </td>

                </tr>

              ))}

            </AdminTable>

          </Card>

        )}

        {secaoAtiva === "achados" && (

          <Card
            titulo="Achados e perdidos"
            subtitulo="Controle status, localização e confirmações do mapa."
          >

            <AdminTable
              headers={[
                "Pet",
                "Tipo",
                "Local",
                "Confirmações",
                "Status",
                "Ações",
              ]}
            >

              {filtrar(
                achados
              ).map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.pet}
                  </td>

                  <td>
                    {item.tipo}
                  </td>

                  <td>
                    {item.local}
                  </td>

                  <td>
                    {item.confirmacoes}
                  </td>

                  <td>

                    <StatusBadge
                      value={
                        item.status
                      }
                    />

                  </td>

                  <td className="ct-admin-actions">

                    <button
                      className="success"
                      onClick={() =>
                        atualizarStatus(
                          setAchados,
                          item.id,
                          "Resolvido",
                          "Ocorrência encerrada."
                        )
                      }
                    >
                      Resolver
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        excluirItem(
                          setAchados,
                          item.id,
                          "ocorrência"
                        )
                      }
                    >
                      Excluir
                    </button>

                  </td>

                </tr>

              ))}

            </AdminTable>

          </Card>

        )}

        {secaoAtiva === "tinder" && (

          <Card
            titulo="Tinder Pet"
            subtitulo="Administre perfis, curtidas e matches."
          >

            <AdminTable
              headers={[
                "Pet",
                "Tutor",
                "Curtidas",
                "Matches",
                "Status",
                "Ações",
              ]}
            >

              {filtrar(
                tinder
              ).map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.pet}
                  </td>

                  <td>
                    {item.tutor}
                  </td>

                  <td>
                    {item.curtidas}
                  </td>

                  <td>
                    {item.matches}
                  </td>

                  <td>

                    <StatusBadge
                      value={
                        item.status
                      }
                    />

                  </td>

                  <td className="ct-admin-actions">

                    <button
                      className="secondary"
                      onClick={() =>
                        atualizarStatus(
                          setTinder,
                          item.id,
                          item.status ===
                          "Ativo"
                            ? "Pausado"
                            : "Ativo",
                          "Perfil do Tinder Pet atualizado."
                        )
                      }
                    >
                      {item.status ===
                      "Ativo"
                        ? "Pausar"
                        : "Ativar"}
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        excluirItem(
                          setTinder,
                          item.id,
                          "perfil"
                        )
                      }
                    >
                      Remover
                    </button>

                  </td>

                </tr>

              ))}

            </AdminTable>

          </Card>

        )}

        {secaoAtiva ===
          "publicacoes" && (

          <Card
            titulo="Publicações"
            subtitulo="Modere o conteúdo publicado no site."
          >

            <AdminTable
              headers={[
                "Título",
                "Tipo",
                "Autor",
                "Status",
                "Ações",
              ]}
            >

              {filtrar(
                publicacoes
              ).map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.titulo}
                  </td>

                  <td>
                    {item.tipo}
                  </td>

                  <td>
                    {item.autor}
                  </td>

                  <td>

                    <StatusBadge
                      value={
                        item.status
                      }
                    />

                  </td>

                  <td className="ct-admin-actions">

                    <button
                      className="secondary"
                      onClick={() =>
                        atualizarStatus(
                          setPublicacoes,
                          item.id,
                          item.status ===
                          "Ativa"
                            ? "Oculta"
                            : "Ativa",
                          "Visibilidade atualizada."
                        )
                      }
                    >
                      {item.status ===
                      "Ativa"
                        ? "Ocultar"
                        : "Ativar"}
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        excluirItem(
                          setPublicacoes,
                          item.id,
                          "publicação"
                        )
                      }
                    >
                      Excluir
                    </button>

                  </td>

                </tr>

              ))}

            </AdminTable>

          </Card>

        )}

        {secaoAtiva === "ia" && (

          <Card
            titulo="Possíveis matches da IA"
            subtitulo="Valide ou descarte correspondências automáticas."
          >

            <div className="ct-admin-match-list">

              {filtrar(
                matchesIa
              ).map((item) => (

                <article
                  className="ct-admin-match-card"
                  key={item.id}
                >

                  <div>

                    <span className="ct-admin-match-label">
                      Pet perdido
                    </span>

                    <strong>
                      {item.perdido}
                    </strong>

                  </div>

                  <div className="ct-admin-match-score">

                    <strong>
                      {item.similaridade}%
                    </strong>

                    <span>
                      similaridade
                    </span>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={
                        item.similaridade
                      }
                      onChange={(event) =>
                        definirSimilaridade(
                          item.id,
                          event.target.value
                        )
                      }
                    />

                  </div>

                  <div>

                    <span className="ct-admin-match-label">
                      Possível encontrado
                    </span>

                    <strong>
                      {item.encontrado}
                    </strong>

                  </div>

                  <div className="ct-admin-actions">

                    <button
                      className="success"
                      onClick={() =>
                        atualizarStatus(
                          setMatchesIa,
                          item.id,
                          "Confirmado",
                          "Correspondência confirmada."
                        )
                      }
                    >
                      Confirmar
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        atualizarStatus(
                          setMatchesIa,
                          item.id,
                          "Descartado",
                          "Correspondência descartada."
                        )
                      }
                    >
                      Descartar
                    </button>

                  </div>

                </article>

              ))}

            </div>

          </Card>

        )}

        {secaoAtiva ===
          "denuncias" && (

          <Card
            titulo="Denúncias"
            subtitulo="Analise denúncias e aplique decisões administrativas."
          >

            <AdminTable
              headers={[
                "Código",
                "Motivo",
                "Alvo",
                "Denunciante",
                "Status",
                "Ações",
              ]}
            >

              {filtrar(
                denuncias
              ).map((item) => (

                <tr key={item.id}>

                  <td>
                    #{item.id}
                  </td>

                  <td>
                    {item.motivo}
                  </td>

                  <td>
                    {item.alvo}
                  </td>

                  <td>
                    {item.autor}
                  </td>

                  <td>

                    <StatusBadge
                      value={
                        item.status
                      }
                    />

                  </td>

                  <td className="ct-admin-actions">

                    <button
                      className="success"
                      onClick={() =>
                        atualizarStatus(
                          setDenuncias,
                          item.id,
                          "Resolvida",
                          "Denúncia resolvida."
                        )
                      }
                    >
                      Resolver
                    </button>

                    <button
                      className="secondary"
                      onClick={() =>
                        atualizarStatus(
                          setDenuncias,
                          item.id,
                          "Ignorada",
                          "Denúncia ignorada."
                        )
                      }
                    >
                      Ignorar
                    </button>

                  </td>

                </tr>

              ))}

            </AdminTable>

          </Card>

        )}

        {secaoAtiva === "chat" && (

          <Card
            titulo="Chat e suporte"
            subtitulo="Acompanhe denúncias e solicitações relacionadas ao chat."
          >

            <AdminTable
              headers={[
                "Usuário",
                "Motivo",
                "Status",
                "Ações",
              ]}
            >

              {filtrar(
                mensagens
              ).map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.usuario}
                  </td>

                  <td>
                    {item.motivo}
                  </td>

                  <td>

                    <StatusBadge
                      value={
                        item.status
                      }
                    />

                  </td>

                  <td className="ct-admin-actions">

                    <button
                      className="success"
                      onClick={() =>
                        atualizarStatus(
                          setMensagens,
                          item.id,
                          "Resolvido",
                          "Atendimento encerrado."
                        )
                      }
                    >
                      Resolver
                    </button>

                  </td>

                </tr>

              ))}

            </AdminTable>

          </Card>

        )}

        {secaoAtiva ===
          "publicidade" && (

          <Card
            titulo="Publicidade"
            subtitulo="Controle banners, parceiros e locais de exibição."
          >

            <div className="ct-admin-toolbar">

              <button
                type="button"
                onClick={() =>
                  avisar(
                    "Nova publicidade preparada para integração com o backend."
                  )
                }
              >
                + Nova publicidade
              </button>

            </div>

            <AdminTable
              headers={[
                "Empresa",
                "Local",
                "Status",
                "Ações",
              ]}
            >

              {filtrar(
                publicidade
              ).map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.empresa}
                  </td>

                  <td>
                    {item.local}
                  </td>

                  <td>

                    <StatusBadge
                      value={
                        item.status
                      }
                    />

                  </td>

                  <td className="ct-admin-actions">

                    <button
                      className="secondary"
                      onClick={() =>
                        atualizarStatus(
                          setPublicidade,
                          item.id,
                          item.status ===
                          "Ativa"
                            ? "Pausada"
                            : "Ativa",
                          "Publicidade atualizada."
                        )
                      }
                    >
                      {item.status ===
                      "Ativa"
                        ? "Pausar"
                        : "Ativar"}
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        excluirItem(
                          setPublicidade,
                          item.id,
                          "publicidade"
                        )
                      }
                    >
                      Excluir
                    </button>

                  </td>

                </tr>

              ))}

            </AdminTable>

          </Card>

        )}

        {secaoAtiva ===
          "honrarias" && (

          <Card
            titulo="Pontos e honrarias"
            subtitulo="Regras de pontuação e níveis de participação."
          >

            <section className="ct-admin-honor-grid">

              {honrarias.map(
                (item) => (

                  <article key={item.id}>

                    <div className="ct-admin-honor-icon">

                      {item.nome ===
                      "Bronze"
                        ? "🥉"
                        : item.nome ===
                          "Prata"
                          ? "🥈"
                          : "🥇"}

                    </div>

                    <h3>
                      {item.nome}
                    </h3>

                    <p>
                      {item.minimo} a{" "}
                      {item.maximo ===
                      99999
                        ? "∞"
                        : item.maximo}{" "}
                      pontos
                    </p>

                    <button
                      onClick={() =>
                        avisar(
                          `Editar regra ${item.nome}.`
                        )
                      }
                    >
                      Editar regra
                    </button>

                  </article>

                )
              )}

            </section>

            <div className="ct-admin-points-rules">

              <h3>
                Regras de pontuação
              </h3>

              <p>
                Confirmar localização
                real: +10 pontos
              </p>

              <p>
                "Está lá / Não está":
                +5 pontos
              </p>

              <p>
                Participação validada
                em adoção: +20 pontos
              </p>

            </div>

          </Card>

        )}

        {secaoAtiva ===
          "relatorios" && (

          <Card
            titulo="Relatórios"
            subtitulo="Indicadores gerais do Cerca Trova."
          >

            <section className="ct-admin-report-grid">

              <ReportCard
                titulo="Usuários cadastrados"
                valor={
                  resumo.usuarios
                }
              />

              <ReportCard
                titulo="Pets cadastrados"
                valor={resumo.pets}
              />

              <ReportCard
                titulo="Perdidos ativos"
                valor={
                  resumo.perdidos
                }
              />

              <ReportCard
                titulo="Adoções em andamento"
                valor={
                  resumo.adocoes
                }
              />

              <ReportCard
                titulo="Denúncias pendentes"
                valor={
                  resumo.denuncias
                }
              />

              <ReportCard
                titulo="Matches IA pendentes"
                valor={resumo.ia}
              />

            </section>

            <div className="ct-admin-toolbar">

              <button
                type="button"
                onClick={() =>
                  avisar(
                    "Relatório preparado para futura exportação."
                  )
                }
              >
                Gerar relatório
              </button>

            </div>

          </Card>

        )}

        {secaoAtiva ===
          "config" && (

          <Card
            titulo="Configurações"
            subtitulo="Parâmetros gerais da plataforma."
          >

            <div className="ct-admin-settings">

              <label>

                <span>
                  Nome da plataforma
                </span>

                <input
                  defaultValue="Cerca Trova"
                />

              </label>

              <label>

                <span>
                  E-mail administrativo
                </span>

                <input
                  defaultValue="admin@cercatrova.com"
                />

              </label>

              <label>

                <span>
                  Limite de tentativas
                  de login
                </span>

                <input
                  type="number"
                  defaultValue="5"
                />

              </label>

              <label className="ct-admin-switch-row">

                <span>
                  Permitir novos cadastros
                </span>

                <input
                  type="checkbox"
                  defaultChecked
                />

              </label>

              <label className="ct-admin-switch-row">

                <span>
                  Ativar Tinder Pet
                </span>

                <input
                  type="checkbox"
                  defaultChecked
                />

              </label>

              <label className="ct-admin-switch-row">

                <span>
                  Ativar confirmação
                  no mapa
                </span>

                <input
                  type="checkbox"
                  defaultChecked
                />

              </label>

              <button
                type="button"
                onClick={() =>
                  avisar(
                    "Configurações salvas para teste."
                  )
                }
              >
                Salvar configurações
              </button>

            </div>

          </Card>

        )}

      </main>

    </div>
  );
}

function Card({
  titulo,
  subtitulo,
  children,
}) {
  return (
    <section className="ct-admin-card">

      <div className="ct-admin-card-header">

        <div>

          <h2>
            {titulo}
          </h2>

          <p>
            {subtitulo}
          </p>

        </div>

      </div>

      {children}

    </section>
  );
}

function StatCard({
  titulo,
  valor,
  texto,
}) {
  return (
    <article className="ct-admin-stat">

      <span>
        {titulo}
      </span>

      <strong>
        {valor}
      </strong>

      <small>
        {texto}
      </small>

    </article>
  );
}

function ReportCard({
  titulo,
  valor,
}) {
  return (
    <article className="ct-admin-report-card">

      <span>
        {titulo}
      </span>

      <strong>
        {valor}
      </strong>

    </article>
  );
}

function AdminTable({
  headers,
  children,
}) {
  return (
    <div className="ct-admin-table-wrap">

      <table className="ct-admin-table">

        <thead>

          <tr>

            {headers.map(
              (header) => (

                <th key={header}>
                  {header}
                </th>

              )
            )}

          </tr>

        </thead>

        <tbody>
          {children}
        </tbody>

      </table>

    </div>
  );
}

function StatusBadge({ value }) {
  const status =
    String(value).toLowerCase();

  let tipo = "neutral";

  if (
    [
      "ativo",
      "ativa",
      "disponível",
      "resolvido",
      "resolvida",
      "concluída",
      "confirmado",
    ].includes(status)
  ) {
    tipo = "success";
  } else if (
    [
      "pendente",
      "em análise",
      "aberto",
    ].includes(status)
  ) {
    tipo = "warning";
  } else if (
    [
      "bloqueado",
      "pausada",
      "pausado",
      "oculta",
      "ignorada",
      "descartado",
    ].includes(status)
  ) {
    tipo = "danger";
  }

  return (
    <span
      className={`ct-admin-status ${tipo}`}
    >
      {value}
    </span>
  );
}