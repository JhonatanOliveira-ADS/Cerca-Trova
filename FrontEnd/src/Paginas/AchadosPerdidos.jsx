import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import L from "leaflet";  
import "leaflet/dist/leaflet.css";

import PetDetalhesModal from "../Componentes/PetDetalhesModal";
import "../assets/css/AchadosPerdidos.css";

const API_URL = "http://localhost:3333";
const MAPA_PADRAO = [-22.3145, -49.0606];


/* ==========================================
   HONRARIA DO USUÁRIO
========================================== */

function honrariaDoUsuario(pontos = 0) {
  const valor = Number(pontos) || 0;

  if (valor >= 1500) {
    return {
      nome: "Ouro",
      icone: "🥇",
      classe: "ouro",
    };
  }

  if (valor >= 500) {
    return {
      nome: "Prata",
      icone: "🥈",
      classe: "prata",
    };
  }

  if (valor >= 100) {
    return {
      nome: "Bronze",
      icone: "🥉",
      classe: "bronze",
    };
  }

  return {
    nome: "Explorador",
    icone: "🐾",
    classe: "explorador",
  };
}


/* ==========================================
   CONFIRMAÇÕES DO AVISTAMENTO
========================================== */

function resumoConfirmacoes(item) {
  const confirmacoes = Array.isArray(item?.confirmacoes)
    ? item.confirmacoes
    : [];

  const aindaAqui = confirmacoes.filter(
    (confirmacao) =>
      confirmacao.resposta === "AINDA_LA"
  ).length;

  const naoEsta = confirmacoes.filter(
    (confirmacao) =>
      confirmacao.resposta === "NAO_ESTA"
  ).length;

  const ultimaConfirmacao =
    confirmacoes[0]?.data_atualizacao || null;

  return {
    aindaAqui,
    naoEsta,
    ultimaConfirmacao,
  };
}


/* ==========================================
   CONFIANÇA DO MARCADOR
========================================== */

function classeConfianca(item) {
  const { aindaAqui, naoEsta } =
    resumoConfirmacoes(item);

  const dataCriacao = new Date(
    item?.data_criacao || Date.now()
  );

  const timestamp = Number.isNaN(
    dataCriacao.getTime()
  )
    ? Date.now()
    : dataCriacao.getTime();

  const minutos =
    (Date.now() - timestamp) / 60000;

  if (
    naoEsta > aindaAqui &&
    naoEsta >= 2
  ) {
    return "is-ausente";
  }

  if (aindaAqui > 0) {
    return "is-confirmado";
  }

  if (minutos > 120) {
    return "is-antigo";
  }

  return "is-recente";
}


/* ==========================================
   FORMATAÇÃO DE DATA
========================================== */

