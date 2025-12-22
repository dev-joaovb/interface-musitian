import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LinkWithReload from '../layouts/LinkWithReload.jsx';
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
  FiList,
  FiRefreshCw,
} from "react-icons/fi";

export default function Sidebar({ mobile = false, onClose }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || { name: "Usuário", email: "sememail@exemplo.com" };
  const profileImageSrc = user.profilePicture 
  ? `http://localhost:4000${user.profilePicture}` // ⚠️ Ajuste a URL base do seu servidor
  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=14b8a6&color=fff`; // Fallback para avatar gerado


  const LOADER_DURATION_MS = 400;

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");

    localStorage.removeItem("token");           // ✅ caso o login use esse nome
    localStorage.removeItem("userId");          // ✅ remove ID do usuário logado
    localStorage.removeItem("role");            // ✅ remove papel (user/admin)
    localStorage.removeItem("confirmedSeries"); // ✅ limpa bloqueios de presença

    //navigate("/login");
    setTimeout(() => {
        // Redireciona para /login forçando o reload (F5)
        window.location.href = "/login";
    }, LOADER_DURATION_MS);
  };

  const isActiveLink = (path) => window.location.pathname === path;

    // Classe base para o link (mantida a sua estrutura)
    const baseClasses = "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200";

    // Classes de estado (ativos vs. inativos)
    const activeClasses = 'bg-teal-600 text-white';
    const inactiveClasses = 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';

  const classes = mobile
    ? "md:hidden w-64 h-full bg-white border-r border-gray-200 fixed left-0 top-0"
    : "hidden md:flex";

  return (
  <aside className={classes}>
    <div className="flex flex-col w-64 h-full border-r-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-center h-30 px-4 border-b-1 border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {/* Logo Light */}
          <img
            src="/logo-light.svg"
            alt="Harmony Maestro"
            className="h-25 w-auto block dark:hidden"
          />

          {/* Logo Dark */}
          <img
            src="/logo-dark.svg"
            alt="Harmony Maestro"
            className="h-25 w-auto hidden dark:block"
          />
        </div>
      </div>

      <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
        <nav className="flex-1 space-y-2">

            {/* NavItem: Dashboard */}
            <LinkWithReload
                to="/"
                className={`${baseClasses} ${
                    isActiveLink('/') ? activeClasses : inactiveClasses
                }`}
            >
                <FiHome className="w-4 h-4 mr-3" /> Dashboard
            </LinkWithReload>

            {/* NavItem: Calendário */}
            <LinkWithReload
                to="/calendar"
                className={`${baseClasses} ${
                    isActiveLink('/calendar') ? activeClasses : inactiveClasses
                }`}
            >
                <FiCalendar className="w-4 h-4 mr-3" /> Calendário
            </LinkWithReload>

            {/* NavItem: Biblioteca */}
            <LinkWithReload
                to="/biblioteca"
                className={`${baseClasses} ${
                    isActiveLink('/biblioteca') ? activeClasses : inactiveClasses
                }`}
            >
                <FiFileText className="w-4 h-4 mr-3" /> Biblioteca
            </LinkWithReload>

            {/* NavItem: Séries de Ensaio */}
            <LinkWithReload
                to="/series"
                className={`${baseClasses} ${
                    isActiveLink('/series') ? activeClasses : inactiveClasses
                }`}
            >
                <FiLayers className="w-4 h-4 mr-3" /> Séries de Ensaio
            </LinkWithReload>

            {/* NavItem: Escalas */}
            <LinkWithReload
                to="/escalas"
                className={`${baseClasses} ${
                    isActiveLink('/escalas') ? activeClasses : inactiveClasses
                }`}
            >
                <FiRefreshCw className="w-4 h-4 mr-3" /> Escalas
            </LinkWithReload>

            {/* NavItem: Membros */}
            <LinkWithReload
                to="/membros"
                className={`${baseClasses} ${
                    isActiveLink('/membros') ? activeClasses : inactiveClasses
                }`}
            >
                <FiUsers className="w-4 h-4 mr-3" /> Membros
            </LinkWithReload>

            {/* NavItem: Notificações */}
            <LinkWithReload
                to="/notificacoes"
                className={`${baseClasses} ${
                    isActiveLink('/notificacoes') ? activeClasses : inactiveClasses
                }`}
            >
                <FiBell className="w-4 h-4 mr-3" /> Notificações
            </LinkWithReload>

            {/* NavItem: Configurações */}
            <LinkWithReload
                to="/configuracoes"
                className={`${baseClasses} ${
                    isActiveLink('/configuracoes') ? activeClasses : inactiveClasses
                }`}
            >
                <FiSettings className="w-4 h-4 mr-3" /> Configurações
            </LinkWithReload>

        </nav>

        <div className="mt-auto">
          <div className="p-4 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <img
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-500"
                // src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=14b8a6&color=fff`}
                src={profileImageSrc}
                alt={user.name}
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">{user.email}</p>
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
      <div className="absolute top-23 right-1 w-6 h-6 border justify-center items-center rounded-full text-black dark:text-gray-300 cursor-pointer flex">
        <button  onClick={onClose}>
          ✕
        </button>
      </div>
    ) : null}
  </aside>
);
}
