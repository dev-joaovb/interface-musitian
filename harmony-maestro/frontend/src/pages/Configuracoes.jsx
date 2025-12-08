// src/pages/Configuracoes.jsx

// 💡 Importações: Reage e Hooks, Contexto de Tema
import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { FiCamera, FiEdit } from "react-icons/fi"; // Importar ícone


/**
 * Componente da página de Configurações do Usuário.
 * Permite a visualização e edição de dados cadastrais, preferências de notificação e tema.
 */
const Configuracoes = () => {
  // 💡 Estado: Armazena todos os dados do formulário.
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
  profilePicture: "",
});

  //  estado para o arquivo de foto a ser enviado
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Estado para controlar a exibição dos campos de senha
  const [showPasswordFields, setShowPasswordFields] = useState(false);


  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const { theme, setTheme } = useTheme();

  // --- Lógica de Carregamento de Dados (useEffect) ---
  
  /**
   * Hook useEffect: Carrega os dados atuais do usuário da API ao montar o componente.
   * Depende apenas do 'token'.
   */

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
          profilePicture: data.profilePicture || "",
        }));

        if (data.tema === "dark" || data.tema === "light") {
          setTheme(data.tema);
          localStorage.setItem(`theme_user_${user.id}`, data.tema);
        }
      })
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, [token]);

  // --- Funções de Manipulação de Estado e Submissão ---

  /**
   * Função handleChange: Atualiza o estado do formulário em resposta às alterações de input.
   * Lida com inputs de texto, números e checkboxes.
   */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Função handleSubmit: Envia os dados do formulário para o backend (PUT request).
   * Contém a lógica de validação para alteração de senha.
   */

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
    // 💡 Payload: Cria o objeto de dados a ser enviado, excluindo os campos de apenas leitura
    // e os campos temporários de senha (a menos que showPasswordFields seja true).
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

