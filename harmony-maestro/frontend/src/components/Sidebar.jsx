import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiMusic,
  FiHome,
  FiCalendar,
  FiFileText,
  FiLayers,
  FiUsers,
  FiBell,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

export default function Sidebar({ mobile = false, onClose }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || { name: "Usuário", email: "sememail@exemplo.com" };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");

    localStorage.removeItem("token");           // ✅ caso o login use esse nome
    localStorage.removeItem("userId");          // ✅ remove ID do usuário logado
    localStorage.removeItem("role");            // ✅ remove papel (user/admin)
    localStorage.removeItem("confirmedSeries"); // ✅ limpa bloqueios de presença

    navigate("/login");
  };

  const classes = mobile
    ? "md:hidden w-64 h-full bg-white border-r border-gray-200 fixed left-0 top-0"
    : "hidden md:flex";

  return (
    <aside className={classes}>
      <div className="flex flex-col w-64 h-full border-r-2 border-gray-200 bg-white">
        <div className="flex items-center justify-center h-14 px-4 border-b-1 border-gray-300">
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
                <img
                  className="w-10 h-10 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=14b8a6&color=fff`}
                  alt={user.name}
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-3 px-3 py-2 text-xs font-medium text-center text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
              >
                <FiLogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobile && onClose ? (
        <button className="absolute top-3 right-3 text-gray-600" onClick={onClose}>
          ✕
        </button>
      ) : null}
    </aside>
  );
}
