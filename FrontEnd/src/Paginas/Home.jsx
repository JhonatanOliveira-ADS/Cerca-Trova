import { useState } from 'react';
import Banner from '../Componentes/Banner';
import CardAnimais from '../Componentes/CardAnimais';

export default function Home() {
  // nomes aleatorios para teste 
  const [pets] = useState([
    {
      id: '1',
      nome: 'Thor',
      especie: 'Cão',
      idade: '2 anos',
      cidade: 'Bauru',
      imagem: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500'
    },
    {
      id: '2',
      nome: 'Luna',
      especie: 'Gato',
      idade: '6 meses',
      cidade: 'Agudos',
      imagem: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500'
    },
    {
      id: '3',
      nome: 'Bob',
      especie: 'Cão',
      idade: '1 ano',
      cidade: 'Jau',
      imagem: 'https://plus.unsplash.com/premium_photo-1666777247416-ee7a95235559?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ]);
// imagens https://unsplash.com/pt-br/s/fotografias/cachorro  //

  return (
    <main className="home-container">
      <Banner />

      <section className="pets-section">
        <h2>Animais Ansiosos para receber um lar</h2>
        <div className="pets-grid">
          {pets.map((pet) => (
            <CardAnimais key={pet.id} pet={pet} />
          ))}
        </div>
      </section>
    </main>
  );
}