/**
   * Função handlePhotoChange: Lida com a seleção do arquivo.
   */
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  /**
   * Função handleUploadPhoto: Envia o arquivo para uma nova rota de upload.
   * Usará a rota POST/PATCH que criaremos no Backend.
   */
  const handleUploadPhoto = async () => {
    if (!selectedFile) return alert("Selecione uma imagem para fazer upload.");

    setUploading(true);
    const formDataPhoto = new FormData();
    formDataPhoto.append("profilePicture", selectedFile);

    try {
      const res = await fetch(`http://localhost:4000/api/userss/${user.id}/profile-picture`, {
        method: "PATCH", 
        headers: {
          Authorization: `Bearer ${token}`,
          
        },
        body: formDataPhoto,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Foto de perfil atualizada com sucesso!");
        
        // Atualiza a URL no estado local e no localStorage (para Topbar/Sidebar)
        setFormData(prev => ({ ...prev, profilePicture: data.profilePicture }));
        
        // Atualiza a informação do usuário no localStorage
        const updatedUser = { ...user, profilePicture: data.profilePicture };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setSelectedFile(null); // Limpa o arquivo selecionado
        window.location.reload(); // ✅ Recarrega a página para atualizar Topbar/Sidebar
      } else {
        alert(data.error || "Erro ao fazer upload da foto.");
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao conectar com o servidor para upload.");
    } finally {
      setUploading(false);
    }
  };

  // --- Renderização do Componente ---

  return (
    <div className="flex flex-col flex-1 overflow-hidden items-center">
      <div className="hidden md:flex items-center justify-between px-6 py-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Configurações</h1>
      </div>
        <p className="text-base text-gray-600 dark:text-gray-300 text-center mb-10 max-w-4xl px-4">
          Nesta área você pode editar seus dados pessoais, atualizar suas informações
          de contato, gerenciar o envio de notificações e realizar a redefinição da
          sua senha de forma segura, mantendo sua conta sempre protegida e atualizada.
        </p>

        {/* ========================================================= */}
        {/* ✅ Foto de Perfil */}
        {/* ========================================================= */}
        <div className="flex justify-center mb-8 w-full">
          <div className="relative group w-32 h-32">
            
            {/* Foto Atual (ou Placeholder) */}
            <img
              // Se houver selectedFile, mostra a pré-visualização, senão, mostra a foto salva ou o avatar padrão
              src={
                selectedFile 
                  ? URL.createObjectURL(selectedFile)
                  : formData.profilePicture 
                    ? `http://localhost:4000${formData.profilePicture}`
                    :  `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nome || '??')}&background=14b8a6&color=fff`
              }
              alt="Foto de Perfil"
              className="w-full h-full rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 transition duration-300"
            />

            {/* Ícone de Edição (Overlay) */}
            <label 
              htmlFor="photo-upload" 
              title="Editar foto"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            >
              <FiCamera className="w-6 h-6" />
            </label>
            
            {/* Input de Arquivo (Escondido) */}
            <input 
              type="file" 
              id="photo-upload" 
              name="photo-upload"
              accept="image/*"
              className="hidden" 
              onChange={handlePhotoChange}
            />
          </div>
          
          {/* Botões de Ação de Upload */}
          <div className="ml-4 flex flex-col justify-center gap-2">
            
            {selectedFile && (
              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={uploading}
                className={`py-2 px-4 rounded-lg text-white text-sm transition ${
                  uploading ? 'bg-gray-500' : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {uploading ? "Enviando..." : "Salvar Foto"}
              </button>
            )}

            {selectedFile && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="py-2 px-4 rounded-lg text-sm border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            )}

            {!selectedFile && formData.profilePicture && (
                <button
                    type="button"
                    // Lógica para remover a foto (precisa de uma rota DELETE/PATCH no backend)
                    onClick={() => alert("Função de remoção de foto em breve.")}
                    className="py-2 px-4 rounded-lg text-sm border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition"
                >
                    Remover Foto
                </button>
            )}

          </div>

        </div>

      <div className="flex flex-col md:flex-row gap-6 items-stretch">

        {/* Preferencias */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 flex-1 flex flex-col md:w-2/5">

          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Preferências do Usuário
          </h2>

          <form className="space-y-4 flex-1 flex flex-col" onSubmit={handleSubmit}>

            {/* Conteúdo do formulário */}
            <div className="space-y-4 flex-1">

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
                  className="mt-2 block w-full h-8 border-gray-300 dark:border-gray-600 
                  rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 
                  text-gray-900 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500 p-2"
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
                  className="mt-2 block w-full h-8 border-gray-300 dark:border-gray-600 rounded-lg 
                  shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 
                  focus:ring-teal-500 focus:border-teal-500 p-2"
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>

                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="mt-2 text-teal-600 hover:text-teal-700 text-sm font-semibold"
                >
                  {showPasswordFields ? "Cancelar" : "Editar senha"}
                </button>

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
                        className="mt-1 block w-full h-8 border-gray-300 dark:border-gray-600 
                        bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 
                        rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 p-2"
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
                        className="mt-1 block w-full h-8 border-gray-300 dark:border-gray-600 
                        bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg 
                        shadow-sm focus:ring-teal-500 focus:border-teal-500 p-2"
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
                        className="mt-1 block w-full h-8 border-gray-300 dark:border-gray-600 
                        bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 
                        rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 p-2"
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

                      setFormData((prev) => ({ ...prev, tema: novo }));

                      localStorage.setItem(`theme_user_${user.id}`, novo);
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
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 mt-auto"
            >
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* Outros dados */}
        <div className="w-120 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 flex-1 flex flex-col">

          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Outros Dados
          </h2>

          <form className="space-y-4 flex-1 flex flex-col" onSubmit={handleSubmit}>

            <div className="space-y-4 flex-1">

              {/* Sexo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sexo
                </label>
                <input
                  type="text"
                  value={formData.sexo}
                  readOnly
                  className="mt-2 block w-full h-8 border-gray-300 dark:border-gray-600 
                  rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 
                  shadow-sm focus:ring-teal-500 focus:border-teal-500 p-2"
                />
              </div>

              {/* Data de nascimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data de Nascimento
                </label>
                <input
                  type="text"
                  value={formData.idade}
                  readOnly
                  className="mt-2 block w-full h-8 border-gray-300 dark:border-gray-600 
                  rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 
                  shadow-sm focus:ring-teal-500 focus:border-teal-500 p-2"
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
                  className="mt-2 block w-full h-8 border-gray-300 dark:border-gray-600 rounded-lg 
                  shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 
                  focus:ring-teal-500 focus:border-teal-500 p-2"
                />
              </div>

              {/* Qtd. instrumentos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantidade de instrumentos
                </label>
                <input
                  type="number"
                  name="instrumentosQtd"
                  value={formData.instrumentosQtd}
                  onChange={handleChange}
                  className="mt-2 block w-full h-8 border-gray-300 dark:border-gray-600 
                  rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 
                  dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500 p-2"
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
                  className="mt-2 block w-full h-8 border-gray-300 dark:border-gray-600 
                  rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 
                  dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500 p-2"
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
                  className="mt-2 block w-full h-8 border-gray-300 dark:border-gray-600 
                  rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 
                  dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500 p-2"
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
                  className="mt-2 block w-full h-8 border-gray-300 dark:border-gray-600 
                  rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 
                  dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500 p-2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 mt-auto"
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
