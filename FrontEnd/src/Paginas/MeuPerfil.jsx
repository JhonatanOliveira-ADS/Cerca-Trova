import { useEffect, useState } from "react";

import "../assets/css/MeuPerfil.css";

/* Chaves que mantêm os dados do perfil e os posts do usuário no navegador. */
const CHAVE_PERFIL = "cercaTrovaPerfil";
const CHAVE_POSTS = "cercaTrovaMeusPosts";

/* Valores iniciais exibidos quando o usuário ainda não configurou o perfil. */
const perfilInicial = {
  nome: "Usuário Cerca Trova",
  biografia: "Compartilhando cuidado e carinho pelos animais.",
  email: "usuario@cercatrova.com",
  telefone: "(00) 00000-0000",
  avatar: "",
  capa: "",
};

/* Faz a leitura segura do perfil salvo no LocalStorage. */
function carregarPerfil() {
  try {
    return {
      ...perfilInicial,
      ...(JSON.parse(localStorage.getItem(CHAVE_PERFIL)) || {}),
    };
  } catch {
    return perfilInicial;
  }
}

/* Faz a leitura segura das publicações criadas pelo usuário. */
function carregarPosts() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_POSTS)) || [];
  } catch {
    return [];
  }
}

/* Mantém a publicação mais recente no topo da lista do perfil. */
function ordenarPosts(lista) {
  return [...lista].sort((postA, postB) => {
    const dataA = new Date(postA.criadoEm || postA.createdAt || 0).getTime();
    const dataB = new Date(postB.criadoEm || postB.createdAt || 0).getTime();

    return dataB - dataA;
  });
}

/* Converte um arquivo de imagem para uma URL local usada pelo perfil. */
function lerImagem(arquivo, aoCarregar) {
  if (!arquivo) {
    return;
  }

  const leitor = new FileReader();
  leitor.onload = () => aoCarregar(leitor.result);
  leitor.readAsDataURL(arquivo);
}

