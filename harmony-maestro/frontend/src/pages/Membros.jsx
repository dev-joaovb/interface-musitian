// src/pages/Membros.jsx
import React, { useState } from "react";
import { Edit, Zap, Plus } from "lucide-react";

const Membros = () => {
  // Mock para simular dados vindos do backend futuramente
  const [membros, setMembros] = useState([
    {
      id: 1,
      nome: "João Alves",
      email: "joao@example.com",
      papel: "Administrador",
      instrumento: "Guitarra",
      disponibilidade: 80,
      status: "online",
      avatar: "http://static.photos/people/200x200/2",
    },
    {
      id: 2,
      nome: "Maria Santos",
      email: "maria@example.com",
      papel: "Convidado",
      instrumento: "Voz",
      disponibilidade: 60,
      status: "ausente",
      avatar: "http://static.photos/people/200x200/3",
    },
    {
      id: 3,
      nome: "Pedro Costa",
      email: "pedro@example.com",
      papel: "Convidado",
      instrumento: "Bateria",
      disponibilidade: 40,
      status: "offline",
      avatar: "http://static.photos/people/200x200/4",
    },
    {
      id: 4,
      nome: "Ana Lima",
      email: "ana@example.com",
      papel: "Administrador",
      instrumento: "Teclado",
      disponibilidade: 90,
      status: "online",
      avatar: "http://static.photos/people/200x200/5",
    },
  ]);

  const getBadgeColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "ausente":
        return "bg-yellow-400";
      case "offline":
        return "bg-red-400";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      {/* Cabeçalho */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Membros</h1>
          <p className="text-gray-600">
            Gerencie os membros do seu grupo musical
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Auto-assign
          </button>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Membro
          </button>
        </div>
      </div>

      {/* Grid de Membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {membros.map((membro) => (
          <div
            key={membro.id}
            className="member-card bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <img
                className="w-16 h-16 rounded-full"
                src={membro.avatar}
                alt={membro.nome}
              />
              <span
                className={`availability-badge ${getBadgeColor(
                  membro.status
                )} w-3 h-3 rounded-full`}
              ></span>
            </div>
            <h3 className="font-semibold text-gray-800">{membro.nome}</h3>
            <p className="text-sm text-gray-500 mb-2">{membro.instrumento}</p>
            <p className="text-xs text-gray-400 mb-4">{membro.email}</p>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Disponibilidade: {membro.disponibilidade}%
              </span>
              <button className="text-teal-600 hover:text-teal-700">
                <Edit className="w-4 h-4" />
              </button>
            </div>

            {/* Distinção entre Admin e Convidado */}
            <div className="mt-3">
              {membro.papel === "Administrador" ? (
                <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                  Administrador
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Convidado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Membros;
