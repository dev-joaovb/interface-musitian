import React from "react";
import { FiSearch, FiBell, FiMenu } from "react-icons/fi";

export default function Topbar({ onMenuClick }) {
  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <button className="text-gray-500 focus:outline-none" onClick={onMenuClick}>
            <FiMenu className="w-6 h-6" />
          </button>
          <span className="ml-2 text-lg font-bold text-gray-800">Harmony Maestro</span>
        </div>
        <div className="flex items-center">
          <button className="text-gray-500 focus:outline-none">
            <FiBell className="w-5 h-5" />
          </button>
          <img className="w-8 h-8 ml-4 rounded-full" src="http://static.photos/people/200x200/1" alt="Carlos" />
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="relative">
            <input type="text" placeholder="Pesquisar..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-500 focus:outline-none">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></span>
          </button>
          <div className="flex items-center">
            <img className="w-8 h-8 rounded-full" src="http://static.photos/people/200x200/1" alt="Carlos" />
            <span className="ml-2 text-sm font-medium text-gray-700">Carlos</span>
          </div>
        </div>
      </div>
    </>
  );
}
