import { useState, useEffect } from 'react';
import CardAnimais from '../Componentes/CardAnimais';
import '../assets/css/Favoritos.css';
 
export default function Favoritos() {
  // Estado para armazenar os itens favoritados recuperados do navegador
  const [favoritos, setFavoritos] = useState([]);
 
  // Carrega a lista de favoritos do LocalStorage assim que o componente monta
  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem('cercaTrovaFavoritos')) || [];
    setFavoritos(salvos);
  }, []);
 
  // Função para remover um pet diretamente da tela de favoritos
  const handleRemoverFavorito = (pet) => {
    const listaAtualizada = favoritos.filter((fav) => fav.id !== pet.id);
   
    // Atualiza o estado da tela para o card sumir na hora
    setFavoritos(listaAtualizada);
    // Atualiza o LocalStorage para sincronizar com a página Home
    localStorage.setItem('cercaTrovaFavoritos', JSON.stringify(listaAtualizada));
  };
 
  return (
    <main className="favoritos-container">
     
      {/* SEÇÃO DO FEED DE FAVORITOS */}
      <section className="feed">
       
        <div className="feed-topo">
          <span className="feed-label">⭐ Seus Salvos</span>
          <h2>Meus Favoritos</h2>
          <p>
            Gerencie os animais que você favoritou e demonstrou interesse.
          </p>
        </div>
 
        {/* VALIDAÇÃO DE ESTADO VAZIO */}
        {favoritos.length === 0 ? (
          <div className="favoritos-vazio">
            <p>Você ainda não favoritou nenhum bichinho. 💔</p>
            <span>Volte para a página inicial para conhecer nossos amigos!</span>
          </div>
        ) : (
          // RENDERIZAÇÃO DOS FAVORITOS
          favoritos.map((pet) => (
            <CardAnimais
              key={pet.id}
              pet={pet}
              // Como estamos na página de salvos, o coração sempre inicia preenchido
              isFavorito={true}
              // O clique aqui vai servir especificamente para remover do painel
              onToggleFavorito={handleRemoverFavorito}
            />
          ))
        )}
 
      </section>
 
    </main>
  );
}
 