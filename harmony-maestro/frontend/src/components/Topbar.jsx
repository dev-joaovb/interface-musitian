import React from "react";
import { FiSearch, FiBell, FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Usuário" };

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <button className="text-gray-500 dark:text-gray-300 focus:outline-none" onClick={onMenuClick}>
            <FiMenu className="w-6 h-6" />
          </button>
          <span className="ml-2 text-lg font-bold text-gray-800 dark:text-gray-100">Harmony Maestro</span>
        </div>
        <div className="flex items-center">
          <button className="text-gray-500 dark:text-gray-300 focus:outline-none">
            <FiBell className="w-5 h-5" />
          </button>
          <img
            className="w-8 h-8 ml-4 rounded-full border border-gray-200 dark:border-gray-600"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=14b8a6&color=fff`}
            alt={user.name}
          />
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          {/* <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          </div> */}
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/notificacoes" className="relative text-gray-500 dark:text-gray-300 focus:outline-none">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></span>
          </Link>
          <div className="flex items-center">
            <img
              className="w-8 h-8 rounded-full"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=14b8a6&color=fff`}
              alt={user.name}
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
          </div>
        </div>
      </div>
    </>
  );
}
