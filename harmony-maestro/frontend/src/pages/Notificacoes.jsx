// src/pages/Notificacoes.jsx
import React, { useState } from "react";
import { Bell, Music, Users } from "lucide-react";

const Notificacoes = () => {
  // Mock notifications (depois será substituído por API)
  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      titulo: "Novo ensaio marcado",
      descricao: "07/10/2025 - 19h | Sala A",
      tipo: "ensaio",
      data: "07/10/2025",
    },
    {
      id: 2,
      titulo: 'Nova música adicionada: "Aurora"',
      descricao: "05/10/2025",
      tipo: "musica",
      data: "05/10/2025",
    },
    {
      id: 3,
      titulo: "Você foi escalado para o próximo ensaio",
      descricao: "14/10/2025",
      tipo: "escala",
      data: "14/10/2025",
    },
  ]);

  const getIcon = (tipo) => {
    switch (tipo) {
      case "ensaio":
        return <Bell className="text-teal-600 w-5 h-5 mr-3" />;
      case "musica":
        return <Music className="text-purple-600 w-5 h-5 mr-3" />;
      case "escala":
        return <Users className="text-blue-600 w-5 h-5 mr-3" />;
      default:
        return <Bell className="text-gray-500 w-5 h-5 mr-3" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notificações</h1>

      {notificacoes.length > 0 ? (
        <div className="space-y-4">
          {notificacoes.map((notif) => (
            <div
              key={notif.id}
              className="p-4 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              <div className="flex items-start">
                {getIcon(notif.tipo)}
                <div>
                  <p className="font-medium text-gray-800">{notif.titulo}</p>
                  <p className="text-sm text-gray-500">{notif.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Nenhuma notificação no momento.</p>
      )}
    </div>
  );
};

export default Notificacoes;
