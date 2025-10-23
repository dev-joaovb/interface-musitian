import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiMoreVertical,
  FiPlay,
  FiEdit,
  FiTrash2,
  FiMusic,
} from "react-icons/fi";

export default function Biblioteca() {
  const [musicas, setMusicas] = useState([]);
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

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Biblioteca Musical</h1>
          <p className="text-gray-600">Gerencie seu acervo de músicas</p>
        </div>
        <button
  onClick={() => openModal()}
  disabled={userRole === "user"}
  className={`${
    userRole === "user"
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-teal-600 hover:bg-teal-700"
  } text-white px-4 py-2 rounded-lg flex items-center`}
>
  <FiPlus className="w-4 h-4 mr-2" />
  Adicionar Música
</button>
      </div>

      {/* Grid de músicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {musicas.map((music) => {
          // Se backend já manda URL completa, usa direto. Se não, concatena.
          const fileUrl =
            music.fileUrl?.startsWith("http")
              ? music.fileUrl
              : `http://localhost:4000${music.fileUrl || ""}`;

          return (
            <div
              key={music.id}
              className="music-card bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{music.title}</h3>
                  {/* <button className="text-gray-400 hover:text-gray-600">
                    <FiMoreVertical className="w-4 h-4" />
                  </button> */}
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Compositor: {music.artist}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{music.tipo || "MP3"}</span>
                  <span>
                    Adicionada:{" "}
                    {new Date(music.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                {/* 🎵 Player embutido */}
                {fileUrl && (
                  <div className="mt-4">
                    {music.tipo === "MP4" ? (
                      <video
                        controls
                        className="w-full rounded-lg border border-gray-200"
                      >
                        <source src={fileUrl} type="video/mp4" />
                        Seu navegador não suporta vídeo.
                      </video>
                    ) : (
                      <audio
                        controls
                        className="w-full rounded-lg "
                      >
                        <source src={fileUrl} type="audio/mpeg" />
                        Seu navegador não suporta áudio.
                      </audio>
                    )}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="border-t border-gray-100 flex">
                {/* <button className="w-1/3 py-3 bg-teal-50 text-teal-600 hover:bg-teal-100 flex items-center justify-center transition-colors">
                  <FiPlay className="w-4 h-4 mr-2" />
                  Reproduzir
                </button> */}
                <button
  onClick={() => openModal(music)}
  disabled={userRole === "user"}
  className={`w-1/2 py-3 flex items-center justify-center transition-colors rounded-bl-lg ${
    userRole === "user"
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
  }`}
>
  <FiEdit className="w-4 h-4 mr-2" />
  Editar
</button>

                <button
  onClick={() => handleDelete(music.id)}
  disabled={userRole === "user"}
  className={`w-1/2 py-3 flex items-center justify-center transition-colors rounded-br-lg ${
    userRole === "user"
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-red-50 text-red-600 hover:bg-red-100"
  }`}
>
  <FiTrash2 className="w-4 h-4 mr-2" />
  Excluir
</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && userRole !== "user" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingMusic ? "Editar Música" : "Adicionar Nova Música"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título da Música
                  </label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) =>
                      setForm({ ...form, titulo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compositor
                  </label>
                  <input
                    type="text"
                    value={form.compositor}
                    onChange={(e) =>
                      setForm({ ...form, compositor: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Arquivo
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="MP3">MP3</option>
                    <option value="MP4">MP4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload de Arquivo
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition">
                    <FiMusic className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Arraste e solte ou{" "}
                      <span className="text-teal-600 font-medium">clique</span>{" "}
                      para enviar
                    </span>
                    <input
                      type="file"
                      accept=".mp3,.mp4"
                      onChange={(e) =>
                        setForm({ ...form, arquivo: e.target.files[0] })
                      }
                      className="hidden"
                    />
                    {form.arquivo && (
                      <p className="mt-2 text-xs text-gray-600">
                        Arquivo selecionado:{" "}
                        <span className="font-medium">
                          {form.arquivo.name}
                        </span>
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
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
