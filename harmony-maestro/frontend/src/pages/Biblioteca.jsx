import React, { useState } from "react";
import {
  FiPlus,
  FiMoreVertical,
  FiPlay,
  FiEdit,
  FiTrash2,
  FiMusic,
} from "react-icons/fi";

export default function Biblioteca() {
  const [musicas, setMusicas] = useState([
    {
      id: 1,
      titulo: "Lua Nova",
      compositor: "João Silva",
      tipo: "MP3",
      duracao: "3:45",
      adicionada: "05/10/2025",
    },
    {
      id: 2,
      titulo: "Aurora",
      compositor: "Maria Santos",
      tipo: "MP3",
      duracao: "4:20",
      adicionada: "03/10/2025",
    },
    {
      id: 3,
      titulo: "Noite em C",
      compositor: "Pedro Costa",
      tipo: "MP3",
      duracao: "5:15",
      adicionada: "01/10/2025",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingMusic, setEditingMusic] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    compositor: "",
    tipo: "MP3",
    arquivo: null,
  });

  // Abrir modal
  const openModal = (music = null) => {
    if (music) {
      setEditingMusic(music);
      setForm({
        titulo: music.titulo,
        compositor: music.compositor,
        tipo: music.tipo,
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
    setForm({
      titulo: "",
      compositor: "",
      tipo: "MP3",
      arquivo: null,
    });
  };

  // Salvar música (nova ou editada)
  const handleSave = (e) => {
    e.preventDefault();
    if (editingMusic) {
      setMusicas((prev) =>
        prev.map((m) =>
          m.id === editingMusic.id ? { ...m, ...form } : m
        )
      );
    } else {
      const newMusic = {
        id: Date.now(),
        titulo: form.titulo,
        compositor: form.compositor,
        tipo: form.tipo,
        duracao: "3:00",
        adicionada: new Date().toLocaleDateString("pt-BR"),
      };
      setMusicas((prev) => [...prev, newMusic]);
    }
    closeModal();
  };

  // Excluir música
  const handleDelete = (id) => {
    setMusicas((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Biblioteca Musical</h1>
          <p className="text-gray-600">Gerencie seu acervo de músicas</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Adicionar Música
        </button>
      </div>

      {/* Grid de músicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {musicas.map((music) => (
          <div
            key={music.id}
            className="music-card bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{music.titulo}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <FiMoreVertical className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Compositor: {music.compositor}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {music.tipo} • {music.duracao}
                </span>
                <span>Adicionada: {music.adicionada}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 flex">
              <button className="w-1/3 py-3 bg-teal-50 text-teal-600 hover:bg-teal-100 flex items-center justify-center transition-colors">
                <FiPlay className="w-4 h-4 mr-2" />
                Reproduzir
              </button>
              <button
                onClick={() => openModal(music)}
                className="w-1/3 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
              >
                <FiEdit className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(music.id)}
                className="w-1/3 py-3 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
              >
                <FiTrash2 className="w-4 h-4 mr-2" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
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
  <label
    className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 
               border-2 border-dashed border-gray-300 rounded-lg cursor-pointer 
               hover:border-teal-500 hover:bg-teal-50 transition"
  >
    <FiMusic className="w-8 h-8 text-gray-400 mb-2" />
    <span className="text-sm text-gray-500">
      Arraste e solte ou <span className="text-teal-600 font-medium">clique</span> para enviar
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
        Arquivo selecionado: <span className="font-medium">{form.arquivo.name}</span>
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
