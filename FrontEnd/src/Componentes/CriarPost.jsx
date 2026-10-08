import { useState } from "react";

/*
  Categorias disponíveis para classificar uma nova publicação.
  Cada categoria pode ser selecionada antes do envio do post.
*/
const categoriasPost = ["Adoção", "Perdido", "TinderPet", "Achado"];

/*
  Componente de publicação inspirado em compositores de redes sociais.
  A Home fornece a função onPublicar para inserir o post no feed.
*/
export default function CriarPost({ onPublicar, imagemPadrao }) {
  /* Estados controlados do texto, identificação do pet, categoria e imagem. */
  const [nomePet, setNomePet] = useState("");
  const [texto, setTexto] = useState("");
  const [raca, setRaca] = useState("");
  const [idade, setIdade] = useState("");
  const [categoria, setCategoria] = useState("Adoção");
  const [imagem, setImagem] = useState("");
  /* Mantém o File original para envio multipart ao backend. */
  const [arquivo, setArquivo] = useState(null);
  const [nomeArquivo, setNomeArquivo] = useState("");

  /*
    Converte a imagem selecionada em uma URL de dados.
    Assim, a imagem pode ser mostrada no post sem backend nesta etapa.
  */
  function selecionarImagem(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) {
      return;
    }

    setArquivo(arquivo);

    const leitor = new FileReader();

    leitor.onload = () => {
      setImagem(leitor.result);
      setNomeArquivo(arquivo.name);
    };

    leitor.readAsDataURL(arquivo);
  }

  /*
    Cria um objeto compatível com CardAnimais e com os filtros avançados.
    Raça e idade são salvas com nomes próprios para busca posterior.
  */
  async function publicarPost(event) {
    event.preventDefault();

    const descricao = texto.trim();
    const nomeInformado = nomePet.trim() || "Pet da comunidade";
    const racaInformada = raca.trim() || "Raça não informada";
    const idadeInformada = idade.trim() || "Idade não informada";

    if (!descricao) {
      return;
    }

    const novoPost = {
      id: `post-${Date.now()}`,
      /* O nome informado identifica o animal no card e no Meu Perfil. */
      nome: nomeInformado,
      especie: "Pet",
      raca: racaInformada,
      idade: idadeInformada,
      cidade: "Minha localização",
      status: categoria,
      tag: categoria,
      descricao,
      imagem: imagem || imagemPadrao,
      arquivo,
      /* Registra o momento de criação para ordenar posts no perfil. */
      criadoEm: new Date().toISOString(),
    };

    // A Home envia o registro à API e informa se o backend confirmou a operação.
    const publicadoNoBackend = await onPublicar(novoPost);

    /* Mantém os dados no formulário quando a API rejeitar a publicação. */
    if (!publicadoNoBackend) {
      return;
    }

    /* Limpa o compositor depois que o post foi enviado ao feed. */
    setTexto("");
    setNomePet("");
    setRaca("");
    setIdade("");
    setCategoria("Adoção");
    setImagem("");
    setArquivo(null);
    setNomeArquivo("");
    event.target.reset();
  }

  return (
    <section className="criar-post criar-post-social">
      {/* Identificação do usuário que está iniciando uma nova publicação. */}
      <div className="criar-post-usuario">
        <span className="criar-post-usuario-avatar" aria-hidden="true">
          🐾
        </span>

        <div className="criar-post-usuario-dados">
          <strong>Você</strong>
          <small>Compartilhe com a comunidade Cerca Trova</small>
        </div>
      </div>

      {/* Formulário social com descrição, dados do pet, ações e publicação. */}
      <form className="criar-post-formulario" onSubmit={publicarPost}>
        {/* Campo semelhante ao compositor de redes sociais. */}
        <label className="criar-post-campo criar-post-mensagem">
          <span className="visualmente-oculto">Texto da publicação</span>
          <textarea
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder="mais informações"
            rows="3"
            required
          />
        </label>

        {/* Campo adicional para identificar o pet apresentado na publicação. */}
        <label className="criar-post-campo criar-post-nome-pet">
          <span>Nome do pet</span>
          <input
            type="text"
            value={nomePet}
            onChange={(event) => setNomePet(event.target.value)}
            placeholder="nome do pet"
            aria-label="Nome do pet"
          />
          <small>Informe como o animal é chamado.</small>
        </label>

        {/* Campos complementares para registrar raça e idade do pet. */}
        <div className="criar-post-dados-pet">
          {/* Campo de texto para informar a raça. */}
          <label className="criar-post-campo">
            <span>Raça</span>
            <input
              type="text"
              value={raca}
              onChange={(event) => setRaca(event.target.value)}
              placeholder="Ex.: SRD, Beagle ou Siamês"
            />
          </label>

          {/* Campo de texto para aceitar formatos como 2 anos ou 6 meses. */}
          <label className="criar-post-campo">
            <span>Idade</span>
            <input
              type="text"
              value={idade}
              onChange={(event) => setIdade(event.target.value)}
              placeholder="Ex.: 2 anos"
            />
          </label>
        </div>

        {/* Barra de ações para escolher imagem e categoria do post. */}
        <div className="criar-post-barra-acoes">
          {/* Controle de imagem apresentado como uma ação da rede social. */}
          <label className="criar-post-acao criar-post-upload">
            <span aria-hidden="true">▧</span>
            <strong>Foto</strong>
            <input type="file" accept="image/*" onChange={selecionarImagem} />
          </label>

          {/* Grupo de categorias que funciona como seleção rápida de contexto. */}
          <div
            className="criar-post-categorias"
            aria-label="Categoria da publicação"
          >
            <span className="criar-post-categorias-titulo">Categoria:</span>

            {categoriasPost.map((item) => (
              <button
                className={`criar-post-categoria-botao ${categoria === item ? "selecionada" : ""}`}
                key={item}
                type="button"
                onClick={() => setCategoria(item)}
                aria-pressed={categoria === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Retorno visual do arquivo escolhido para anexar ao post. */}
        {nomeArquivo && (
          <p className="criar-post-arquivo" role="status">
            Foto selecionada: {nomeArquivo}
          </p>
        )}

        {/* Área final com a categoria ativa e a ação de publicar. */}
        <div className="criar-post-rodape">
          <span className="criar-post-status">
            Publicando em: <strong>{categoria}</strong>
          </span>

          {/* O botão só fica ativo quando existe conteúdo para publicar. */}
          <button
            className="criar-post-publicar"
            type="submit"
            disabled={!texto.trim()}
          >
            Publicar
          </button>
        </div>
      </form>
    </section>
  );
}
