// src/pages/Configuracoes.jsx
import React, { useState } from "react";

const Configuracoes = () => {
  const [formData, setFormData] = useState({
    nome: "Carlos",
    email: "carlos@example.com",
    senha: "",
    notifEmail: false,
    notifWhats: false,
    tema: "Claro",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Configurações salvas:", formData);
    alert("Configurações salvas com sucesso!");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Topbar já está como componente global */}
      <div className="hidden md:flex items-center justify-between px-6 py-3">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Preferências do Usuário
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Notificações */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifEmail"
                name="notifEmail"
                checked={formData.notifEmail}
                onChange={handleChange}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded"
              />
              <label
                htmlFor="notifEmail"
                className="ml-2 text-sm text-gray-700"
              >
                Receber notificações por e-mail
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifWhats"
                name="notifWhats"
                checked={formData.notifWhats}
                onChange={handleChange}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded"
              />
              <label
                htmlFor="notifWhats"
                className="ml-2 text-sm text-gray-700"
              >
                Receber notificações por WhatsApp
              </label>
            </div>

            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tema
              </label>
              <select
                name="tema"
                value={formData.tema}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
              >
                <option>Claro</option>
                <option>Escuro</option>
              </select>
            </div>

            {/* Botão */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Salvar Alterações
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
