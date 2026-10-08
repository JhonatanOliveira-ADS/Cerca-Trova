import { useEffect, useState } from "react";

import "../assets/css/MeuPerfil.css";
import {
  atualizarPerfil as atualizarPerfilApi,
  atualizarFotoCapa,
  atualizarFotoPerfil,
  atualizarPublicacao as atualizarPublicacaoApi,
  excluirPublicacao,
  listarPublicacoes,
  obterPerfil,
  API_BASE_URL,
} from "../servicos/autenticacao";

/* Estrutura vazia usada somente enquanto os dados reais estão sendo carregados. */
const perfilInicial = {
  nome: "",
  biografia: "",
  email: "",
  telefone: "",
  avatar: "",
  capa: "",
};

/* Converte o rótulo do formulário para o valor persistido no banco. */
const tiposPorRotulo = {
  Adoção: "ADOCAO",
  Perdido: "PERDIDO",
  TinderPet: "TINDER_PET",
  Achado: "ENCONTRADO",
};

/* Converte valores antigos ou novos do banco para o rótulo do select. */
function rotuloDaCategoria(tipo) {
  const rotulos = {
    ADOCAO: "Adoção",
    PERDIDO: "Perdido",
    TINDER_PET: "TinderPet",
    TinderPet: "TinderPet",
    "Tinder Pet": "TinderPet",
    ENCONTRADO: "Achado",
  };

  return rotulos[tipo] || "Adoção";
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

/* Converte o nome salvo no banco em uma URL exibível pelo navegador. */
function urlImagemPerfil(nomeArquivo) {
  if (!nomeArquivo) {
    return "";
  }

  if (nomeArquivo.startsWith("data:") || nomeArquivo.startsWith("http")) {
    return nomeArquivo;
  }

  return `${API_BASE_URL}/files/${encodeURIComponent(nomeArquivo)}`;
}

export default function MeuPerfil() {
  /* Estados dos dados pessoais editáveis. */
  const [perfil, setPerfil] = useState(perfilInicial);
  const [senha, setSenha] = useState("");
  const [mensagemPerfil, setMensagemPerfil] = useState("");
  /* Mantém os arquivos originais até o usuário confirmar o salvamento. */
  const [arquivosPerfil, setArquivosPerfil] = useState({
    avatar: null,
    capa: null,
  });

  /* Estados da seção de publicações próprias. */
  const [posts, setPosts] = useState([]);
  const [postEditando, setPostEditando] = useState(null);
  const [mensagemPost, setMensagemPost] = useState("");

  /* Sincroniza os dados básicos do perfil e as publicações autenticadas com a API. */
  useEffect(() => {
    async function carregarDadosReais() {
      try {
        const perfilApi = await obterPerfil();
        if (perfilApi) {
          setPerfil((perfilAtual) => ({
            ...perfilAtual,
            nome: perfilApi.nome || perfilAtual.nome,
            email: perfilApi.email || perfilAtual.email,
            telefone: perfilApi.telefone || perfilAtual.telefone,
            avatar: urlImagemPerfil(perfilApi.foto_perfil),
            capa: urlImagemPerfil(perfilApi.foto_capa),
          }));
        }

        const publicacoesApi = await listarPublicacoes();
        if (Array.isArray(publicacoesApi) && perfilApi?.id) {
          const postsDoUsuario = publicacoesApi
            .filter((post) => post.id_usuario === perfilApi.id)
            .map((post) => ({
              ...post,
              nome: post.nome_pet,
              idade: post.idade_pet,
              imagem: post.foto
                ? `http://localhost:3333/files/${post.foto}`
                : "",
              status: rotuloDaCategoria(post.tipo),
              tag: rotuloDaCategoria(post.tipo),
              criadoEm: post.data_criacao,
            }));
          setPosts(ordenarPosts(postsDoUsuario));
        }
      } catch (erro) {
        // Os dados locais continuam disponíveis quando não houver sessão ou API.
        console.info("Perfil real indisponível; mantendo dados locais.", erro.message);
      }
    }

    carregarDadosReais();
  }, []);

  /* Atualiza um campo específico dos dados pessoais. */
  function atualizarPerfil(campo, valor) {
    setPerfil((perfilAtual) => ({
      ...perfilAtual,
      [campo]: valor,
    }));
  }

  /* Salva email, telefone e senha localmente para esta demonstração frontend. */
  async function salvarPerfil(event) {
    event.preventDefault();

    try {
      // Os campos textuais são enviados pela rota própria de atualização do usuário.
      await atualizarPerfilApi({
        nome: perfil.nome,
        email: perfil.email,
        telefone: perfil.telefone,
      });

      /* Cada arquivo segue pela rota Multer correspondente usando o campo file. */
      if (arquivosPerfil.avatar) {
        await atualizarFotoPerfil(arquivosPerfil.avatar);
      }

      if (arquivosPerfil.capa) {
        await atualizarFotoCapa(arquivosPerfil.capa);
      }

      /* Reconsulta o perfil para obter os nomes oficiais gravados pelo backend. */
      const perfilAtualizado = await obterPerfil();

      /* Usa os nomes oficiais devolvidos pelo banco depois do upload. */
      setPerfil((perfilAtual) => ({
        ...perfilAtual,
        avatar: urlImagemPerfil(perfilAtualizado.foto_perfil),
        capa: urlImagemPerfil(perfilAtualizado.foto_capa),
      }));
      setArquivosPerfil({ avatar: null, capa: null });
      setMensagemPerfil("Informações atualizadas com sucesso.");
    } catch (erro) {
      setMensagemPerfil(erro.message || "Não foi possível salvar o perfil.");
      return;
    }

    /* A senha nunca é armazenada em texto aberto no navegador. */
    setSenha("");

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
  async function salvarEdicaoPost(event) {
    event.preventDefault();

    const postAtualizado = {
      ...postEditando,
      editado: true,
      editadoEm: new Date().toISOString(),
    };

    try {
      await atualizarPublicacaoApi({
        ...postAtualizado,
        tipo: postAtualizado.tipo || "ADOCAO",
        nome_pet: postAtualizado.nome_pet || postAtualizado.nome,
        idade_pet: postAtualizado.idade_pet || postAtualizado.idade,
        arquivo: postAtualizado.arquivo,
      });
      setPosts((postsAtuais) =>
        ordenarPosts(
          postsAtuais.map((post) =>
            post.id === postEditando.id ? postAtualizado : post,
          ),
        ),
      );
      setPostEditando(null);
      setMensagemPost("Publicação atualizada com sucesso.");
    } catch (erro) {
      setMensagemPost(erro.message || "Não foi possível atualizar a publicação.");
    }
  }

  /* Exclui uma publicação somente depois da confirmação do usuário. */
  function excluirPost(id) {
    if (!window.confirm("Deseja excluir esta publicação?")) {
      return;
    }

    excluirPublicacao(id)
      .then(() => {
        setPosts((postsAtuais) => postsAtuais.filter((post) => post.id !== id));
        setMensagemPost("Publicação excluída com sucesso.");
      })
      .catch((erro) => {
        setMensagemPost(erro.message || "Não foi possível excluir a publicação.");
      });
  }

  /* Atualiza a foto do post que está sendo editado. */
  function atualizarImagemPost(event) {
    lerImagem(event.target.files[0], (imagem) => {
      atualizarPost("imagem", imagem);
    });
  }

  /* Atualiza a foto de perfil ou a capa selecionada pelo usuário. */
  function atualizarImagemPerfil(campo, event) {
    const arquivo = event.target.files[0];

    lerImagem(arquivo, (imagem) => {
      atualizarPerfil(campo, imagem);
      setArquivosPerfil((arquivosAtuais) => ({
        ...arquivosAtuais,
        [campo]: arquivo,
      }));
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
    return undefined;
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
                  const rotulo = event.target.value;
                  atualizarPost("tag", rotulo);
                  atualizarPost("status", rotulo);
                  atualizarPost("tipo", tiposPorRotulo[rotulo]);
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
