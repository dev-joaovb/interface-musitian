// src/pages/Series.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, Music, Edit, Zap, Plus } from "lucide-react";

const Series = ({ upcomingEvents = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fechar modal com tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Séries de Ensaio</h1>
          <p className="text-gray-600">
            Gerencie suas séries de ensaios programados
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto-assign
          </button>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nova Série
          </button>
        </div>
      </div>

      {/* Lista de Séries */}
      <div className="space-y-4 mb-8">
        {/* Card exemplo fixo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Concerto de Dezembro 2025
            </h3>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Data Início</p>
              <p className="text-gray-800">01/12/2025</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Data Fim</p>
              <p className="text-gray-800">15/12/2025</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ensaio</p>
              <p className="text-gray-800">Segundas e Quartas, 19h</p>
            </div>
          </div>

          {/* Datas */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Datas dos Ensaios
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded text-center">
                01/12
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded text-center">
                03/12
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded text-center">
                08/12
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded text-center">
                10/12
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded text-center">
                15/12
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded text-center">
                +2
              </span>
            </div>
          </div>

          {/* Rodapé */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">12 membros escalados</span>
              <span className="text-sm text-gray-600">5 músicas</span>
            </div>
            <button className="text-teal-600 hover:text-teal-700 flex items-center">
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Próximos eventos do calendário */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Próximos Ensaios do Calendário
          </h2>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map((event, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.start).toLocaleDateString("pt-BR")}{" "}
                    {event.start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded">
                  Calendário
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Auto-Assign */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Auto-assign de Membros
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Série
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>Concerto de Dezembro 2025</option>
                  <option>Festival de Verão 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regra de Descanso
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Membros terão pelo menos 1 dia de descanso entre ensaios
                    consecutivos. A escala priorizará membros com menor número
                    de ensaios recentes.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pré-visualização
                </label>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        01/12 - Ensaio 1
                      </span>
                      <span className="text-sm text-gray-600">
                        8 membros escalados
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        03/12 - Ensaio 2
                      </span>
                      <span className="text-sm text-gray-600">
                        8 membros escalados
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Series;
