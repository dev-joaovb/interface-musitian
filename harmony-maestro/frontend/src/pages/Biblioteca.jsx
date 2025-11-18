import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiMoreVertical,
  FiPlay,
  FiEdit,
  FiTrash2,
  FiMusic,
  FiFolder,
} from "react-icons/fi";

export default function Biblioteca() {
  const [musicas, setMusicas] = useState([]);
  const [pastas, setPastas] = useState([]);
  const [novaPasta, setNovaPasta] = useState("");
  const [dragOver, setDragOver] = useState(null);
  const [pastaAberta, setPastaAberta] = useState(null);
  const [editarPastaData, setEditarPastaData] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingMusic, setEditingMusic] = useState(null);
  const [userRole, setUserRole] = useState("admin"); // padrão


  const [form, setForm] = useState({
    titulo: "",
    compositor: "",
    tipo: "MP3",
    arquivo: null,
  });

  // 🔹 Buscar músicas do backend
  useEffect(() => {
      const token = localStorage.getItem("userToken");

      async function carregarDados() {
        try {
          // 📦 Buscar músicas (autenticado)
          const musicasRes = await fetch("http://localhost:4000/api/biblioteca", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!musicasRes.ok) {
            console.error("Erro ao buscar músicas:", musicasRes.status, await musicasRes.text());
            setMusicas([]);
          } else {
            const musicasJson = await musicasRes.json();
            setMusicas(musicasJson);
          }

          // 📁 Buscar pastas
          const pastasRes = await fetch("http://localhost:4000/api/biblioteca/pastas", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (pastasRes.ok) {
            const pastasJson = await pastasRes.json();
            setPastas(pastasJson);
          }

          // 📦 Buscar perfil do usuário
          const perfilRes = await fetch("http://localhost:4000/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (perfilRes.ok) {
            const perfilJson = await perfilRes.json();
            setUserRole(perfilJson?.role ?? "admin");
          } else {
            console.warn("Não foi possível carregar o perfil do usuário:", perfilRes.status);
          }
        } catch (err) {
          console.error("Erro ao carregar dados:", err);
        }
      }

      // Chama a função (evita chamar sem token)
      if (token) carregarDados();
      else console.warn("Token ausente no localStorage: userToken");

      // 🔄 NOVO: Escuta mudanças de role (quando o user aceita ou sai do grupo)
      const handleUserUpdate = () => {
        console.log("🔁 Atualizando biblioteca após mudança de role...");
        carregarDados(); // Recarrega as músicas e perfil
      };

      window.addEventListener("userUpdated", handleUserUpdate);

      // 🔁 Limpa o listener quando o componente desmonta
      return () => {
        window.removeEventListener("userUpdated", handleUserUpdate);
      };
    }, []); // ← mantém o mesmo comportamento do seu useEffect original

  // Abrir modal
  const openModal = (music = null) => {
    if (music) {
      setEditingMusic(music);
      setForm({
        titulo: music.title,
        compositor: music.artist || "",
        tipo: "MP3",
        arquivo: null,
      });
    } else {
      setEditingMusic(null);
      setForm({
        titulo: "",
        compositor: "",
        tipo: "MP3",
        arquivo: null,
      });
    }
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingMusic(null);
    setForm({ titulo: "", compositor: "", tipo: "MP3", arquivo: null });
  };

  // Salvar música
  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formDataSend = new FormData();
    formDataSend.append("title", form.titulo);
    formDataSend.append("artist", form.compositor);
    formDataSend.append("tipo", form.tipo);
    if (form.arquivo) formDataSend.append("file", form.arquivo);

    try {
      let res;
      if (editingMusic) {
        res = await fetch(`http://localhost:4000/api/biblioteca/${editingMusic.id}`, {
          method: "PUT",
          body: formDataSend,
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await fetch("http://localhost:4000/api/biblioteca", {
          method: "POST",
          body: formDataSend,
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const newMusic = await res.json();

      if (editingMusic) {
        setMusicas((prev) =>
          prev.map((m) => (m.id === editingMusic.id ? newMusic : m))
        );
      } else {
        setMusicas((prev) => [...prev, newMusic]);
      }

      closeModal();
    } catch (err) {
      console.error("Erro ao salvar música:", err);
    }
  };

  // Excluir música
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:4000/api/biblioteca/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setMusicas((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Erro ao excluir música:", err);
    }
  };

  /// FOLDERS MANAGEMENT ///

  
  // 📁 Criar nova pasta
  const criarPasta = async (nome) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/biblioteca/pastas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: nome }),
      });

      if (res.ok) {
        const nova = await res.json();
        setPastas((prev) => [nova, ...prev]);

        // 🔁 Recarrega a página após criar com sucesso
        window.location.reload();
      } else {
        console.error("Erro ao criar pasta:", await res.text());
      }
    } catch (err) {
      console.error("Erro ao criar pasta:", err);
    }
  };


  // Drag and Drop
  const handleDragStart = (e, songId) => {
    e.dataTransfer.setData("songId", songId);
  };

  const handleDrop = async (e, folderId) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const songId = Number(e.dataTransfer.getData("songId"));
    const folder = Number(folderId);

    if (!songId || !folder) return;

    try {
      const res = await fetch(`http://localhost:4000/api/biblioteca/mover/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folderId: folder }),
      });

      if (!res.ok) {
        console.error("Erro ao mover música:", await res.text());
        return;
      }

      const moved = await res.json();

      // Remove da lista principal (músicas sem pasta)
      setMusicas((prev) => prev.filter((m) => m.id !== songId));

      // Adiciona dentro da pasta correta
      setPastas((prev) =>
        prev.map((p) =>
          p.id === folder
            ? { ...p, songs: [...p.songs, moved] }
            : p
        )
      );

    } catch (err) {
      console.error("Erro ao mover música:", err);
    }
  };


  // 🔄 Remover música da pasta (voltar para a raiz)
  const removerDaPasta = async (songId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:4000/api/biblioteca/mover/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folderId: null }), // ← volta a música para a raiz
      });

      if (!res.ok) {
        console.error("Erro ao remover música da pasta:", await res.text());
        return;
      }

      const updated = await res.json();

      // Remove da pasta atual
      setPastaAberta((prev) => ({
        ...prev,
        songs: prev.songs.filter((s) => s.id !== songId),
      }));

      // Adiciona na biblioteca principal
      setMusicas((prev) => [...prev, updated]);

    } catch (error) {
      console.error("Erro ao remover música:", error);
    }
  };


  // 🗑️ Excluir pasta (e tudo dentro)
  const excluirPasta = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta pasta e todas as músicas dentro dela?"
    );
    if (!confirmar) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:4000/api/biblioteca/pastas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPastas((prev) => prev.filter((p) => p.id !== id));

        // 🔁 Recarrega a página após exclusão
        window.location.reload();
      } else {
        console.error("Erro ao excluir pasta:", await res.text());
      }
    } catch (err) {
      console.error("Erro ao excluir pasta:", err);
    }
  };

  // ✏️ Editar pasta
  const editarPasta = async (id, novoNome) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:4000/api/biblioteca/pastas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: novoNome }),
      });

      if (res.ok) {
        const atualizado = await res.json();
        setPastas((prev) =>
          prev.map((p) => (p.id === id ? { ...p, name: atualizado.name } : p))
        );

        // Fecha modal
        setEditarPastaData(null);

        // Recarrega página
        window.location.reload();
      } else {
        console.error("Erro ao editar pasta:", await res.text());
      }
    } catch (err) {
      console.error("Erro ao editar pasta:", err);
    }
  };

  const openMusicInFolder = (music) => {
    openModal(music); 
  };

  const abrirPasta = async (folderId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:4000/api/biblioteca/pastas/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Erro ao abrir pasta:", await res.text());
        return;
      }

      const folder = await res.json();
      setPastaAberta(folder);
    } catch (error) {
      console.error("Erro ao abrir pasta:", error);
    }
  };



  return (
    <div className="p-4 md:p-6">

      {/* Botões de navegação entre Biblioteca e Partituras */}
      <div className="flex justify-center items-center mb-6 space-x-4">

        <button
          onClick={() => (window.location.href = "/biblioteca")}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold w-12 h-10 rounded-full flex items-center justify-center shadow-md transition"
          title="Biblioteca Musical"
        >
          &lt;
        </button>

        <button
          onClick={() => (window.location.href = "/partitura")}
          className="bg-teal-600 hover:bg-teal-700 text-white w-12 h-10 font-bold rounded-full flex items-center justify-center shadow-md transition"
          title="Partituras"
        >
          &gt;
        </button>
      </div>

      {/* HEADER */}
      <div className="flex justify-center items-center space-x-4 mb-10">

        {/* Parte superior — título + descrição */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Biblioteca Musical</h1>
        </div>

      </div>

      {/* Texto de apresentação — Admin */}
      {userRole === "admin" && (
        <div className="mb-10 max-w-3xl mx-auto text-center">
          <p className="text-gray-700 text-base leading-relaxed">
            Bem-vindo ao painel de gerenciamento da <strong>Biblioteca Musical</strong>.  
            Aqui você pode organizar todo o acervo, criando pastas, adicionando músicas,
            movendo arquivos e mantendo tudo sempre acessível e estruturado para a equipe
            e para os usuários.
          </p>
        </div>
      )}

      {/* Texto de apresentação — Usuário comum */}
      {userRole !== "admin" && (
        <div className="mb-10 max-w-3xl mx-auto text-center">
          <p className="text-gray-700 text-base leading-relaxed">
            Aqui você pode visualizar e acessar as músicas disponibilizadas na 
            <strong> Biblioteca Musical</strong>.  
            As pastas e arquivos são organizados pelos administradores para facilitar sua navegação e consulta.
          </p>
        </div>
      )}

      {/* CARD GERAL — envolve desde Gerencie seu acervo até Músicas sem pasta */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100 mb-10">

        {/* Admin */}
        {userRole === "admin" && (
          <div className="mb-10">

            {/* Parte superior — título + descrição */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Gerencie seu acervo de músicas</h1>
              
            </div>
            
          </div>
        )}

        {/* User */}
        {userRole === "user" && (
          <div className="mb-10">

            {/* Parte superior — título + descrição */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Acervo musical</h1>
              
            </div>
            
          </div>
        )}

        {/* BOTÕES SUPERIORES */}
        <div className="mb-10 flex flex-wrap gap-6">

          <button
            onClick={() => openModal()}
            disabled={userRole === "user"}
            className={`${
              userRole === "user"
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700"
            } text-white px-6 py-3 rounded-lg flex items-center text-base shadow`}
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Adicionar Música
          </button>

          {userRole === "admin" && (
            <>
              <button
                onClick={() => setNovaPasta(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center text-base shadow"
              >
                <FiPlus className="w-5 h-5 mr-2" /> Criar Pasta
              </button>

              {/* Modal de Nova Pasta */}
              {novaPasta && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 animate-fadeIn">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                      Criar Nova Pasta
                    </h2>

                    <input
                      type="text"
                      id="nomePasta"
                      placeholder="Digite o nome da pasta"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                    />

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setNovaPasta(false)}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700"
                      >
                        Cancelar
                      </button>

                      <button
                        onClick={() => {
                          const nome = document
                            .getElementById("nomePasta")
                            .value.trim();

                          if (nome) {
                            criarPasta(nome);
                            setNovaPasta(false);
                            window.location.reload();
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Criar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ✏️ Modal de Editar Pasta */}
              {editarPastaData && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 animate-fadeIn">

                    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                      Editar Pasta
                    </h2>

                    <input
                      type="text"
                      id="editarNomePasta"
                      defaultValue={editarPastaData.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                    />

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setEditarPastaData(null)}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700"
                      >
                        Cancelar
                      </button>

                      <button
                        onClick={() => {
                          const novoNome = document
                            .getElementById("editarNomePasta")
                            .value.trim();

                          if (novoNome) {
                            editarPasta(editarPastaData.id, novoNome);
                          }
                        }}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </div>

        <div>
          {/* 🔥 Breadcrumb — movido para baixo e mais destacado */}
          {pastaAberta && (
            <div className="mb-8 text-gray-700 flex items-center space-x-3 text-lg">
              <span
                className="cursor-pointer hover:text-teal-600 font-medium"
                onClick={() => setPastaAberta(null)}
              >
                Biblioteca
              </span>
              <span className="text-gray-500">›</span>
              <span className="font-semibold text-teal-700">{pastaAberta.name}</span>
            </div>
          )}
        </div>

        {/* 📁 Pastas */}
        {!pastaAberta && pastas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Pastas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pastas.map((p) => (
                <div
                  key={p.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(p.id);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => {
                    handleDrop(e, p.id);
                    setDragOver(null);
                    window.location.reload();
                  }}
                  className={`rounded-xl p-5 border shadow-sm transition-all flex flex-col h-full ${
                    dragOver === p.id
                      ? "bg-blue-50 border-blue-300 shadow-md"
                      : "bg-gray-50 border-gray-200 hover:shadow-md hover:border-gray-300"
                  }`}
                >
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {p.name}{" "}
                    <span className="text-gray-600 text-sm">
                      ({p.songs.length} {p.songs.length === 1 ? "música" : "músicas"})
                    </span>
                  </h3>

                  {p.songs.length === 0 ? (
                    <p className="text-sm text-gray-500">Sem músicas ainda</p>
                  ) : (
                    p.songs.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 bg-white rounded-md shadow-sm hover:shadow-md border border-gray-200 transition cursor-pointer flex items-center justify-between mb-3"
                        draggable={userRole === "admin"}
                        onDragStart={(e) => handleDragStart(e, s.id)}
                        onClick={() => abrirPasta(p.id)}
                      >
                        🎵 <span className="font-medium text-gray-700">{s.title}</span>
                      </div>
                    ))
                  )}

                  {userRole === "admin" && (
                    <div className="mt-auto flex justify-between pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setEditarPastaData({ id: p.id, name: p.name })}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <FiEdit className="mr-1" /> Editar
                      </button>
                      <button
                        onClick={() => excluirPasta(p.id)}
                        className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        <FiTrash2 className="mr-1" /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔥 Conteúdo da pasta aberta */}
        {pastaAberta && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">
              {pastaAberta.name} — {pastaAberta.songs.length} músicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastaAberta.songs.map((music) => (
                <div
                  key={music.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{music.title}</h3>
                      <p className="text-gray-500 text-sm">{music.artist}</p>
                    </div>

                    <div className="flex items-center space-x-3">

                      {/* ▶ Reproduzir */}
                      <button
                        onClick={() => new Audio(music.fileUrl).play()}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FiPlay size={20} />
                      </button>

                      {/* Editar */}
                      {userRole === "admin" && (
                        <button
                          onClick={() => openModal(music)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit size={20} />
                        </button>
                      )}

                      {/* Remover da pasta */}
                      {userRole === "admin" && (
                        <button
                          onClick={() => removerDaPasta(music.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <FiFolder size={20} />
                        </button>
                      )}

                      {/* Excluir */}
                      {userRole === "admin" && (
                        <button
                          onClick={() => {
                            if (window.confirm("Excluir esta música?")) {
                              handleDelete(music.id);
                              window.location.reload();
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  {music.fileUrl && (
                    <audio controls className="mt-4 w-full">
                      <source src={music.fileUrl} type="audio/mp3" />
                    </audio>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎵 Grid de músicas principais (somente se nenhuma pasta está aberta) */}
        {!pastaAberta && (
          <div className="mb-8">
            
            {/* 🔥 Título "Músicas sem pasta" */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Músicas sem pasta
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Você pode arrastar as músicas para as pastas que desejar, assim que criar uma.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {musicas.map((music) => {
                const fileUrl =
                  music.fileUrl?.startsWith("http")
                    ? music.fileUrl
                    : `http://localhost:4000${music.fileUrl || ""}`;

                return (
                  <div
                    key={music.id}
                    className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300 overflow-hidden cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => handleDragStart(e, music.id)}
                  >
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-800">{music.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        Compositor: {music.artist}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{music.tipo || "MP3"}</span>
                        <span>{new Date(music.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>

                      {fileUrl && (
                        <div className="mt-4">
                          {music.tipo === "MP4" ? (
                            <video controls className="w-full rounded-lg border border-gray-200">
                              <source src={fileUrl} type="video/mp4" />
                            </video>
                          ) : (
                            <audio controls className="w-full">
                              <source src={fileUrl} type="audio/mpeg" />
                            </audio>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="border-t border-gray-200 flex">
                      <button
                        onClick={() => openModal(music)}
                        disabled={userRole === "user"}
                        className={`w-1/2 py-3 flex items-center justify-center text-sm ${
                          userRole === "user"
                            ? "bg-gray-100 text-gray-400"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        <FiEdit className="w-4 h-4 mr-2" /> Editar
                      </button>

                      <button
                        onClick={() => handleDelete(music.id)}
                        disabled={userRole === "user"}
                        className={`w-1/2 py-3 flex items-center justify-center text-sm ${
                          userRole === "user"
                            ? "bg-gray-100 text-gray-400"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <FiTrash2 className="w-4 h-4 mr-2" /> Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>


      {/* Modal */}
      {showModal && userRole !== "user" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingMusic ? "Editar Música" : "Adicionar Nova Música"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium">Título</label>
                  <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>

                <div>
                  <label className="block text-sm font-medium">Compositor</label>
                  <input type="text" value={form.compositor} onChange={(e) => setForm({ ...form, compositor: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="MP3">MP3</option>
                    <option value="MP4">MP4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Arquivo</label>
                  <input type="file" accept=".mp3,.mp4" onChange={(e) => setForm({ ...form, arquivo: e.target.files[0] })} className="w-full" />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  {editingMusic ? "Salvar Alterações" : "Adicionar Música"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );

}
