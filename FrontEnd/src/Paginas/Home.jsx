import { useState } from "react";

import CardAnimais from "../Componentes/CardAnimais";
import CriarPost from "../Componentes/CriarPost";

import "../assets/css/Home.css";

import petsbanner from "../assets/petsbanner.png";

/* Recupera os posts criados pelo usuário sem modificar os posts originais da Home. */
function carregarPostsDoUsuario() {
  try {
    return JSON.parse(localStorage.getItem("cercaTrovaMeusPosts")) || [];
  } catch {
    return [];
  }
}

export default function Home() {
  // Estado do feed: posts próprios entram antes dos posts demonstrativos existentes.
  const [pets, setPets] = useState(() => [
    ...carregarPostsDoUsuario(),
    {
      id: "1",
      nome: "Thor",
      especie: "Cão",
      idade: "2 anos",
      cidade: "Bauru",
      status: "Adoção",
      descricao:
        "Thor é muito carinhoso, brincalhão e está procurando uma família.",
      imagem: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900",
    },

    {
      id: "2",
      nome: "Luna",
      especie: "Gato",
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
      idade: "1 ano",
      cidade: "Jaú",
      status: "Adoção",
      descricao:
        "Bob é cheio de energia e procura um lar onde possa brincar bastante.",
      imagem:
        "https://plus.unsplash.com/premium_photo-1666777247416-ee7a95235559?q=80&w=900&auto=format&fit=crop",
    },
  ]);

  // Insere o novo post no começo do feed para que ele apareça imediatamente.
  function adicionarPost(novoPost) {
    setPets((postsAtuais) => [novoPost, ...postsAtuais]);
  }

  return (
    <main className="home-container">
      {/* =========================
          BANNER
      ========================= */}

      <section className="home-banner">
        <div className="home-banner-texto">
          <span className="home-banner-tag">🐾 Cerca Trova</span>

          <h1>
            Encontre seu novo
            <strong> melhor amigo.</strong>
          </h1>

          <p>
            Conectando animais que precisam de um lar a pessoas cheias de amor.
          </p>
        </div>

        <img
          src={petsbanner}
          alt="Cachorro e gato"
          className="home-banner-pets"
        />
      </section>

      {/* =========================
          FEED
      ========================= */}

      <section className="feed">
        <div className="feed-topo">
          <span className="feed-label">🐾 Comunidade</span>

          <h2>Encontre um novo amigo</h2>

          <p>Animais para adoção, perdidos e encontrados.</p>
        </div>

        {/* Componente acrescentado para permitir a criação de uma publicação. */}
        <CriarPost onPublicar={adicionarPost} imagemPadrao={petsbanner} />

        {pets.map((pet) => (
          <CardAnimais key={pet.id} pet={pet} />
        ))}
      </section>
    </main>
  );
}
