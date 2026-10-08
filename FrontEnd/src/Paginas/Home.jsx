import { useEffect, useState } from "react";

import CardAnimais from "../Componentes/CardAnimais";
import CriarPost from "../Componentes/CriarPost";
import "../assets/css/Home.css";
import petsbanner from "../assets/petsbanner.png";
import {
  API_BASE_URL,
  criarPublicacao,
  listarPublicacoes,
} from "../servicos/autenticacao";

/* Converte os nomes internos do banco para os rótulos apresentados na interface. */
function adaptarPublicacao(publicacao) {
  const nomesDosTipos = {
    ADOCAO: "Adoção",
    PERDIDO: "Perdido",
    ENCONTRADO: "Achado",
    TINDER_PET: "TinderPet",
    TinderPet: "TinderPet",
    "Tinder Pet": "TinderPet",
  };
  const categoria = nomesDosTipos[publicacao.tipo] || publicacao.tipo || "Adoção";

  return {
    ...publicacao,
    nome: publicacao.nome_pet,
    idade: publicacao.idade_pet,
    imagem: publicacao.foto
      ? `${API_BASE_URL}/files/${publicacao.foto}`
      : petsbanner,
    status: categoria,
    tag: categoria,
  };
}

/* Página principal com feed e criação de publicações persistidas no backend. */
export default function Home() {
  const [pets, setPets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroFeed, setErroFeed] = useState("");

  /* Busca exclusivamente registros ativos da API, sem dados demonstrativos locais. */
  useEffect(() => {
    async function carregarFeedReal() {
      try {
        const resposta = await listarPublicacoes();
        const publicacoesDaHome = Array.isArray(resposta)
          ? resposta.filter(
              (publicacao) =>
                !["TINDER_PET", "TinderPet", "Tinder Pet"].includes(
                  publicacao.tipo,
                ),
            )
          : [];
        setPets(publicacoesDaHome.map(adaptarPublicacao));
      } catch (erro) {
        setErroFeed(erro.message || "Não foi possível carregar as publicações.");
      } finally {
        setCarregando(false);
      }
    }

    carregarFeedReal();
  }, []);

  /* Envia a nova publicação para a API e adiciona o registro devolvido ao feed. */
  async function adicionarPost(novoPost) {
    try {
      const resposta = await criarPublicacao({
        tipo: {
          Adoção: "ADOCAO",
          Perdido: "PERDIDO",
          TinderPet: "TINDER_PET",
          Achado: "ENCONTRADO",
        }[novoPost.status] || "ADOCAO",
        nome_pet: novoPost.nome,
        especie: novoPost.especie,
        raca: novoPost.raca,
        idade_pet: novoPost.idade,
        porte: "Não informado",
        sexo: "Não informado",
        descricao: novoPost.descricao,
        cidade: novoPost.cidade,
        estado: "Não informado",
        arquivo: novoPost.arquivo,
      });

      /* TinderPet possui catálogo próprio; as demais categorias permanecem no feed geral. */
      if (!["TINDER_PET", "TinderPet", "Tinder Pet"].includes(resposta.tipo)) {
        setPets((postsAtuais) => [adaptarPublicacao(resposta), ...postsAtuais]);
      }
      setErroFeed("");
      return true;
    } catch (erro) {
      setErroFeed(erro.message || "Não foi possível publicar neste momento.");
      return false;
    }
  }

  return (
    <main className="home-container">
      {/* Banner visual da comunidade. */}
      <section className="home-banner">
        <img
          src={petsbanner}
          alt="Encontre o seu novo melhor amigo"
          className="home-banner-pets"
        />
      </section>

      {/* Feed conectado à API e compositor de novas publicações. */}
      <section className="feed">
        <div className="feed-topo">
          <span className="feed-label">🐾 Comunidade</span>
          <h2>Encontre um novo amigo</h2>
          <p>Animais para adoção, perdidos e encontrados.</p>
        </div>

        <CriarPost onPublicar={adicionarPost} imagemPadrao={petsbanner} />

        {carregando ? (
          <p className="feed-estado">Carregando publicações...</p>
        ) : erroFeed ? (
          <p className="feed-estado feed-estado-erro">{erroFeed}</p>
        ) : pets.length === 0 ? (
          <p className="feed-estado">Ainda não existem publicações.</p>
        ) : (
          pets.map((pet) => <CardAnimais key={pet.id} pet={pet} />)
        )}
      </section>
    </main>
  );
}
