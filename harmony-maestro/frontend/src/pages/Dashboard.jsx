import React from "react";
import {
  FiCalendar,
  FiUsers,
  FiFileText,
  FiChevronRight,
  FiPlus,
  FiUpload,
  FiLayers,
  FiUserPlus,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Visão geral dos seus ensaios e atividades
        </p>
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
              <p className="text-xl font-semibold text-gray-800">07/10/2025</p>
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
              <p className="text-xl font-semibold text-gray-800">12</p>
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
              <p className="text-xl font-semibold text-gray-800">47</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Rehearsals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Próximos Ensaios
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Lua Nova</h3>
                <p className="text-sm text-gray-500">
                  07/10/2025 - 19:00 | Sala A
                </p>
              </div>
              <div className="flex space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
                  Escalado
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Noite em C</h3>
                <p className="text-sm text-gray-500">
                  14/10/2025 - 19:00 | Sala B
                </p>
              </div>
              <div className="flex space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pendente
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Aurora</h3>
                <p className="text-sm text-gray-500">
                  21/10/2025 - 19:00 | Sala A
                </p>
              </div>
              <div className="flex space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  Não escalado
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Atividade Recente
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-start">
              <img
                className="w-10 h-10 rounded-full"
                src="http://static.photos/people/200x200/2"
                alt="Mariana"
              />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">
                  Mariana adicionou uma nova música
                </p>
                <p className="text-sm text-gray-500">
                  "Aurora" - 05/10/2025
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start">
              <img
                className="w-10 h-10 rounded-full"
                src="http://static.photos/people/200x200/3"
                alt="João"
              />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">
                  João confirmou presença no ensaio
                </p>
                <p className="text-sm text-gray-500">
                  "Lua Nova" - 07/10/2025
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start">
              <img
                className="w-10 h-10 rounded-full"
                src="http://static.photos/people/200x200/1"
                alt="Carlos"
              />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">
                  Você criou uma nova série de ensaios
                </p>
                <p className="text-sm text-gray-500">
                  "Concerto de Dez/2025" - 03/10/2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
