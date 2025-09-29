import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiMusic,
  FiHome,
  FiCalendar,
  FiFileText,
  FiLayers,
  FiUsers,
  FiBell,
  FiSettings,
} from "react-icons/fi";

export default function Sidebar({ mobile = false, onClose }) {
  // se mobile=true, devolvemos um painel posicionado (fixed) para overlay
  const classes = mobile
    ? "md:hidden w-64 h-full bg-white border-r border-gray-200 fixed left-0 top-0"
    : "hidden md:flex";

  return (
    <aside className={classes}>
      <div className="flex flex-col w-64 h-full">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <FiMusic className="text-teal-600 w-6 h-6" />
            <span className="ml-2 text-xl font-bold text-gray-800">Harmony Maestro</span>
          </div>
        </div>

        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            <NavLink to="/" end className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FiHome className="w-4 h-4 mr-3" /> Dashboard
            </NavLink>

            <NavLink to="/calendar" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FiCalendar className="w-4 h-4 mr-3" /> Calendário
            </NavLink>

            <NavLink to="/biblioteca" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FiFileText className="w-4 h-4 mr-3" /> Biblioteca
            </NavLink>

            <NavLink to="/series" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FiLayers className="w-4 h-4 mr-3" /> Séries de Ensaio
            </NavLink>

            <NavLink to="/membros" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FiUsers className="w-4 h-4 mr-3" /> Membros
            </NavLink>

            <NavLink to="/notificacoes" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FiBell className="w-4 h-4 mr-3" /> Notificações
            </NavLink>

            <NavLink to="/configuracoes" className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <FiSettings className="w-4 h-4 mr-3" /> Configurações
            </NavLink>
          </nav>

          <div className="mt-auto">
            <div className="p-4 mt-4 bg-gray-100 rounded-lg">
              <div className="flex items-center">
                <img className="w-10 h-10 rounded-full" src="http://static.photos/people/200x200/1" alt="Carlos" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Carlos (Admin)</p>
                  <p className="text-xs text-gray-500">carlos@example.com</p>
                </div>
              </div>
              <button className="w-full mt-3 px-3 py-2 text-xs font-medium text-center text-white bg-teal-600 rounded-lg hover:bg-teal-700">
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobile && onClose ? (
        <button className="absolute top-3 right-3 text-gray-600" onClick={onClose}>✕</button>
      ) : null}
    </aside>
  );
}
