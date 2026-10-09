/* Hooks usados para carregar dados reais e controlar filtros do painel. */
import { useCallback, useEffect, useMemo, useState } from "react";
/* Hook de navegação usado para sair da área administrativa. */
import { useNavigate } from "react-router-dom";

/* API protegida por JWT e validação de tipo ADMIN no backend. */
import {
  atualizarStatusPublicacaoAdmin,
  listarPublicacoesAdmin,
  listarUsuariosAdmin,
  obterResumoAdmin,
} from "../servicos/adminApi";
import { encerrarSessao } from "../servicos/autenticacao";
import "../assets/css/Painel.css";

/* Converte os tipos internos em rótulos legíveis para a administração. */
const nomesDosTipos = {
  ADOCAO: "Adoção",
  PERDIDO: "Perdido",
  ENCONTRADO: "Achado",
  TINDER_PET: "TinderPet",
};

/* Formata datas reais do banco para o padrão brasileiro. */
function formatarData(data) {
  if (!data) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

/* Converte o nome da categoria persistida em um texto da interface. */
function nomeDoTipo(tipo) {
  return nomesDosTipos[tipo] || tipo || "Sem categoria";
}

export default function Painel() {
  /* Coleções recebidas diretamente dos endpoints administrativos. */
  const [usuarios, setUsuarios] = useState([]);
  const [publicacoes, setPublicacoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroUsuarios, setErroUsuarios] = useState("");
  const [erroPublicacoes, setErroPublicacoes] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [buscaUsuarios, setBuscaUsuarios] = useState("");
  const [buscaPublicacoes, setBuscaPublicacoes] = useState("");
  const [atualizandoId, setAtualizandoId] = useState("");
  const navigate = useNavigate();

  /* Busca o conteúdo real do painel sempre que ele é aberto. */
  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");
      setErroUsuarios("");
      setErroPublicacoes("");
      const ultimaVisualizacao = sessionStorage.getItem("cercaTrovaAdminUltimaVisualizacao");
      const resultados = await Promise.allSettled([
        obterResumoAdmin(ultimaVisualizacao),
        listarUsuariosAdmin(),
        listarPublicacoesAdmin(),
      ]);

      const resultadoResumo = resultados[0];
      const resultadoUsuarios = resultados[1];
      const resultadoPublicacoes = resultados[2];

      if (resultadoResumo.status === "fulfilled") {
        setResumo(resultadoResumo.value);
      }

      if (resultadoUsuarios.status === "fulfilled") {
        setUsuarios(Array.isArray(resultadoUsuarios.value) ? resultadoUsuarios.value : []);
      } else {
        setErroUsuarios(resultadoUsuarios.reason?.message || "Não foi possível carregar os usuários.");
      }

      if (resultadoPublicacoes.status === "fulfilled") {
        setPublicacoes(Array.isArray(resultadoPublicacoes.value) ? resultadoPublicacoes.value : []);
      } else {
        setErroPublicacoes(resultadoPublicacoes.reason?.message || "Não foi possível carregar as publicações.");
      }

      /* A próxima atualização poderá identificar somente eventos posteriores a esta visita. */
      sessionStorage.setItem("cercaTrovaAdminUltimaVisualizacao", new Date().toISOString());
    } catch (erroApi) {
      setErro(erroApi.message || "Não foi possível carregar os dados administrativos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();

    /* Atualiza o painel periodicamente para mostrar posts criados em outra sessão. */
    const intervalo = window.setInterval(carregarDados, 15000);

    return () => window.clearInterval(intervalo);
  }, [carregarDados]);

  /* Filtra os usuários reais sem alterar a coleção original recebida da API. */
  const usuariosFiltrados = useMemo(() => {
    const termo = buscaUsuarios.trim().toLowerCase();
    if (!termo) {
      return usuarios;
    }

    return usuarios.filter((usuario) =>
      [usuario.nome, usuario.email, usuario.tipo, usuario.telefone]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(termo)),
    );
  }, [buscaUsuarios, usuarios]);

  /* Filtra os posts reais por pet, autor, categoria ou cidade. */
  const publicacoesFiltradas = useMemo(() => {
    const termo = buscaPublicacoes.trim().toLowerCase();
    if (!termo) {
      return publicacoes;
    }

    return publicacoes.filter((publicacao) =>
      [
        publicacao.nome_pet,
        publicacao.tipo,
        publicacao.cidade,
        publicacao.usuario?.nome,
        publicacao.usuario?.email,
      ]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(termo)),
    );
  }, [buscaPublicacoes, publicacoes]);

  /* Atualiza o status no banco e sincroniza a linha alterada no painel. */
  async function alternarStatusPublicacao(publicacao) {
    try {
      setAtualizandoId(publicacao.id);
      setMensagem("");
      const atualizada = await atualizarStatusPublicacaoAdmin(
        publicacao.id,
        !publicacao.status,
      );
      setPublicacoes((atuais) =>
        atuais.map((item) => (item.id === atualizada.id ? atualizada : item)),
      );
      setMensagem(
        atualizada.status
          ? "Publicação ativada com sucesso."
          : "Publicação desativada com sucesso.",
      );
    } catch (erroApi) {
      setErro(erroApi.message || "Não foi possível atualizar a publicação.");
    } finally {
      setAtualizandoId("");
    }
  }

  /* Encerra token, dados da sessão e acesso visual ao painel. */
  function sair() {
    encerrarSessao();
    navigate("/login", { replace: true });
  }

  const indicadores = resumo?.indicadores;
  const totalAtivas = indicadores?.publicacoesAtivas ?? publicacoes.filter((publicacao) => publicacao.status).length;
  const totalAdministradores = indicadores?.administradores ?? usuarios.filter(
    (usuario) => usuario.tipo === "ADMIN",
  ).length;

  return (
    <main className="admin-page">
      {/* Barra lateral exclusiva da área administrativa. */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-symbol">CT</span>
          <div>
            <strong>Cerca Trova</strong>
            <small>Administração</small>
          </div>
        </div>

        {/* Navegação interna por âncoras das seções reais do painel. */}
        <div className="admin-navigation" role="navigation" aria-label="Navegação administrativa">
          <a className="active" href="#visao-geral">Visão geral</a>
          <a href="#usuarios">Usuários</a>
          <a href="#publicacoes">Publicações</a>
        </div>

        {/* Recarrega dados diretamente do banco sem atualizar a página inteira. */}
        <button className="admin-secondary-button admin-reload-button" type="button" onClick={carregarDados}>
          Atualizar dados
        </button>

        {/* Finaliza a sessão administrativa atual. */}
        <button className="admin-logout" type="button" onClick={sair}>
          Sair da administração
        </button>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar" id="visao-geral">
          <div>
            <span className="admin-eyebrow">Área restrita</span>
            <h1>Painel administrativo</h1>
            <p>Visualize e modere os dados reais da Cerca Trova.</p>
          </div>
          <span className="admin-badge">API conectada</span>
        </header>

        {/* Indicadores calculados a partir das respostas do backend. */}
        <section className="admin-stats" aria-label="Indicadores administrativos">
          <article className="admin-stat-card">
            <strong>{indicadores?.usuarios ?? usuarios.length}</strong>
            <span>Usuários cadastrados</span>
          </article>
          <article className="admin-stat-card destaque">
            <strong>{indicadores?.publicacoes ?? publicacoes.length}</strong>
            <span>Publicações cadastradas</span>
          </article>
          <article className="admin-stat-card">
            <strong>{totalAtivas}</strong>
            <span>Publicações ativas</span>
          </article>
          <article className="admin-stat-card">
            <strong>{totalAdministradores}</strong>
            <span>Administradores</span>
          </article>
          <article className="admin-stat-card destaque">
            <strong>{indicadores?.petsTinder ?? 0}</strong>
            <span>Pets no TinderPet</span>
          </article>
        </section>

        {carregando && <p className="admin-feedback" role="status">Carregando dados do banco...</p>}
        {erro && <p className="admin-feedback admin-feedback-erro" role="alert">{erro}</p>}
        {erroUsuarios && <p className="admin-feedback admin-feedback-erro" role="alert">Usuários: {erroUsuarios}</p>}
        {erroPublicacoes && <p className="admin-feedback admin-feedback-erro" role="alert">Publicações: {erroPublicacoes}</p>}
        {mensagem && <p className="admin-feedback" role="status">{mensagem}</p>}

        {/* Sinalização objetiva dos acontecimentos recentes nas páginas públicas. */}
        <section className="admin-card admin-activity-card" aria-label="Atividades recentes">
          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">Monitoramento</span>
              <h2>Atividades recentes</h2>
              <p>Eventos reais registrados pelas telas e pelo backend.</p>
            </div>
            {resumo?.novas?.atividades > 0 && (
              <span className="admin-badge admin-new-badge">
                {resumo.novas.atividades} nova(s)
              </span>
            )}
          </div>

          <div className="admin-activity-summary">
            <span><strong>{resumo?.novas?.publicacoes ?? 0}</strong> nova(s) publicação(ões)</span>
            <span><strong>{resumo?.novas?.usuarios ?? 0}</strong> novo(s) usuário(s)</span>
            <span><strong>{resumo?.novas?.petsTinder ?? 0}</strong> novo(s) pet(s) TinderPet</span>
            <span><strong>{indicadores?.conversas ?? 0}</strong> conversa(s) iniciada(s)</span>
          </div>

          <div className="admin-activity-summary" aria-label="Publicações por categoria">
            <span>Adoção: <strong>{indicadores?.porCategoria?.ADOCAO ?? 0}</strong></span>
            <span>Perdidos: <strong>{indicadores?.porCategoria?.PERDIDO ?? 0}</strong></span>
            <span>Achados: <strong>{indicadores?.porCategoria?.ENCONTRADO ?? 0}</strong></span>
            <span>TinderPet: <strong>{indicadores?.porCategoria?.TINDER_PET ?? 0}</strong></span>
          </div>

          <div className="admin-activity-list">
            {resumo?.atividades?.length ? (
              resumo.atividades.slice(0, 10).map((atividade) => (
                <article className="admin-activity-item" key={atividade.id}>
                  <span className={`admin-activity-dot tipo-${atividade.tipo.toLowerCase()}`} />
                  <div>
                    <strong>{atividade.titulo}</strong>
                    <p>{atividade.descricao}</p>
                  </div>
                  <time dateTime={atividade.data}>{formatarData(atividade.data)}</time>
                </article>
              ))
            ) : (
              <p className="admin-empty-state">Nenhuma atividade registrada ainda.</p>
            )}
          </div>
        </section>

        {/* Tabela de usuários criados no cadastro público ou administrativo. */}
        <section className="admin-card" id="usuarios">
          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">Contas</span>
              <h2>Usuários cadastrados</h2>
              <p>Dados reais retornados pelo endpoint administrativo.</p>
            </div>
            <input
              className="admin-table-search"
              value={buscaUsuarios}
              onChange={(event) => setBuscaUsuarios(event.target.value)}
              placeholder="Buscar usuário"
              aria-label="Buscar usuário"
            />
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th>Posts</th>
                  <th>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td><strong>{usuario.nome}</strong></td>
                    <td>{usuario.email}</td>
                    <td><span className="admin-status publicada">{usuario.tipo}</span></td>
                    <td>{usuario._count?.publicacoes ?? 0}</td>
                    <td>{formatarData(usuario.data_criacao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!carregando && usuariosFiltrados.length === 0 && (
              <p className="admin-empty-state">Nenhum usuário encontrado.</p>
            )}
          </div>
        </section>

        {/* Tabela de posts criados no Home e demais áreas públicas. */}
        <section className="admin-card" id="publicacoes">
          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">Conteúdo</span>
              <h2>Publicações cadastradas</h2>
              <p>Os posts aparecem aqui assim que são persistidos pela API.</p>
            </div>
            <input
              className="admin-table-search"
              value={buscaPublicacoes}
              onChange={(event) => setBuscaPublicacoes(event.target.value)}
              placeholder="Buscar publicação"
              aria-label="Buscar publicação"
            />
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Categoria</th>
                  <th>Autor</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {publicacoesFiltradas.map((publicacao) => (
                  <tr key={publicacao.id}>
                    <td>
                      <strong>{publicacao.nome_pet}</strong>
                      <small>{publicacao.cidade || "Local não informado"}</small>
                    </td>
                    <td>{nomeDoTipo(publicacao.tipo)}</td>
                    <td>{publicacao.usuario?.nome || "Autor não encontrado"}</td>
                    <td>{formatarData(publicacao.data_criacao)}</td>
                    <td>
                      <span className={`admin-status ${publicacao.status ? "publicada" : "desativada"}`}>
                        {publicacao.status ? "Ativa" : "Desativada"}
                      </span>
                    </td>
                    <td className="admin-actions">
                      <button
                        type="button"
                        onClick={() => alternarStatusPublicacao(publicacao)}
                        disabled={atualizandoId === publicacao.id}
                      >
                        {atualizandoId === publicacao.id
                          ? "Salvando..."
                          : publicacao.status
                            ? "Desativar"
                            : "Ativar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!carregando && publicacoesFiltradas.length === 0 && (
              <p className="admin-empty-state">Nenhuma publicação encontrada.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
