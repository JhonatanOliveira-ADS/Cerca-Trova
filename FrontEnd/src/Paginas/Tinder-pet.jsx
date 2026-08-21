import { useState } from 'react';

import '../assets/css/TinderPet.css';

import lalinha from '../assets/lalinha.jpg';
import loki from '../assets/loki.png';
import bordercollie from '../assets/border-collie.webp';
import husky from '../assets/husky.jpg';
import rottweiler from '../assets/rottweiler.webp';


export default function TinderPet() {

  const pets = [

    {
      id: 1,
      nome: 'Lalinha',
      idade: '1 ano',
      especie: 'Cão',
      cidade: 'Bauru - SP',
      sexo: 'Fêmea',
      porte: 'Pequeno',

      personalidade: [
        'Carinhosa 💜',
        'Brincalhona 🐾',
        'Adora colo'
      ],

      descricao:
        'Pequena no tamanho, gigante na personalidade. Adoro brincar, receber carinho e conhecer novas patinhas.',

      imagem: lalinha
    },

    {
      id: 2,
      nome: 'Loki',
      idade: '3 anos',
      especie: 'Cão',
      cidade: 'Bauru - SP',
      sexo: 'Macho',
      porte: 'Grande',

      personalidade: [
        'Companheiro 🐾',
        'Brincalhão 🎾',
        'Carinhoso 💜'
      ],

      descricao:
        'Especialista em cãopanhia, passeios e brincadeiras. Estou procurando novas patinhas para viver grandes aventuras.',

      imagem: loki
    },

    {
      id: 3,
      nome: 'Max',
      idade: '2 anos',
      especie: 'Cão',
      cidade: 'Bauru - SP',
      sexo: 'Macho',
      porte: 'Médio',

      personalidade: [
        'Inteligente 🧠',
        'Energético ⚡',
        'Brincalhão 🎾'
      ],

      descricao:
        'Cheio de energia e sempre pronto para uma aventura. Procuro uma cãopanhia para correr, brincar e colecionar bons momentos.',

      imagem: bordercollie
    },

    {
      id: 4,
      nome: 'Sky',
      idade: '2 anos',
      especie: 'Cão',
      cidade: 'Bauru - SP',
      sexo: 'Fêmea',
      porte: 'Médio',

      personalidade: [
        'Aventureira 🏔️',
        'Energética ⚡',
        'Sociável 🐾'
      ],

      descricao:
        'Olhos marcantes e energia de sobra. Procuro uma cãopanhia para passeios, brincadeiras e muitas aventuras.',

      imagem: husky
    },

    {
      id: 5,
      nome: 'Bruce',
      idade: '4 anos',
      especie: 'Cão',
      cidade: 'Bauru - SP',
      sexo: 'Macho',
      porte: 'Grande',

      personalidade: [
        'Companheiro 🐾',
        'Confiante 💪',
        'Carinhoso 💜'
      ],

      descricao:
        'Cara de sério, coração de manteiga. Gosto de companhia, passeios tranquilos e de conhecer novas patinhas.',

      imagem: rottweiler
    }

  ];


  const [petAtual, setPetAtual] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [favoritos, setFavoritos] = useState([]);

  const pet = pets[petAtual];


  /* =========================
     PRÓXIMO PET
  ========================= */

  function proximoPet() {

    setMensagem('');

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

    setMensagem(
      `💜 Pet Match com ${nomePet}!`
    );

    setTimeout(() => {

      setMensagem('');

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

    if (!favoritos.includes(pet.id)) {

      setFavoritos([
        ...favoritos,
        pet.id
      ]);

      setMensagem(
        `⭐ ${pet.nome} foi adicionado aos seus favoritos!`
      );

    } else {

      setMensagem(
        `💜 ${pet.nome} já está nos seus favoritos.`
      );

    }

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

        <span className="tinder-publicidade-label">
          Publicidade
        </span>

        <div className="tinder-publicidade-conteudo">

          <div className="tinder-marca cobasi-marca">
            COBASI
          </div>

          <div className="tinder-publicidade-imagem">

            <img
              src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=700&auto=format&fit=crop"
              alt="Ração para cachorro"
            />

          </div>

          <div className="tinder-publicidade-texto">

            <span className="tinder-oferta">
              🐶 OFERTAS
            </span>

            <h3>
              Ração para seu melhor amigo
            </h3>

            <p>
              Golden, GranPlus, Premier e muito mais.
            </p>

            <span className="tinder-publicidade-botao">
              Ver rações →
            </span>

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

        <span className="tinder-publicidade-label">
          Publicidade
        </span>

        <div className="tinder-publicidade-conteudo">

          <div className="tinder-marca agrosolo-marca">
            AGROSOLO
          </div>

          <div className="tinder-publicidade-imagem">

            <img
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop"
              alt="Farmácia e cuidados para pets"
            />

          </div>

          <div className="tinder-publicidade-texto">

            <span className="tinder-oferta">
              💊 FARMÁCIA PET
            </span>

            <h3>
              Cuidados para seu pet
            </h3>

            <p>
              Vermífugos e outros produtos para cuidados animais.
            </p>

            <span className="tinder-publicidade-botao">
              Ver produtos →
            </span>

          </div>

        </div>

      </a>



      {/* =====================================
          CABEÇALHO
      ===================================== */}

      <section className="gatenho-header">

        <span className="gatenho-tag">
          🐾 Cerca Trova apresenta
        </span>

        <h1>
          TinderPet
          <span> 💜</span>
        </h1>

        <h2>
          Seu pet também merece um match.
          Encontre a cãopanhia perfeita. 🐾
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

            <img
              src={pet.imagem}
              alt={pet.nome}
            />

            <div className="gatenho-foto-gradient" />


            <div className="gatenho-info-principal">

              <h2>

                {pet.nome}

                <span>
                  {pet.idade}
                </span>

              </h2>

              <p>
                📍 {pet.cidade}
              </p>

            </div>

          </div>



          <div className="gatenho-conteudo">


            <div className="gatenho-status">

              <span>
                💜 Procurando companhia
              </span>

            </div>


            <p className="gatenho-descricao">
              "{pet.descricao}"
            </p>


            <div className="gatenho-tags">

              {pet.personalidade.map((item) => (

                <span key={item}>
                  {item}
                </span>

              ))}

            </div>



            <div className="gatenho-detalhes">

              <div>

                <small>
                  Espécie
                </small>

                <strong>
                  {pet.especie}
                </strong>

              </div>


              <div>

                <small>
                  Sexo
                </small>

                <strong>
                  {pet.sexo}
                </strong>

              </div>


              <div>

                <small>
                  Porte
                </small>

                <strong>
                  {pet.porte}
                </strong>

              </div>

            </div>



            {mensagem && (

              <div className="gatenho-mensagem">
                {mensagem}
              </div>

            )}



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
                className="btn-favorito"
                onClick={favoritar}
                title="Favoritar"
              >
                ⭐
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

              <span>
                Próxima patinha
              </span>

              <span>
                Favoritar
              </span>

              <span>
                Pet Match!
              </span>

            </div>


          </div>

        </article>

      </section>



      <section className="gatenho-frase">

        <span>
          🐾
        </span>

        <p>
          Toda grande cãopanhia pode começar com

          <strong>
            {' '}um simples match.
          </strong>
        </p>

      </section>


    </main>

  );

}