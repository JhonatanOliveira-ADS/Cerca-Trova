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
  /* Estados controlados do texto, categoria e imagem escolhidos pelo usuário. */
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("Adoção");
  const [imagem, setImagem] = useState("");
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

    const leitor = new FileReader();

    leitor.onload = () => {
      setImagem(leitor.result);
      setNomeArquivo(arquivo.name);
    };

    leitor.readAsDataURL(arquivo);
  }

  /*
    Cria um objeto compatível com CardAnimais e envia o resultado para a Home.
    Depois da publicação, o compositor volta ao estado inicial.
  */
  function publicarPost(event) {
    event.preventDefault();

    const descricao = texto.trim();

    if (!descricao) {
      return;
    }

    const novoPost = {
      id: `post-${Date.now()}`,
      nome: "Você",
      especie: "Pet",
      idade: "Não informado",
      cidade: "Minha localização",
      status: categoria,
      tag: categoria,
      descricao,
      imagem: imagem || imagemPadrao,
    };

    onPublicar(novoPost);
    setTexto("");
    setCategoria("Adoção");
    setImagem("");
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

      {/* Formulário social com campo principal, ações e botão de publicação. */}
      <form className="criar-post-formulario" onSubmit={publicarPost}>
        {/* Campo semelhante ao compositor de redes sociais. */}
        <label className="criar-post-campo criar-post-mensagem">
          <span className="visualmente-oculto">Texto da publicação</span>
          <textarea
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder="No que você está pensando sobre um pet?"
            rows="3"
            required
          />
        </label>

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

          <button className="criar-post-publicar" type="submit">
            Publicar
          </button>
        </div>
      </form>
    </section>
  );
}
