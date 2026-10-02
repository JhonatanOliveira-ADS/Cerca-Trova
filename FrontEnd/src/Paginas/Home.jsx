import { useState } from "react";

import CardAnimais from "../Componentes/CardAnimais";
import CriarPost from "../Componentes/CriarPost";

import "../assets/css/Home.css";

import petsbanner from "../assets/petsbanner.png";


/* ==========================================
   CARREGAR POSTS DO USUÁRIO
========================================== */

function carregarPostsDoUsuario() {
  try {
    const postsSalvos = JSON.parse(
      localStorage.getItem("cercaTrovaMeusPosts")
    );

    return Array.isArray(postsSalvos)
      ? postsSalvos
      : [];
  } catch (erro) {
    console.error(
      "Erro ao carregar os posts do usuário:",
      erro
    );

    return [];
  }
}


/* ==========================================
   HOME
========================================== */

export default function Home() {

  /* ========================================
     POSTS DO FEED
  ======================================== */

  const [pets, setPets] = useState(() => [
    ...carregarPostsDoUsuario(),

    {
      id: "1",
      nome: "Thor",
      especie: "Cão",
      raca: "SRD",
      idade: "2 anos",
      cidade: "Bauru",
      status: "Adoção",

      descricao:
        "Thor é muito carinhoso, brincalhão e está procurando uma família.",

      imagem:
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900",
    },

    {
      id: "2",
      nome: "Luna",
      especie: "Gato",
      raca: "SRD",
      idade: "6 meses",
      cidade: "Agudos",
      status: "Adoção",

      descricao:
        "Luna é tranquila e adora carinho. Está disponível para adoção responsável.",

      imagem:
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900",
    },

    {
      id: "3",
      nome: "Bob",
      especie: "Cão",
      raca: "SRD",
      idade: "1 ano",
      cidade: "Jaú",
      status: "Adoção",

      descricao:
        "Bob é cheio de energia e procura um lar onde possa brincar bastante.",

      imagem:
        "https://plus.unsplash.com/premium_photo-1666777247416-ee7a95235559?q=80&w=900&auto=format&fit=crop",
    },
  ]);


  /* ========================================
     ADICIONAR NOVO POST
  ======================================== */

  function adicionarPost(novoPost) {
    setPets((postsAtuais) => [
      novoPost,
      ...postsAtuais,
    ]);
  }


  /* ========================================
     INTERFACE
  ======================================== */

  return (
    <main className="home-container">

      {/* ==================================
          BANNER
      ================================== */}

      <section className="home-banner">

        <img
          src={petsbanner}
          alt="Encontre o seu novo melhor amigo"
          className="home-banner-pets"
        />

      </section>


      {/* ==================================
          FEED
      ================================== */}

      <section className="feed">

        <div className="feed-topo">

          <span className="feed-label">
            🐾 Comunidade
          </span>

          <h2>
            Encontre um novo amigo
          </h2>

          <p>
            Animais para adoção, perdidos e encontrados.
          </p>

        </div>


        {/* ==================================
            CRIAR NOVA PUBLICAÇÃO
        ================================== */}

        <CriarPost
          onPublicar={adicionarPost}
          imagemPadrao={petsbanner}
        />


        {/* ==================================
            PUBLICAÇÕES
        ================================== */}

        {pets.map((pet) => (
          <CardAnimais
            key={pet.id}
            pet={pet}
          />
        ))}

      </section>

    </main>
  );
}