function formatarHorario(data) {
  if (!data) {
    return "agora";
  }

  const dataFormatada = new Date(data);

  if (
    Number.isNaN(dataFormatada.getTime())
  ) {
    return "agora";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(dataFormatada);
}


/* ==========================================
   COMPONENTE
========================================== */

export default function AchadosPerdidos() {

  /* ========================================
     REFERÊNCIAS
  ======================================== */

  const mapaElementoRef = useRef(null);
  const mapaRef = useRef(null);
  const camadaMarcadoresRef = useRef(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);


  /* ========================================
     ESTADOS
  ======================================== */

  const [
    avistamentos,
    setAvistamentos,
  ] = useState([]);

  const [
    selecionado,
    setSelecionado,
  ] = useState(null);

  const [
    modalAberto,
    setModalAberto,
  ] = useState(false);

  /* Controla o modal de informações aberto pela foto do pet selecionado no mapa. */
  const [petDetalhesModalAberto, setPetDetalhesModalAberto] = useState(false);

  const [
    cameraAberta,
    setCameraAberta,
  ] = useState(false);

  const [
    fotoBlob,
    setFotoBlob,
  ] = useState(null);

  const [
    fotoPreview,
    setFotoPreview,
  ] = useState("");

  const [
    localizacao,
    setLocalizacao,
  ] = useState(null);

  const [
    nomePet,
    setNomePet,
  ] = useState("");

  const [
    especie,
    setEspecie,
  ] = useState("Cachorro");

  const [
    descricao,
    setDescricao,
  ] = useState("");

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const [
    carregando,
    setCarregando,
  ] = useState(false);


  /* ========================================
     TOKEN
  ======================================== */

  const token = useMemo(() => {
    return (
      localStorage.getItem(
        "cercaTrovaToken"
      ) ||
      sessionStorage.getItem(
        "cercaTrovaToken"
      )
    );
  }, []);


  /* ========================================
     CARREGAR AVISTAMENTOS
  ======================================== */

  async function carregarAvistamentos() {
    try {
      const resposta = await fetch(
        `${API_URL}/ListarAvistamentos`
      );

      if (!resposta.ok) {
        throw new Error(
          "Falha ao carregar avistamentos"
        );
      }

      const dados =
        await resposta.json();

      const lista =
        Array.isArray(dados)
          ? dados
          : [];

      setAvistamentos(lista);

      setSelecionado((atual) => {
        if (!atual) {
          return atual;
        }

        return (
          lista.find(
            (item) =>
              item.id === atual.id
          ) || atual
        );
      });

    } catch (erro) {
      console.error(
        "Erro ao carregar avistamentos:",
        erro
      );

      setMensagem(
        "Não foi possível conectar ao servidor de avistamentos."
      );
    }
  }


  /* ========================================
     CARREGAMENTO INICIAL
  ======================================== */

  useEffect(() => {
    carregarAvistamentos();
  }, []);


  /* ========================================
     CRIAR MAPA LEAFLET
  ======================================== */

  useEffect(() => {
    if (
      !mapaElementoRef.current ||
      mapaRef.current
    ) {
      return;
    }

    const mapa = L.map(
      mapaElementoRef.current,
      {
        zoomControl: true,
        attributionControl: true,
      }
    );

    mapa.setView(
      MAPA_PADRAO,
      13
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,

        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    ).addTo(mapa);

    const camadaMarcadores =
      L.layerGroup();

    camadaMarcadores.addTo(mapa);

    mapaRef.current = mapa;

    camadaMarcadoresRef.current =
      camadaMarcadores;

    /*
      Corrige mapa cinza ou mapa
      carregando com tamanho incorreto.
    */

    const timer =
      window.setTimeout(() => {
        mapa.invalidateSize();
      }, 150);

    return () => {
      window.clearTimeout(timer);

      mapa.remove();

      mapaRef.current = null;

      camadaMarcadoresRef.current =
        null;
    };
  }, []);


  /* ========================================
     MARCADORES DO MAPA
  ======================================== */

  useEffect(() => {
    const mapa =
      mapaRef.current;

    const camada =
      camadaMarcadoresRef.current;

    if (!mapa || !camada) {
      return;
    }

    camada.clearLayers();

    const pontos = [];

    avistamentos.forEach(
      (item) => {

        const latitude =
          Number(item.latitude);

        const longitude =
          Number(item.longitude);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          return;
        }

        pontos.push([
          latitude,
          longitude,
        ]);

        const confianca =
          classeConfianca(item);

        const icone =
          L.divIcon({
            className:
              "pet-map-marker-shell",

            html: `
              <button
                class="pet-map-marker ${confianca}"
                type="button"
                aria-label="Abrir avistamento"
              >
                <span>🐾</span>
              </button>
            `,

            iconSize: [44, 44],
            iconAnchor: [22, 42],
          });

        const marcador =
          L.marker(
            [
              latitude,
              longitude,
            ],
            {
              icon: icone,
            }
          );

        marcador.on(
          "click",
          () => {
            setSelecionado(item);
          }
        );

        marcador.addTo(camada);
      }
    );

    if (pontos.length === 1) {
      mapa.setView(
        pontos[0],
        16
      );

      return;
    }

    if (pontos.length > 1) {
      const limites =
        L.latLngBounds(pontos);

      mapa.fitBounds(
        limites,
        {
          padding: [45, 45],
          maxZoom: 16,
        }
      );
    }

  }, [avistamentos]);


  /* ========================================
     GEOLOCALIZAÇÃO
  ======================================== */

  function obterLocalizacao() {
    setMensagem("");

    if (!navigator.geolocation) {
      setMensagem(
        "Seu navegador não oferece suporte à localização."
      );

      return;
    }

    navigator.geolocation
      .getCurrentPosition(

        ({ coords }) => {

          const novaLocalizacao = {
            latitude:
              coords.latitude,

            longitude:
              coords.longitude,
          };

          setLocalizacao(
            novaLocalizacao
          );

          mapaRef.current?.setView(
            [
              coords.latitude,
              coords.longitude,
            ],
            17
          );
        },

        () => {
          setMensagem(
            "Autorize o acesso à localização para registrar onde o pet foi visto."
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
  }


  /* ========================================
     ABRIR CÂMERA
  ======================================== */

  async function abrirCamera() {
    setMensagem("");

    try {

      if (
        !navigator.mediaDevices
          ?.getUserMedia
      ) {
        throw new Error(
          "camera_indisponivel"
        );
      }

      fecharCamera();

      const stream =
        await navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: {
                ideal:
                  "environment",
              },
            },

            audio: false,
          });

      streamRef.current =
        stream;

      setCameraAberta(true);

      window.setTimeout(
        () => {
          if (videoRef.current) {
            videoRef.current.srcObject =
              stream;
          }
        },
        0
      );

    } catch (erro) {

      console.error(
        "Erro ao abrir câmera:",
        erro
      );

      setMensagem(
        "Não foi possível abrir a câmera. Verifique a permissão do navegador."
      );
    }
  }


  /* ========================================
     FECHAR CÂMERA
  ======================================== */

  function fecharCamera() {

    streamRef.current
      ?.getTracks()
      .forEach(
        (track) =>
          track.stop()
      );

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraAberta(false);
  }


  /* ========================================
     TIRAR FOTO
  ======================================== */

  function tirarFoto() {

    const video =
      videoRef.current;

    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      setMensagem(
        "A câmera ainda está carregando. Tente novamente."
      );

      return;
    }

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const contexto =
      canvas.getContext("2d");

    if (!contexto) {
      setMensagem(
        "Não foi possível processar a foto."
      );

      return;
    }

    contexto.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {

        if (!blob) {
          setMensagem(
            "Não foi possível salvar a foto."
          );

          return;
        }

        if (fotoPreview) {
          URL.revokeObjectURL(
            fotoPreview
          );
        }

        setFotoBlob(blob);

        setFotoPreview(
          URL.createObjectURL(blob)
        );

        fecharCamera();
      },

      "image/jpeg",
      0.9
    );
  }


  /* ========================================
     ABRIR NOVO AVISTAMENTO
  ======================================== */

  function abrirNovoAvistamento() {

    setMensagem("");

    setSelecionado(null);

    setModalAberto(true);

    setLocalizacao(null);

    obterLocalizacao();
  }


  /* ========================================
     FECHAR MODAL
  ======================================== */

  function fecharModal() {

    fecharCamera();

    setModalAberto(false);
  }


  /* ========================================
     CONFIRMAR AVISTAMENTO
  ======================================== */

  async function confirmarAvistamento(
    respostaConfirmacao
  ) {

    setMensagem("");

    if (!token) {
      setMensagem(
        "Faça login para confirmar um avistamento."
      );

      return;
    }

    if (!selecionado?.id) {
      return;
    }

    try {

      const resposta =
        await fetch(
          `${API_URL}/ConfirmarAvistamento`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                id_avistamento:
                  selecionado.id,

                resposta:
                  respostaConfirmacao,
              }),
          }
        );

      const dados =
        await resposta.json();

      if (
        !resposta.ok ||
        dados?.error
      ) {
        throw new Error(
          dados?.error ||
          dados?.dados ||
          "Não foi possível confirmar."
        );
      }

      await carregarAvistamentos();

    } catch (erro) {

      setMensagem(
        erro.message ||
        "Erro ao registrar sua confirmação."
      );
    }
  }


  /* ========================================
     MARCAR PET COMO ENCONTRADO
  ======================================== */

  async function marcarComoAjudouEncontrar() {

    setMensagem("");

    if (!token) {

      setMensagem(
        "Faça login para confirmar que a marcação ajudou a encontrar o pet."
      );

      return;
    }

    if (!selecionado?.id) {
      return;
    }

    const confirmar =
      window.confirm(
        "Confirma que esta marcação realmente ajudou a encontrar o pet? O avistamento será encerrado e o autor receberá +50 Patas de Honra."
      );

    if (!confirmar) {
      return;
    }

    try {

      const resposta =
        await fetch(
          `${API_URL}/AvistamentoAjudou`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                id_avistamento:
                  selecionado.id,
              }),
          }
        );

      const dados =
        await resposta.json();

      if (
        !resposta.ok ||
        dados?.error
      ) {
        throw new Error(
          dados?.error ||
          dados?.dados ||
          "Não foi possível encerrar o avistamento."
        );
      }

      setMensagem(
        dados.mensagem ||
        "Pet encontrado! A marcação foi encerrada."
      );

      setSelecionado(null);

      await carregarAvistamentos();

    } catch (erro) {

      setMensagem(
        erro.message ||
        "Erro ao registrar o pet encontrado."
      );
    }
  }


  /* ========================================
     PUBLICAR AVISTAMENTO
  ======================================== */

  async function salvarAvistamento(
    event
  ) {

    event.preventDefault();

    setMensagem("");

    if (!token) {

      setMensagem(
        "Faça login para publicar um avistamento."
      );

      return;
    }

    if (!fotoBlob) {

      setMensagem(
        "Tire uma foto do pet usando a câmera."
      );

      return;
    }

    if (!localizacao) {

      setMensagem(
        "Precisamos da sua localização atual para criar o marcador."
      );

      return;
    }

    setCarregando(true);

    try {

      const formulario =
        new FormData();

      formulario.append(
        "file",
        fotoBlob,
        `avistamento-${Date.now()}.jpg`
      );

      formulario.append(
        "nome_pet",
        nomePet ||
          "Pet avistado"
      );

      formulario.append(
        "especie",
        especie
      );

      formulario.append(
        "descricao",
        descricao
      );

      formulario.append(
        "latitude",
        String(
          localizacao.latitude
        )
      );

      formulario.append(
        "longitude",
        String(
          localizacao.longitude
        )
      );

      const resposta =
        await fetch(
          `${API_URL}/CriarAvistamento`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: formulario,
          }
        );

      const dados =
        await resposta.json();

      if (
        !resposta.ok ||
        dados?.error
      ) {

        throw new Error(
          dados?.error ||
          dados?.dados ||
          "Não foi possível publicar."
        );
      }

      setAvistamentos(
        (lista) => [
          dados,
          ...lista,
        ]
      );

      setNomePet("");

      setEspecie("Cachorro");

      setDescricao("");

      setFotoBlob(null);

      if (fotoPreview) {
        URL.revokeObjectURL(
          fotoPreview
        );
      }

      setFotoPreview("");

      setModalAberto(false);

      setSelecionado(dados);

    } catch (erro) {

      setMensagem(
        erro.message ||
        "Erro ao publicar o avistamento."
      );

    } finally {

      setCarregando(false);
    }
  }


  /* ========================================
     LIMPEZA DA CÂMERA E PREVIEW
  ======================================== */

  useEffect(() => {

    return () => {

      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        );
    };

  }, []);


  /* ========================================
     INTERFACE
  ======================================== */

  /*
    Adapta o registro do backend ao formato comum do modal.
    A lista completa de avistamentos alimenta os marcadores do mapa interno.
  */
  const petSelecionadoParaModal = selecionado
    ? {
        id: selecionado.id,
        nome: selecionado.nome_pet || "Pet avistado",
        especie: selecionado.especie || "Pet",
        descricao: selecionado.descricao || "Sem observações adicionais.",
        imagem: `${API_URL}/files/${encodeURIComponent(
          selecionado.foto || "",
        )}`,
        tag: "Perdido",
        status: "Perdido",
        cidade: selecionado.local || "Localização registrada no mapa",
        autor: selecionado.usuario?.nome || "Usuário Cerca Trova",
        latitude: selecionado.latitude,
        longitude: selecionado.longitude,
      }
    : null;

  return (

    <main className="achados-page">

      {/* ==================================
          CABEÇALHO
      ================================== */}

      <section className="achados-hero">

        <div>

          <span className="achados-kicker">
            🐾 Mapa colaborativo
          </span>

          <h1>
            Achados e Perdidos
          </h1>

          <p>
            Viu um animal perdido?
            Marque o local na hora e
            ajude a comunidade a
            encontrá-lo.
          </p>

        </div>


        <button
          className="btn-avistamento"
          type="button"
          onClick={
            abrirNovoAvistamento
          }
        >
          + Vi um pet aqui
        </button>

      </section>


      {/* ==================================
          MENSAGEM
      ================================== */}

      {mensagem && (

        <div className="achados-alerta">
          {mensagem}
        </div>

      )}


      {/* ==================================
          MAPA + DETALHES
      ================================== */}

      <section className="mapa-layout">

        <div className="mapa-card">

          <div
            ref={mapaElementoRef}
            className="mapa-pets"
            aria-label="Mapa de pets avistados"
          />

          <div className="mapa-legenda">

            <strong>
              {avistamentos.length}
            </strong>

            <span>
              {avistamentos.length === 1
                ? "avistamento ativo"
                : "avistamentos ativos"}
            </span>

          </div>

        </div>


        {/* =================================
            DETALHES DO PET
        ================================= */}

        <aside className="avistamento-detalhe">

          {selecionado ? (

            <>

              {/* A foto do painel abre uma visão ampliada com todos os dados e o mapa. */}
              <button
                className="detalhe-foto-button"
                type="button"
                onClick={() => setPetDetalhesModalAberto(true)}
                aria-label={`Ver informações completas de ${
                  selecionado.nome_pet || "pet avistado"
                }`}
              >
                <img
                  className="detalhe-foto"
                  src={
                    `${API_URL}/files/${encodeURIComponent(
                      selecionado.foto || ""
                    )}`
                  }
                  alt={
                    selecionado.nome_pet ||
                    "Pet avistado"
                  }
                />
              </button>


              <div className="detalhe-conteudo">

                <span className="detalhe-status">
                  AVISTAMENTO RECENTE
                </span>

                <h2>
                  {selecionado.nome_pet ||
                    "Pet avistado"}
                </h2>

                <p>
                  {selecionado.descricao ||
                    "Sem observações adicionais."}
                </p>


                <div className="detalhe-meta">

                  <span>
                    🕒 Publicado{" "}
                    {formatarHorario(
                      selecionado.data_criacao
                    )}
                  </span>

                  <span>
                    🐾{" "}
                    {selecionado.especie ||
                      "Pet"}
                  </span>

                  {resumoConfirmacoes(
                    selecionado
                  ).ultimaConfirmacao && (

                    <span>
                      📡 Confirmado{" "}
                      {formatarHorario(
                        resumoConfirmacoes(
                          selecionado
                        )
                          .ultimaConfirmacao
                      )}
                    </span>

                  )}

                </div>


                {/* =========================
                    CONFIRMAÇÃO
                ========================= */}

                <div className="confirmacao-waze">

                  <div className="confirmacao-resumo">

                    <strong>
                      O pet ainda está neste local?
                    </strong>

                    <small>
                      Ajude a manter o mapa
                      atualizado como no Waze.
                    </small>

                  </div>


                  <div className="confirmacao-contadores">

                    <span className="contador-sim">
                      ✅{" "}
                      {
                        resumoConfirmacoes(
                          selecionado
                        ).aindaAqui
                      }{" "}
                      ainda aqui
                    </span>

                    <span className="contador-nao">
                      ❌{" "}
                      {
                        resumoConfirmacoes(
                          selecionado
                        ).naoEsta
                      }{" "}
                      não está
                    </span>

                  </div>


                  <div className="confirmacao-acoes">

                    <button
                      type="button"
                      onClick={() =>
                        confirmarAvistamento(
                          "AINDA_LA"
                        )
                      }
                    >
                      ✅ Ainda está aqui
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        confirmarAvistamento(
                          "NAO_ESTA"
                        )
                      }
                    >
                      ❌ Não está mais
                    </button>

                  </div>

                </div>


                {/* =========================
                    AUTOR
                ========================= */}

                <div className="publicado-por">

                  <div className="avatar-publicador">

                    {selecionado.usuario
                      ?.foto_perfil ? (

                      <img
                        src={
                          `${API_URL}/files/${encodeURIComponent(
                            selecionado
                              .usuario
                              .foto_perfil
                          )}`
                        }
                        alt=""
                      />

                    ) : (

                      "👤"

                    )}

                  </div>


                  <div className="autor-info">

                    <small>
                      Publicado por
                    </small>

                    <strong>
                      {selecionado.usuario
                        ?.nome ||
                        "Usuário Cerca Trova"}
                    </strong>


                    <div
                      className={
                        `honraria-badge ${
                          honrariaDoUsuario(
                            selecionado
                              .usuario
                              ?.pontos_honra
                          ).classe
                        }`
                      }
                    >

                      <span>
                        {
                          honrariaDoUsuario(
                            selecionado
                              .usuario
                              ?.pontos_honra
                          ).icone
                        }
                      </span>

                      <b>
                        {
                          honrariaDoUsuario(
                            selecionado
                              .usuario
                              ?.pontos_honra
                          ).nome
                        }
                      </b>

                      <em>
                        {selecionado.usuario
                          ?.pontos_honra ||
                          0}{" "}
                        Patas de Honra
                      </em>

                    </div>


                    {!!selecionado.usuario
                      ?.pets_ajudados && (

                      <small className="pets-ajudados">
                        ❤️{" "}
                        {
                          selecionado
                            .usuario
                            .pets_ajudados
                        }{" "}
                        pet(s) encontrado(s)
                        com sua ajuda
                      </small>

                    )}

                  </div>

                </div>


                <button
                  className="btn-pet-encontrado"
                  type="button"
                  onClick={
                    marcarComoAjudouEncontrar
                  }
                >
                  ❤️ Esta marcação ajudou
                  a encontrar o pet
                </button>


                <div className="avistamento-contato-acoes">

                  {selecionado.usuario?.id ? (

                    <>
                      <Link
                        className="btn-ver-perfil"
                        to={
                          `/perfil-publico/${selecionado.usuario.id}`
                        }
                      >
                        👤 Ver perfil
                      </Link>

                      <Link
                        className="btn-chat-futuro"
                        to={
                          `/chat?usuario=${selecionado.usuario.id}`
                        }
                      >
                        💬 Chamar no bate-papo
                      </Link>
                    </>

                  ) : (

                    <span>
                      Usuário não disponível
                    </span>

                  )}

                </div>

              </div>

            </>

          ) : (

            <div className="detalhe-vazio">

              <span>
                🐕
              </span>

              <h2>
                Selecione uma marcação
              </h2>

              <p>
                Toque em uma patinha no
                mapa para ver foto,
                horário e quem publicou.
              </p>

            </div>

          )}

        </aside>

      </section>


      {/*
        Modal aberto pela foto do pet selecionado.
        Os avistamentos existentes são enviados para formar os marcos no mapa.
      */}
      <PetDetalhesModal
        pet={petSelecionadoParaModal}
        aberto={petDetalhesModalAberto}
        aoFechar={() => setPetDetalhesModalAberto(false)}
        mapaAvistamentos={avistamentos}
      />


      {/* ==================================
          MODAL
      ================================== */}

      {modalAberto && (

        <div
          className="avistamento-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              fecharModal();
            }

          }}
        >

          <section
            className="avistamento-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Novo avistamento"
          >

            <div className="modal-topo">

              <div>

                <span>
                  Novo marcador
                </span>

                <h2>
                  Vi um pet aqui
                </h2>

              </div>


              <button
                type="button"
                className="modal-fechar"
                onClick={
                  fecharModal
                }
                aria-label="Fechar"
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                salvarAvistamento
              }
            >

              {/* ===========================
                  CÂMERA
              =========================== */}

              <div className="camera-area">

                {cameraAberta ? (

                  <>

                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-video"
                    />

                    <button
                      type="button"
                      className="camera-capturar"
                      onClick={
                        tirarFoto
                      }
                    >
                      📸 Tirar foto
                    </button>

                  </>

                ) : fotoPreview ? (

                  <div className="foto-preview-wrap">

                    <img
                      src={
                        fotoPreview
                      }
                      alt="Foto tirada agora"
                      className="foto-preview"
                    />

                    <button
                      type="button"
                      onClick={
                        abrirCamera
                      }
                    >
                      Tirar outra foto
                    </button>

                  </div>

                ) : (

                  <button
                    type="button"
                    className="abrir-camera"
                    onClick={
                      abrirCamera
                    }
                  >

                    <span>
                      📷
                    </span>

                    <strong>
                      Abrir câmera
                    </strong>

                    <small>
                      A foto deve ser
                      tirada agora. Não
                      usamos a biblioteca
                      do aparelho.
                    </small>

                  </button>

                )}

              </div>


              {/* ===========================
                  FORMULÁRIO
              =========================== */}

              <div className="form-grid-avistamento">

                <label>

                  Nome ou identificação

                  <input
                    value={
                      nomePet
                    }
                    onChange={
                      (event) =>
                        setNomePet(
                          event.target.value
                        )
                    }
                    placeholder="Ex.: Caramelo com coleira azul"
                  />

                </label>


                <label>

                  Espécie

                  <select
                    value={
                      especie
                    }
                    onChange={
                      (event) =>
                        setEspecie(
                          event.target.value
                        )
                    }
                  >

                    <option>
                      Cachorro
                    </option>

                    <option>
                      Gato
                    </option>

                    <option>
                      Outro
                    </option>

                  </select>

                </label>


                <label className="campo-descricao">

                  O que você observou?

                  <textarea
                    value={
                      descricao
                    }
                    onChange={
                      (event) =>
                        setDescricao(
                          event.target.value
                        )
                    }
                    placeholder="Ex.: Está assustado, caminhando próximo à praça..."
                    rows="3"
                  />

                </label>

              </div>


              {/* ===========================
                  LOCALIZAÇÃO
              =========================== */}

              <div
                className={
                  `localizacao-status ${
                    localizacao
                      ? "ok"
                      : ""
                  }`
                }
              >

                <span>
                  {localizacao
                    ? "✅"
                    : "📍"}
                </span>


                <div>

                  <strong>
                    {localizacao
                      ? "Localização capturada"
                      : "Obtendo localização..."}
                  </strong>

                  <small>
                    {localizacao
                      ? "O marcador será criado no local em que você está agora."
                      : "Autorize o GPS do aparelho."}
                  </small>

                </div>


                {!localizacao && (

                  <button
                    type="button"
                    onClick={
                      obterLocalizacao
                    }
                  >
                    Tentar novamente
                  </button>

                )}

              </div>


              {/* ===========================
                  PUBLICAR
              =========================== */}

              <button
                className="publicar-avistamento"
                type="submit"
                disabled={
                  carregando
                }
              >

                {carregando
                  ? "Publicando..."
                  : "Publicar no mapa"}

              </button>

            </form>

          </section>

        </div>

      )}

    </main>
  );
}
