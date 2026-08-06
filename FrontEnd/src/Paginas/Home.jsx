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
      imagem: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500'
    }
  ]);

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