export default function MeuPerfil() {
  /* Estados dos dados pessoais editáveis. */
  const [perfil, setPerfil] = useState(carregarPerfil);
  const [senha, setSenha] = useState("");
  const [mensagemPerfil, setMensagemPerfil] = useState("");

  /* Estados da seção de publicações próprias. */
  const [posts, setPosts] = useState(() => ordenarPosts(carregarPosts()));
  const [postEditando, setPostEditando] = useState(null);
  const [mensagemPost, setMensagemPost] = useState("");

  /* Atualiza um campo específico dos dados pessoais. */
  function atualizarPerfil(campo, valor) {
    setPerfil((perfilAtual) => ({
      ...perfilAtual,
      [campo]: valor,
    }));
  }

  /* Salva email, telefone e senha localmente para esta demonstração frontend. */
  function salvarPerfil(event) {
    event.preventDefault();

    const perfilParaSalvar = {
      nome: perfil.nome,
      biografia: perfil.biografia,
      email: perfil.email,
      telefone: perfil.telefone,
      avatar: perfil.avatar,
      capa: perfil.capa,
    };

    localStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfilParaSalvar));

    /* A senha nunca é armazenada em texto aberto no navegador. */
    if (senha.trim()) {
      localStorage.setItem("cercaTrovaSenhaAtualizada", "true");
      setSenha("");
    }

    setMensagemPerfil("Informações atualizadas com sucesso.");
  }

  /* Abre a publicação selecionada no modo de edição. */
  function iniciarEdicao(post) {
    setPostEditando({
      ...post,
    });
    setMensagemPost("");
  }

  /* Mantém os campos da publicação em edição sincronizados com o formulário. */
  function atualizarPost(campo, valor) {
    setPostEditando((postAtual) => ({
      ...postAtual,
      [campo]: valor,
    }));
  }

  /* Salva a publicação editada, marca o post e atualiza a lista imediatamente. */
  function salvarEdicaoPost(event) {
    event.preventDefault();

    const postAtualizado = {
      ...postEditando,
      editado: true,
      editadoEm: new Date().toISOString(),
    };

    const postsAtualizados = ordenarPosts(
      posts.map((post) =>
        post.id === postEditando.id ? postAtualizado : post,
      ),
    );

    setPosts(postsAtualizados);
    localStorage.setItem(CHAVE_POSTS, JSON.stringify(postsAtualizados));
    setPostEditando(null);
    setMensagemPost("Publicação atualizada com sucesso.");
  }

  /* Exclui uma publicação somente depois da confirmação do usuário. */
  function excluirPost(id) {
    if (!window.confirm("Deseja excluir esta publicação?")) {
      return;
    }

    const postsAtualizados = posts.filter((post) => post.id !== id);
    setPosts(postsAtualizados);
    localStorage.setItem(CHAVE_POSTS, JSON.stringify(postsAtualizados));
    setMensagemPost("Publicação excluída com sucesso.");
  }

  /* Atualiza a foto do post que está sendo editado. */
  function atualizarImagemPost(event) {
    lerImagem(event.target.files[0], (imagem) => {
      atualizarPost("imagem", imagem);
    });
  }

  /* Atualiza a foto de perfil ou a capa selecionada pelo usuário. */
  function atualizarImagemPerfil(campo, event) {
    lerImagem(event.target.files[0], (imagem) => {
      atualizarPerfil(campo, imagem);
    });
  }

  /* Cancela a edição e retorna à lista original de publicações. */
  function cancelarEdicaoPost() {
    setPostEditando(null);
    setMensagemPost("");
  }

  /*
    Recarrega publicações quando a página volta a receber foco.
    Isso permite visualizar posts criados em outra página da aplicação.
  */
  useEffect(() => {
    function atualizarPostsAoVoltar() {
      setPosts(ordenarPosts(carregarPosts()));
    }

    window.addEventListener("focus", atualizarPostsAoVoltar);

    return () => {
      window.removeEventListener("focus", atualizarPostsAoVoltar);
    };
  }, []);

  return (
    <main className="perfil-page">
      {/* Cabeçalho inspirado na referência, com capa, avatar e identificação do usuário. */}
      <section className="perfil-hero">
        <div
          className="perfil-capa"
          style={perfil.capa ? { backgroundImage: `url(${perfil.capa})` } : undefined}
          aria-label="Capa do perfil"
        >
          {!perfil.capa && <span aria-hidden="true">🐾</span>}
        </div>

        <header className="perfil-cabecalho">
          <div className="perfil-avatar">
            {perfil.avatar ? (
              <img src={perfil.avatar} alt="Foto do perfil" />
            ) : (
              <span aria-hidden="true">🐾</span>
            )}
          </div>

          <div className="perfil-identidade">
            <span className="perfil-etiqueta">Área do usuário</span>
            <h1>{perfil.nome}</h1>
            <p>{perfil.biografia}</p>
          </div>
        </header>

        {/* Seletores independentes para trocar a foto e a capa no dispositivo. */}
        <div className="perfil-imagens-acoes">
          <label className="perfil-upload">
            <span>Escolher foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => atualizarImagemPerfil("avatar", event)}
            />
          </label>

          <label className="perfil-upload">
            <span>Escolher capa</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => atualizarImagemPerfil("capa", event)}
            />
          </label>
        </div>
      </section>

      {/* Formulário de edição de email, telefone e senha. */}
      <section className="perfil-card">
        <div className="perfil-secao-titulo">
          <h2>Informações pessoais</h2>
          <p>Atualize os dados usados para acessar sua conta.</p>
        </div>

        <form className="perfil-formulario" onSubmit={salvarPerfil}>
          {/* Campos de identificação pública exibidos no cabeçalho do perfil. */}
          <label className="perfil-campo">
            <span>Nome exibido</span>
            <input
              type="text"
              value={perfil.nome}
              onChange={(event) => atualizarPerfil("nome", event.target.value)}
              required
            />
          </label>

          <label className="perfil-campo">
            <span>Biografia</span>
            <input
              type="text"
              value={perfil.biografia}
              onChange={(event) => atualizarPerfil("biografia", event.target.value)}
              placeholder="Conte um pouco sobre você"
            />
          </label>

          {/* Campo controlado para alterar o email. */}
          <label className="perfil-campo">
            <span>Email</span>
            <input
              type="email"
              value={perfil.email}
              onChange={(event) => atualizarPerfil("email", event.target.value)}
              required
            />
          </label>

          {/* Campo controlado para alterar o telefone. */}
          <label className="perfil-campo">
            <span>Telefone</span>
            <input
              type="tel"
              value={perfil.telefone}
              onChange={(event) =>
                atualizarPerfil("telefone", event.target.value)
              }
              placeholder="(00) 00000-0000"
              required
            />
          </label>

          {/* Campo de senha vazio para que a senha atual nunca seja exibida. */}
          <label className="perfil-campo">
            <span>Nova senha</span>
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite somente se quiser alterar"
              minLength="6"
            />
          </label>

          {/* Área de confirmação do salvamento dos dados pessoais. */}
          <div className="perfil-formulario-rodape">
            <button className="perfil-botao-principal" type="submit">
              Salvar informações
            </button>

            {mensagemPerfil && (
              <span className="perfil-mensagem sucesso" role="status">
                {mensagemPerfil}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Seção que apresenta as publicações criadas pelo próprio usuário. */}
      <section className="perfil-card perfil-publicacoes">
        <div className="perfil-secao-titulo">
          <h2>Minhas publicações</h2>
          <p>Veja e edite os posts que você criou na Home.</p>
        </div>

        {/* Mensagem apresentada quando ainda não existem posts próprios. */}
        {posts.length === 0 && (
          <div className="perfil-vazio">
            <span aria-hidden="true">▧</span>
            <strong>Você ainda não criou publicações.</strong>
            <p>Volte à Home para compartilhar uma informação sobre um pet.</p>
          </div>
        )}

        {/* Lista de cards editáveis das publicações próprias. */}
        <div className="perfil-lista-posts">
          {posts.map((post) => (
            <article className="perfil-post" key={post.id}>
              {/* Imagem do post para aproximar a organização visual da referência. */}
              <div className="perfil-post-imagem">
                <img src={post.imagem} alt={`Foto de ${post.nome || "pet"}`} />
              </div>

              {/* Conteúdo resumido da publicação antes da edição. */}
              <div className="perfil-post-conteudo">
                <div className="perfil-post-topo">
                  <strong>{post.tag || post.status}</strong>
                  <span>{post.nome}</span>
                </div>

                <small className="perfil-post-data">
                  {post.criadoEm
                    ? new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(post.criadoEm))
                    : "Data não informada"}
                </small>

                <p>{post.descricao}</p>

                {post.editado && (
                  <span className="perfil-post-editado">Editado</span>
                )}
              </div>

              {/* Ações separadas para editar ou excluir somente este post. */}
              <div className="perfil-post-acoes">
                <button
                  className="perfil-botao-secundario"
                  type="button"
                  onClick={() => iniciarEdicao(post)}
                >
                  Editar
                </button>

                <button
                  className="perfil-botao-excluir"
                  type="button"
                  onClick={() => excluirPost(post.id)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Formulário exibido somente durante a edição de uma publicação. */}
        {postEditando && (
          <form className="perfil-edicao-post" onSubmit={salvarEdicaoPost}>
            <div className="perfil-edicao-cabecalho">
              <h3>Editando publicação</h3>
              <button type="button" onClick={cancelarEdicaoPost}>
                Cancelar
              </button>
            </div>

            {/* Campo para alterar o texto da publicação. */}
            <label className="perfil-campo">
              <span>Texto</span>
              <textarea
                value={postEditando.descricao}
                onChange={(event) =>
                  atualizarPost("descricao", event.target.value)
                }
                rows="4"
              required
            />
            </label>

            {/* Permite substituir a foto somente durante a edição do post. */}
            <label className="perfil-campo">
              <span>Trocar foto da publicação</span>
              <input
                type="file"
                accept="image/*"
                onChange={atualizarImagemPost}
              />
            </label>

            {/* Campo para alterar a categoria da publicação. */}
            <label className="perfil-campo">
              <span>Categoria</span>
              <select
                value={postEditando.tag || postEditando.status}
                onChange={(event) => {
                  atualizarPost("tag", event.target.value);
                  atualizarPost("status", event.target.value);
                }}
              >
                <option value="Adoção">Adoção</option>
                <option value="Perdido">Perdido</option>
                <option value="TinderPet">TinderPet</option>
                <option value="Achado">Achado</option>
              </select>
            </label>

            {/* Ação que confirma as alterações da publicação. */}
            <button className="perfil-botao-principal" type="submit">
              Salvar publicação
            </button>
          </form>
        )}

        {/* Mensagem de sucesso da edição de publicações. */}
        {mensagemPost && (
          <p className="perfil-mensagem sucesso" role="status">
            {mensagemPost}
          </p>
        )}
      </section>
    </main>
  );
}
