// src/pages/Configuracoes.jsx
import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Configuracoes = () => {
  const [formData, setFormData] = useState({
  nome: "",
  email: "",
  senha: "",
  notifEmail: false,
  notifWhats: false,
  tema: "",
  sexo: "",
  idade: "",
  experiencia: "",
  instrumentosQtd: "",
  instrumento: "",
  disponibilidade: "",
  celular: "",
});


  const [showPasswordFields, setShowPasswordFields] = useState(false);


  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!user || !token) return;

    fetch(`http://localhost:4000/api/userss/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFormData((prev) => ({
          ...prev,
          nome: data.name || "",
          email: data.email || "",
          notifEmail: data.notifEmail || false,
          sexo: data.sexo || "",
          idade: data.idade ? new Date(data.idade).toLocaleDateString("pt-BR") : "",
          experiencia: data.experiencia || "",
          instrumentosQtd: data.instrumentosQtd || "",
          instrumento: data.instrumento || "",
          disponibilidade: data.disponibilidade || "",
          celular: data.celular || "",
        }));

        if (data.tema === "dark" || data.tema === "light") {
          setTheme(data.tema);
        }
      })
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Se o usuário estiver tentando alterar a senha
  if (showPasswordFields) {
    if (!formData.senhaAtual || !formData.novaSenha || !formData.confirmarSenha) {
      return alert("Preencha todos os campos de senha.");
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      return alert("As senhas não coincidem.");
    }
  }

  try {
    const payload = {
      nome: formData.nome,
      email: formData.email,
      notifEmail: formData.notifEmail,
      notifWhats: formData.notifWhats,
      tema: formData.tema,
      experiencia: formData.experiencia,
      instrumentosQtd: formData.instrumentosQtd,
      instrumento: formData.instrumento,
      disponibilidade: formData.disponibilidade,
      celular: formData.celular,
    };

    // Inclui dados de senha somente se o usuário quiser alterar
    if (showPasswordFields) {
      payload.senhaAtual = formData.senhaAtual;
      payload.novaSenha = formData.novaSenha;
    }

    const res = await fetch(`http://localhost:4000/api/userss/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Configurações atualizadas com sucesso!");
    } else {
      alert(data.error || "Erro ao salvar configurações");
    }
  } catch (err) {
    console.error("Erro ao atualizar:", err);
    alert("Erro ao conectar com o servidor.");
  }
};

  return (
    <div className="flex flex-col flex-1 overflow-hidden items-center">
      <div className="hidden md:flex items-center justify-between px-6 py-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Configurações</h1>
      </div>
        <p className="text-base text-gray-600 text-center mb-10 max-w-4xl px-4">
          Nesta área você pode editar seus dados pessoais, atualizar suas informações
          de contato, gerenciar o envio de notificações e realizar a redefinição da
          sua senha de forma segura, mantendo sua conta sempre protegida e atualizada.
        </p>

      <div className="flex-1 overflow-auto p-6">

          <div className="flex flex-col md:flex-row gap-6">
          
            {/* Preferencias */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 w-100">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Preferências do Usuário
              </h2>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="mt-2 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>

                  {/* Botão para mostrar/ocultar campos */}
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="mt-2 text-teal-600 hover:text-teal-700 text-sm font-semibold"
                  >
                    {showPasswordFields ? "Cancelar" : "Editar senha"}
                  </button>

                  {/* Campos exibidos apenas ao clicar em "Editar senha" */}
                  {showPasswordFields && (
                    <div className="mt-4 space-y-3 transition-all duration-300">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Senha atual
                        </label>
                        <input
                          type="password"
                          name="senhaAtual"
                          value={formData.senhaAtual || ""}
                          onChange={handleChange}
                          placeholder="Digite sua senha atual"
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg shadow-sm  focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nova senha
                        </label>
                        <input
                          type="password"
                          name="novaSenha"
                          value={formData.novaSenha || ""}
                          onChange={handleChange}
                          placeholder="Digite a nova senha"
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg shadow-sm  focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirmar nova senha
                        </label>
                        <input
                          type="password"
                          name="confirmarSenha"
                          value={formData.confirmarSenha || ""}
                          onChange={handleChange}
                          placeholder="Confirme a nova senha"
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg shadow-sm  focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  )}
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
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Receber notificações por e-mail
                  </label>
                </div>

                <div className="flex items-center opacity-50 cursor-not-allowed">
                  <input
                    type="checkbox"
                    id="notifWhats"
                    name="notifWhats"
                    checked={formData.notifWhats}
                    onChange={handleChange}
                    disabled
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="notifWhats"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Receber notificações por WhatsApp (em breve)
                  </label>
                </div>

                {/* Tema */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tema
                  </label>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Claro</span>

                    <button
                      type="button"
                      onClick={() => {
                        const novo = theme === "dark" ? "light" : "dark";
                        setTheme(novo);
                      }}
                      aria-pressed={theme === "dark"}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        theme === "dark" ? "bg-teal-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`transform transition-transform inline-block w-5 h-5 bg-white rounded-full shadow ${
                          theme === "dark" ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>

                    <span className="text-sm text-gray-600 dark:text-gray-300">Escuro</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 mt-35"
                >
                  Salvar Alterações
                </button>
              </form>
            </div>

            {/* Outros dados */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 w-100">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Outros Dados
              </h2>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Sexo (somente leitura) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sexo</label>
                  <input
                    type="text"
                    value={formData.sexo}
                    readOnly
                    className="mt-2 block w-full border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Data de Nascimento (somente leitura) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data de Nascimento
                  </label>
                  <input
                    type="text"
                    value={formData.idade}
                    readOnly
                    className="mt-2 block w-full border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Experiência */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Experiência (anos)
                  </label>
                  <input
                    type="number"
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleChange}
                    className="mt-2 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Quantidade de instrumentos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quantidade de instrumentos
                  </label>
                  <input
                    type="number"
                    name="instrumentosQtd"
                    value={formData.instrumentosQtd}
                    onChange={handleChange}
                    className="mt-2 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Instrumento preferido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instrumento preferido
                  </label>
                  <input
                    type="text"
                    name="instrumento"
                    value={formData.instrumento}
                    onChange={handleChange}
                    className="mt-2 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Disponibilidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Disponibilidade
                  </label>
                  <input
                    type="text"
                    name="disponibilidade"
                    value={formData.disponibilidade}
                    onChange={handleChange}
                    placeholder="Ex: Manhã, tarde, noite..."
                    className="mt-2 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Celular */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Celular
                  </label>
                  <input
                    type="text"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    placeholder="(DDD) 99999-9999"
                    className="mt-2 block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

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
    </div>
  );
};

export default Configuracoes;
