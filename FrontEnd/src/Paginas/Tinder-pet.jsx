import { useEffect, useState } from "react";

import "../assets/css/TinderPet.css";

import {
  API_BASE_URL,
  listarPetsTinder,
  listarPublicacoes,
} from "../servicos/autenticacao";

export default function TinderPet() {
  const [pets, setPets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  /* Busca somente pets ativos persistidos no banco. */
  useEffect(() => {
    async function carregarPets() {
      try {
        const [petsCadastrados, publicacoes] = await Promise.all([
          listarPetsTinder(),
          listarPublicacoes(),
        ]);

        /* Converte o modelo PetsTinder para o formato visual já usado pela aba. */
        const petsDoCadastro = Array.isArray(petsCadastrados)
          ? petsCadastrados.map((petApi) => ({
              ...petApi,
              imagem: petApi.foto
                ? `${API_BASE_URL}/files/${encodeURIComponent(petApi.foto)}`
                : "",
              personalidade: petApi.personalidade
                ? petApi.personalidade.split(",").map((item) => item.trim())
                : [],
            }))
          : [];

        /* Publicações marcadas como TinderPet também entram no mesmo catálogo. */
        const petsDasPublicacoes = Array.isArray(publicacoes)
          ? publicacoes
              .filter((publicacao) =>
                ["TINDER_PET", "TinderPet", "Tinder Pet"].includes(
                  publicacao.tipo,
                ),
              )
              .map((publicacao) => ({
                ...publicacao,
                nome: publicacao.nome_pet,
                idade: publicacao.idade_pet,
                imagem: publicacao.foto
                  ? `${API_BASE_URL}/files/${encodeURIComponent(publicacao.foto)}`
                  : "",
                personalidade: [],
                descricao: publicacao.descricao,
              }))
          : [];

        setPets([...petsDasPublicacoes, ...petsDoCadastro]);
      } catch (erroApi) {
        setErro(erroApi.message || "Não foi possível carregar o TinderPet.");
      } finally {
        setCarregando(false);
      }
    }

    carregarPets();
  }, []);

  const [petAtual, setPetAtual] = useState(0);
  const [mensagem, setMensagem] = useState("");
  /* Mantém os objetos completos para que Favoritos consiga renderizar o perfil. */
  const [favoritos, setFavoritos] = useState([]);

  const pet = pets[petAtual];

  /* Impede a interface de acessar um pet inexistente durante a consulta da API. */
  if (carregando) {
    return (
      <main className="gatenho-page">
        <p>Carregando pets cadastrados...</p>
      </main>
    );
  }

  if (erro || !pet) {
    return (
      <main className="gatenho-page">
        <p>{erro || "Ainda não existem pets cadastrados no TinderPet."}</p>
      </main>
    );
  }

  /* Define o estado visual da estrela para o pet atualmente exibido. */
  const petEstaFavoritado = favoritos.some(
    (favorito) => favorito.id === pet.id,
  );

  /* =========================
     PRÓXIMO PET
  ========================= */

  function proximoPet() {
    setMensagem("");

    setPetAtual((atual) => {
      if (atual >= pets.length - 1) {
        return 0;
      }

      return atual + 1;
    });
  }

  /* =========================
     MATCH
  ========================= */

  function darMatch() {
    const nomePet = pet.nome;

    setMensagem(`💜 Pet Match com ${nomePet}!`);

    setTimeout(() => {
      setMensagem("");

      setPetAtual((atual) => {
        if (atual >= pets.length - 1) {
          return 0;
        }

        return atual + 1;
      });
    }, 800);
  }

  /* =========================
     FAVORITAR
  ========================= */

  function favoritar() {
    const jaExiste = favoritos.some((favorito) => favorito.id === pet.id);
    const listaAtualizada = jaExiste
      ? favoritos.filter((favorito) => favorito.id !== pet.id)
      : [...favoritos, pet];
    setFavoritos(listaAtualizada);
    setMensagem(
      jaExiste
        ? `☆ ${pet.nome} foi removido da seleção.`
        : `⭐ ${pet.nome} foi adicionado à seleção.`,
    );
  }

  return (
    <main className="gatenho-page">
      {/* =====================================
          PROPAGANDA ESQUERDA - COBASI
      ===================================== */}

      <a
        href="https://www.cobasi.com.br/c/cachorro/racao"
        target="_blank"
        rel="noopener noreferrer"
        className="tinder-publicidade tinder-publicidade-esquerda"
      >
        <span className="tinder-publicidade-label">Publicidade</span>

        <div className="tinder-publicidade-conteudo">
          <div className="tinder-marca cobasi-marca">COBASI</div>

          <div className="tinder-publicidade-imagem">
            <img
              src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=700&auto=format&fit=crop"
              alt="Ração para cachorro"
            />
          </div>

          <div className="tinder-publicidade-texto">
            <span className="tinder-oferta">🐶 OFERTAS</span>

            <h3>Ração para seu melhor amigo</h3>

            <p>Golden, GranPlus, Premier e muito mais.</p>

            <span className="tinder-publicidade-botao">Ver rações →</span>
          </div>
        </div>
      </a>

      {/* =====================================
          PROPAGANDA DIREITA - AGROSOLO
      ===================================== */}

      <a
        href="https://www.agrosolo.com.br/pet-shop/farmacia-pet/vermifugos-pet"
        target="_blank"
        rel="noopener noreferrer"
        className="tinder-publicidade tinder-publicidade-direita"
      >
        <span className="tinder-publicidade-label">Publicidade</span>

        <div className="tinder-publicidade-conteudo">
          <div className="tinder-marca agrosolo-marca">AGROSOLO</div>

          <div className="tinder-publicidade-imagem">
            <img
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop"
              alt="Farmácia e cuidados para pets"
            />
          </div>

          <div className="tinder-publicidade-texto">
            <span className="tinder-oferta">💊 FARMÁCIA PET</span>

            <h3>Cuidados para seu pet</h3>

            <p>Vermífugos e outros produtos para cuidados animais.</p>

            <span className="tinder-publicidade-botao">Ver produtos →</span>
          </div>
        </div>
      </a>

      {/* =====================================
          CABEÇALHO
      ===================================== */}

      <section className="gatenho-header">
       
        <h1>
          TinderPet
          <span> 💜</span>
        </h1>

        <h2>
          Seu pet também merece um match. Encontre a cãopanhia perfeita. 🐾
        </h2>

        <p>
          Encontre um <strong>gatenho</strong>, uma
          <strong> cãopanhia</strong> ou quem sabe um
          <strong> au-mor</strong> à primeira vista. 💜
        </p>
      </section>

      {/* =====================================
          ÁREA DO PET
      ===================================== */}

      <section className="gatenho-area">
        <article className="gatenho-card">
          <div className="gatenho-foto">
            <img src={pet.imagem} alt={pet.nome} />

            <div className="gatenho-foto-gradient" />

            <div className="gatenho-info-principal">
              <h2>
                {pet.nome}

                <span>{pet.idade}</span>
              </h2>

              <p>📍 {pet.cidade}</p>
            </div>
          </div>

          <div className="gatenho-conteudo">
            <div className="gatenho-status">
              <span>💜 Procurando companhia</span>
            </div>

            <p className="gatenho-descricao">"{pet.descricao}"</p>

            <div className="gatenho-tags">
              {pet.personalidade.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="gatenho-detalhes">
              <div>
                <small>Espécie</small>

                <strong>{pet.especie}</strong>
              </div>

              <div>
                <small>Sexo</small>

                <strong>{pet.sexo}</strong>
              </div>

              <div>
                <small>Porte</small>

                <strong>{pet.porte}</strong>
              </div>
            </div>

            {mensagem && <div className="gatenho-mensagem">{mensagem}</div>}

            <div className="gatenho-acoes">
              <button
                type="button"
                className="btn-passar"
                onClick={proximoPet}
                title="Próxima patinha"
              >
                ✕
              </button>

              <button
                type="button"
                className={`btn-favorito ${petEstaFavoritado ? "favoritado" : ""}`}
                onClick={favoritar}
                title={
                  petEstaFavoritado ? "Remover dos favoritos" : "Favoritar"
                }
                aria-label={
                  petEstaFavoritado
                    ? `Remover ${pet.nome} dos favoritos`
                    : `Adicionar ${pet.nome} aos favoritos`
                }
                aria-pressed={petEstaFavoritado}
              >
                {petEstaFavoritado ? "★" : "☆"}
              </button>

              <button
                type="button"
                className="btn-match"
                onClick={darMatch}
                title="Dar Pet Match"
              >
                💜
              </button>
            </div>

            <div className="gatenho-legendas">
              <span>Próxima patinha</span>

              <span>Favoritar</span>

              <span>Pet Match!</span>
            </div>
          </div>
        </article>
      </section>

      <section className="gatenho-frase">
        <span>🐾</span>

        <p>
          Toda grande cãopanhia pode começar com
          <strong> um simples match.</strong>
        </p>
      </section>
    </main>
  );
}
