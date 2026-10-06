import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/css/PetDetalhesModal.css";

/* Coordenadas usadas como centro inicial quando o pet ainda não possui um ponto registrado. */
const MAPA_PADRAO = [-22.3145, -49.0606];

/* Prefixo usado para separar os pins criados em cada publicação. */
const CHAVE_PINS_AVISTAMENTO = "cercaTrovaPinsAvistamento";

/* Converte a data do pin para uma leitura amigável no popup do mapa. */
function formatarHorarioAvistamento(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

/* Formata latitude e longitude para exibição no cartão de localização marcada. */
function formatarCoordenada(valor) {
  return Number(valor).toFixed(6);
}

/*
  Verifica se a publicação representa um animal perdido.
  A leitura aceita os nomes de campos usados nas diferentes páginas do projeto.
*/
function petEstaPerdido(pet) {
  const marcador = String(
    pet?.tag || pet?.status || pet?.situacao || "",
  ).toLowerCase();

  return marcador.includes("perdid");
}

/*
  Converte os formatos de localização já usados pelo projeto em uma lista única.
  Assim, o modal consegue receber pontos do backend ou dados adicionados localmente.
*/
function normalizarMarcadores(pet, mapaAvistamentos) {
  const pontosRecebidos = Array.isArray(mapaAvistamentos)
    ? mapaAvistamentos
    : [];

  const pontosDoPet = pet?.latitude && pet?.longitude ? [pet] : [];

  return [...pontosRecebidos, ...pontosDoPet]
    .map((ponto) => ({
      latitude: Number(ponto.latitude),
      longitude: Number(ponto.longitude),
      descricao: ponto.descricao || "Avistamento registrado pela comunidade.",
      horario: ponto.horario || ponto.data_criacao || ponto.criadoEm || null,
    }))
    .filter(
      (ponto) =>
        Number.isFinite(ponto.latitude) &&
        Number.isFinite(ponto.longitude),
    );
}

export default function PetDetalhesModal({
  pet,
  aberto,
  aoFechar,
  mapaAvistamentos = [],
}) {
  /* Referências usadas para criar e destruir o mapa sem recriá-lo a cada renderização. */
  const mapaElementoRef = useRef(null);
  const mapaRef = useRef(null);

  /* Identifica a publicação para manter os pins separados entre os pets. */
  const chavePet = pet?.id || pet?.nome || "pet-sem-id";

  /* Guarda os pins adicionados pelo usuário durante o uso do modal. */
  const [pinsLocais, setPinsLocais] = useState([]);

  /* Mantém na interface o último ponto marcado, como acontece na página Mapa. */
  const [localizacaoMarcada, setLocalizacaoMarcada] = useState(null);

  /* O mapa só é exibido quando o modal contém um animal perdido. */
  const deveExibirMapa = petEstaPerdido(pet);

  /* A lista de pontos é recalculada quando o pet ou os avistamentos mudam. */
  const marcadores = useMemo(
    () => normalizarMarcadores(pet, mapaAvistamentos),
    [pet, mapaAvistamentos],
  );

  /*
    Recupera os pins já marcados para este pet no navegador.
    O armazenamento local mantém a localização disponível ao reabrir o modal.
  */
  useEffect(() => {
    try {
      const pinsSalvos = JSON.parse(
        localStorage.getItem(CHAVE_PINS_AVISTAMENTO) || "{}",
      );

      setPinsLocais(
        Array.isArray(pinsSalvos[chavePet]) ? pinsSalvos[chavePet] : [],
      );

      const pinsDoPet = pinsSalvos[chavePet];
      setLocalizacaoMarcada(
        Array.isArray(pinsDoPet) && pinsDoPet.length > 0
          ? pinsDoPet[pinsDoPet.length - 1]
          : null,
      );
    } catch {
      setPinsLocais([]);
      setLocalizacaoMarcada(null);
    }
  }, [chavePet]);

  /* Lista única para contabilizar e desenhar pins do backend e pins locais. */
  const todosOsMarcadores = useMemo(
    () => [...marcadores, ...pinsLocais],
    [marcadores, pinsLocais],
  );

  /*
    Cria o mapa Leaflet ao abrir o modal e remove a instância ao fechá-lo.
    Os marcadores representam os marcos de avistamento disponíveis.
  */
  useEffect(() => {
    if (!aberto || !deveExibirMapa || !mapaElementoRef.current) {
      return undefined;
    }

    const mapa = L.map(mapaElementoRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    mapa.setView(MAPA_PADRAO, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa);

    const pontos = [];

    todosOsMarcadores.forEach((ponto) => {
      const coordenadas = [ponto.latitude, ponto.longitude];
      pontos.push(coordenadas);

      const horario = ponto.horario
        ? `<br /><strong>Horário:</strong> ${formatarHorarioAvistamento(
            ponto.horario,
          )}`
        : "";

      /* Os pins locais recebem uma classe diferente para serem reconhecidos no mapa. */
      const classePin = ponto.descricao.startsWith("Novo avistamento")
        ? "pet-modal-marker-local"
        : "pet-modal-marker-comunidade";

      const icone = L.divIcon({
        className: "pet-modal-marker-shell",
        html: `<button class="pet-modal-marker ${classePin}" type="button" aria-label="Abrir detalhes do avistamento"><span>🐾</span></button>`,
        iconSize: [44, 44],
        iconAnchor: [22, 42],
      });

      L.marker(coordenadas)
        .addTo(mapa)
        .setIcon(icone)
        .bindPopup(`${ponto.descricao}${horario}`);
    });

    /*
      Cada clique no mapa cria um novo pin com as coordenadas e o horário atual.
      O evento fica ativo somente enquanto este modal estiver aberto.
    */
    mapa.on("click", (evento) => {
      const novoPin = {
        latitude: evento.latlng.lat,
        longitude: evento.latlng.lng,
        descricao: "Novo avistamento marcado neste local.",
        horario: new Date().toISOString(),
      };

      /* Atualiza imediatamente o cartão de localização abaixo do mapa. */
      setLocalizacaoMarcada(novoPin);

      setPinsLocais((pinsAtuais) => {
        const listaAtualizada = [...pinsAtuais, novoPin];

        try {
          const pinsSalvos = JSON.parse(
            localStorage.getItem(CHAVE_PINS_AVISTAMENTO) || "{}",
          );

          localStorage.setItem(
            CHAVE_PINS_AVISTAMENTO,
            JSON.stringify({
              ...pinsSalvos,
              [chavePet]: listaAtualizada,
            }),
          );
        } catch {
          /* A interface continua funcionando se o navegador bloquear o storage. */
        }

        return listaAtualizada;
      });
    });

    if (pontos.length === 1) {
      mapa.setView(pontos[0], 16);
    }

    if (pontos.length > 1) {
      mapa.fitBounds(L.latLngBounds(pontos), {
        padding: [28, 28],
        maxZoom: 16,
      });
    }

    mapaRef.current = mapa;

    const timer = window.setTimeout(() => {
      mapa.invalidateSize();
    }, 120);

    return () => {
      window.clearTimeout(timer);
      mapa.remove();
      mapaRef.current = null;
    };
  }, [aberto, chavePet, deveExibirMapa, todosOsMarcadores]);

  /* Permite fechar o modal com a tecla Escape, seguindo boas práticas de acessibilidade. */
  useEffect(() => {
    if (!aberto) {
      return undefined;
    }

    function tratarTecla(evento) {
      if (evento.key === "Escape") {
        aoFechar();
      }
    }

    window.addEventListener("keydown", tratarTecla);

    return () => {
      window.removeEventListener("keydown", tratarTecla);
    };
  }, [aberto, aoFechar]);

  /* Impede que o conteúdo atrás do modal role enquanto ele estiver aberto. */
  useEffect(() => {
    if (!aberto) {
      return undefined;
    }

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto]);

  if (!aberto || !pet) {
    return null;
  }

  return (
    <div
      className="pet-modal-backdrop"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          aoFechar();
        }
      }}
    >
      <section
        className="pet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-modal-titulo"
      >
        {/* Cabeçalho do modal com o status do anúncio e o botão de fechamento. */}
        <header className="pet-modal-header">
          <div>
            <span className="pet-modal-eyebrow">
              {pet.tag || pet.status || "Informações do pet"}
            </span>
            <h2 id="pet-modal-titulo">{pet.nome || "Pet da comunidade"}</h2>
          </div>

          <button
            className="pet-modal-close"
            type="button"
            onClick={aoFechar}
            aria-label="Fechar informações do pet"
            title="Fechar"
          >
            ×
          </button>
        </header>

        {/* Imagem principal e informações completas cadastradas na publicação. */}
        <div className="pet-modal-content">
          <div className="pet-modal-main-info">
            <img
              className="pet-modal-image"
              src={pet.imagem}
              alt={`Foto de ${pet.nome || "pet"}`}
            />

            <div className="pet-modal-details">
              <p className="pet-modal-description">
                {pet.descricao || "Nenhuma descrição foi informada."}
              </p>

              <div className="pet-modal-meta" aria-label="Informações do pet">
                <span>🐾 Espécie: {pet.especie || "Não informada"}</span>
                <span>🧬 Raça: {pet.raca || "Não informada"}</span>
                <span>🎂 Idade: {pet.idade || "Não informada"}</span>
                <span>📍 Local: {pet.cidade || pet.local || "Não informado"}</span>
                {pet.autor && <span>👤 Publicado por: {pet.autor}</span>}
              </div>
            </div>
          </div>

          {/*
            Para animais perdidos, o mapa ocupa a área inferior do modal.
            Cada marcador corresponde a um ponto de avistamento recebido pela página.
          */}
          {deveExibirMapa && (
            <section className="pet-modal-map-section" aria-label="Mapa de avistamentos">
              <div className="pet-modal-map-heading">
                <div>
                  <span>📍 Localização comunitária</span>
                  <h3>Marcos de avistamento</h3>
                </div>
                <strong>
                  {todosOsMarcadores.length} {todosOsMarcadores.length === 1 ? "marco" : "marcos"}
                </strong>
              </div>

              <div ref={mapaElementoRef} className="pet-modal-map" />

              {/*
                Cartão de confirmação semelhante ao da página Mapa.
                Ele informa ao usuário qual ponto acabou de ser registrado.
              */}
              {localizacaoMarcada && (
                <div className="pet-modal-location-card" role="status">
                  <div className="pet-modal-location-icon" aria-hidden="true">
                    📍
                  </div>

                  <div className="pet-modal-location-copy">
                    <strong>Local de avistamento marcado</strong>
                    <span>
                      {formatarCoordenada(localizacaoMarcada.latitude)}, {" "}
                      {formatarCoordenada(localizacaoMarcada.longitude)}
                    </span>
                    <small>
                      Horário: {formatarHorarioAvistamento(localizacaoMarcada.horario)}
                    </small>
                  </div>
                </div>
              )}

              {/* Instrução visível para orientar a criação de um novo pin no mapa. */}
              <p className="pet-modal-map-instruction">
                Clique no mapa para marcar onde o pet foi avistado. O horário atual
                será registrado automaticamente.
              </p>

              {todosOsMarcadores.length === 0 && (
                <p className="pet-modal-map-empty">
                  Ainda não há coordenadas de avistamento registradas para este pet.
                </p>
              )}
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
