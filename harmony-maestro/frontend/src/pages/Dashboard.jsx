import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiUsers,
  FiFileText,
  FiChevronRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:4000/api/dashboard").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) return <p>Carregando...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Visão geral dos seus ensaios e atividades</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600">
              <FiCalendar className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Próximo Ensaio</p>
              <p className="text-xl font-semibold text-gray-800">
                {data.stats.nextEvent
                  ? new Date(data.stats.nextEvent.date).toLocaleDateString("pt-BR")
                  : "Nenhum agendado"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiUsers className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Membros Ativos</p>
              <p className="text-xl font-semibold text-gray-800">
                {data.stats.activeMembers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiFileText className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Músicas no Acervo
              </p>
              <p className="text-xl font-semibold text-gray-800">
                {data.stats.songsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos Ensaios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Próximos Ensaios</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.upcomingEvents.map((event) => (
            <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString("pt-BR")} -{" "}
                    {new Date(event.date).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    | {event.location}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
                    {event.status}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

            <div className="px-6 py-3 border-t border-gray-200 text-center">
                <Link
                    to="/series"
                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                    Ver todos os ensaios
                </Link>
            </div>
        </div>
      

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link
          to="/series"
          className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <FiPlus className="w-5 h-5 text-teal-600 mr-2" />
          <span className="font-medium text-gray-700">Novo Ensaio</span>
        </Link>

        <Link
          to="/biblioteca"
          className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <FiUpload className="w-5 h-5 text-teal-600 mr-2" />
          <span className="font-medium text-gray-700">Upload de Música</span>
        </Link>

        <Link
          to="/series"
          className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <FiLayers className="w-5 h-5 text-teal-600 mr-2" />
          <span className="font-medium text-gray-700">Nova Série</span>
        </Link>

        <Link
          to="/membros"
          className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <FiUserPlus className="w-5 h-5 text-teal-600 mr-2" />
          <span className="font-medium text-gray-700">Adicionar Membro</span>
        </Link>
      </div>


      {/* Atividades Recentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Atividade Recente</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.recentActivities.map((a) => (
            <div key={a.id} className="p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">
                    {a.user?.name?.[0] ?? "?"}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-800">{a.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
