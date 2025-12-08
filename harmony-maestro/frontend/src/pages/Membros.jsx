// src/pages/Membros.jsx
import React, { useState, useEffect } from "react";
import { Search, UserPlus, Loader2, CheckCircle } from "lucide-react";
import { Trash2 } from "lucide-react"; // Ícone de exclusão
import { Info } from "lucide-react";


const Membros = () => {
  const [email, setEmail] = useState("");
  const [userFound, setUserFound] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);

  const token = localStorage.getItem("userToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [adminInfo, setAdminInfo] = useState(null);
  const [meusMembros, setMeusMembros] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);


useEffect(() => {
  if (user.role !== "user") return;

  const fetchGroupInfo = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/groupinfo/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Tenta JSON, mas se não for, retorna vazio
        let data;
        try {
          data = await res.json();
        } catch {
          data = null;
        }
        if (!data) {
          setAdminInfo(null);
          setMeusMembros([]);
          console.warn("Nenhum grupo encontrado ou resposta inválida do servidor.");
          return;
        }
      }

      const data = await res.json();
      setAdminInfo(data.admin);
      setMeusMembros(data.membros);
    } catch (err) {
      console.error("Erro ao buscar grupo:", err);
      setAdminInfo(null);
      setMeusMembros([]);
    }
  };

  fetchGroupInfo();
}, [user.id, token, user.role]);


  // 🔍 Buscar usuário pelo email
  const handleSearch = async () => {
    setLoading(true);
    setMessage("");
    setUserFound(null);
    setInvited(false);
    try {
      const res = await fetch(`http://localhost:4000/api/users/search?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Usuário não encontrado");
      setUserFound(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✉️ Enviar convite
  const handleInvite = async () => {
    if (!userFound) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:4000/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inviterId: user.id,
          inviteeEmail: userFound.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar convite");

      // 🔔 Cria notificação
      await fetch("http://localhost:4000/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Novo convite recebido",
          message: `${user.name} te convidou para participar do grupo.`,
          userId: userFound.id,
        }),
      });

      setMessage("Convite enviado com sucesso!");
      setInvited(true);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Buscar membros do grupo
  const fetchGroupMembers = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/group/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGroupMembers(data);
    } catch (err) {
      console.error("Erro ao buscar membros do grupo:", err);
    }
  };

  useEffect(() => {
    fetchGroupMembers();
  }, []);

  // 🔍 Buscar informações detalhadas do usuário
  const fetchUserDetails = async (userId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/users/details/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar detalhes do usuário");
      const data = await res.json();
      setSelectedUser(data);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Não foi possível carregar informações do usuário.");
    }
  };


  return (
  <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-transparent min-h-screen">
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Membros</h1>

    {/* Texto para ADMIN */}
    {user.role === "admin" && (
      <p className="text-base text-gray-600 dark:text-gray-300 max-w-6xl mx-left mb-10">
        Esta página permite gerenciar os membros da banda. Aqui você pode convidar
        novos integrantes utilizando a barra de pesquisa, buscando pelo e-mail do
        usuário para localizar seu perfil e enviar o convite.  
        Também é possível visualizar as informações dos membros convidados e
        remover integrantes do grupo quando necessário.  
        Os convites enviados precisam ser aceitos pelos usuários e aparecerão nas
        notificações deles até que sejam aprovados ou recusados.
      </p>
    )}

    {/* Texto para USER */}
    {user.role === "user" && (
      <p className="text-base text-gray-600 dark:text-gray-300 max-w-6xl mx-left mb-10">
        Nesta página você pode visualizar todos os membros que fazem parte da
        banda. É possível acessar as informações de cada integrante e, caso
        necessário, sair do grupo utilizando a opção disponível.
      </p>
    )}

    {/* 🔍 Campo de busca visível apenas para administradores */}
    {user.role === "admin" && (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Convidar Membros</h1>
        <div className="flex items-center">
          <input
            type="email"
            placeholder="Digite o e-mail do membro..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-gray-300 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !email}
            className="ml-3 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-1" />
            )}
            Buscar
          </button>
        </div>
      </div>
    )}

    {message && (
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 dark:text-yellow-800 px-4 py-2 rounded mb-4">
        {message}
      </div>
    )}

    {/* Resultado da pesquisa (somente admin pode ver) */}
    {user.role === "admin" && userFound && (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">{userFound.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{userFound.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ Botão de Convidar ou texto de convite enviado */}
            {!invited ? (
              <button
                onClick={handleInvite}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Convidar
              </button>
            ) : (
              <div className="flex items-center text-green-600 font-medium">
                <CheckCircle className="w-5 h-5 mr-1" /> Convite Enviado
              </div>
            )}

            {/* 🔍 Ver informações do membro */}
            <button
              title="Ver informações do usuário"
              onClick={() => fetchUserDetails(userFound.id)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg flex items-center text-sm transition"
            >
              <Info className="w-4 h-4 mr-1" /> Ver informações
            </button>
          </div>
        </div>
      </div>
    )}


    {/* Membros do grupo (visível para admin) */}
    {user.role === "admin" && groupMembers.length > 0 && (
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Membros do Grupo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupMembers.map((m) => {
            
            // 💡 Lógica para determinar a fonte da imagem do membro (m)
            const memberImageSrc = m.profilePicture
              ? `http://localhost:4000${m.profilePicture}` // Foto real
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || '??')}&background=14b8a6&color=fff`; // Fallback: Iniciais

            return (
              <div
                key={m.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 relative"
              >
                
                {/* ✅ NOVO: Container Flex para Foto + Info */}
                <div className="flex items-center gap-3 mb-2">
                  
                  {/* 🖼️ Foto do Membro */}
                  <img
                    className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                    src={memberImageSrc}
                    alt={`Foto de Perfil de ${m.name}`}
                  />
                  
                  {/* Informações de Texto */}
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{m.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{m.email}</p>
                  </div>
                  
                </div>
                {/* Fim do Container Flex */}

                {/* 🔍 Ver informações do membro */}
                <button
                  title="Ver informações do usuário"
                  onClick={() => fetchUserDetails(m.id)}
                  className="mt-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-lg flex items-center text-sm transition"
                >
                  <Info className="w-4 h-4 mr-1" /> Ver informações
                </button>

                {/* 🔘 Botão para excluir membro */}
                <button
                  title="Excluir membro do grupo"
                  onClick={async () => {
                    if (
                      !window.confirm(`Tem certeza que deseja remover ${m.name} do grupo?`)
                    )
                      return;

                    try {
                      const token = localStorage.getItem("userToken");

                      // Atualiza o role de volta para admin
                      const res = await fetch(
                        `http://localhost:4000/api/users/${m.id}/role`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ role: "admin" }),
                        }
                      );

                      if (!res.ok) throw new Error("Erro ao alterar função do usuário");

                      // Atualiza status do convite para "leaver"
                      await fetch(`http://localhost:4000/api/invites/leave/${m.id}`, {
                        method: "PATCH",
                        headers: { Authorization: `Bearer ${token}` },
                      });

                      alert(`Membro ${m.name} foi removido do grupo com sucesso!`);
                      window.location.reload();
                    } catch (err) {
                      console.error(err);
                      alert("Não foi possível remover o membro do grupo.");
                    }
                  }}
                  className="absolute top-3 right-3 p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-full transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )}

    {/* 👤 Exibição de informações do grupo para usuários comuns */}
    {user.role === "user" && adminInfo && (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
        
        {/* ======================================= */}
        {/* ✅Foto de Perfil do Administrador */}
        {/* ======================================= */}
        {(() => {
            const adminImageSrc = adminInfo.profilePicture 
                ? `http://localhost:4000${adminInfo.profilePicture}` // URL completa da foto
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(adminInfo.name || '??')}&background=14b8a6&color=fff`; // Fallback: Iniciais

            return (
                <div className="flex justify-center mb-6">
                    <img
                        className="w-20 h-20 rounded-full object-cover border-4 border-teal-500 dark:border-teal-400 shadow-md"
                        src={adminImageSrc}
                        alt={`Foto de Perfil do Administrador ${adminInfo.name}`}
                    />
                </div>
            );
        })()}
        
        {/* 🧑‍💼 Administrador */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
            Administrador do grupo
          </h2>
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-3 rounded-lg">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">{adminInfo.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{adminInfo.email}</p>
            </div>
            <button
              title="Ver informações do administrador"
              onClick={() => fetchUserDetails(adminInfo.id)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg flex items-center text-sm transition"
            >
              <Info className="w-4 h-4 mr-1" /> Ver informações
            </button>
          </div>
        </div>

        {/* 👥 Membros */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Membros Convidados</h1>

        <div className="space-y-3">
          {/* Exibe o próprio usuário */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-gray-800 dark:text-white font-medium">
                {user.name}{" "}
                <span className="text-sm text-gray-500 dark:text-gray-400">(você)</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <button
              title="Ver suas informações"
              onClick={() => fetchUserDetails(user.id)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg flex items-center text-sm transition"
            >
              <Info className="w-4 h-4 mr-1" /> Ver informações
            </button>
          </div>

          {/* Exibe demais membros */}
          {meusMembros.length > 0 ? (
            meusMembros.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-700"
              >
                <div>
                  <p className="text-gray-800 font-medium dark:text-white">{m.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{m.email}</p>
                </div>

                <button
                  title="Ver informações do membro"
                  onClick={() => fetchUserDetails(m.id)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg flex items-center text-sm transition"
                >
                  <Info className="w-4 h-4 mr-1" /> Ver informações
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-center mt-2">
              Nenhum outro membro no grupo.
            </p>
          )}
        </div>

        {/* 🚪 Botão Sair do grupo */}
        <div className="flex justify-end">
          <button
            onClick={async () => {
              try {
                // Atualiza o role de volta para "admin"
                const res = await fetch(`http://localhost:4000/api/users/role/${user.id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ role: "admin" }),
                });
                if (!res.ok) throw new Error("Erro ao sair do grupo");

                // Atualiza status do convite para "leaver"
                await fetch(`http://localhost:4000/api/invites/leave/${user.id}`, {
                  method: "PATCH",
                  headers: { Authorization: `Bearer ${token}` },
                });

                const updatedUser = await res.json();
                localStorage.setItem("user", JSON.stringify(updatedUser));

                // 🔁 Novo login automático
                const loginRes = await fetch("http://localhost:4000/api/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: updatedUser.email,
                    password: localStorage.getItem("userPass"),
                  }),
                });

                if (loginRes.ok) {
                  const loginData = await loginRes.json();
                  localStorage.setItem("userToken", loginData.token);
                  localStorage.setItem("user", JSON.stringify(loginData.user));
                  window.dispatchEvent(new Event("userUpdated"));
                  alert("Você saiu do grupo com sucesso!");
                  window.location.reload();
                } else {
                  alert("Você saiu do grupo, mas houve falha ao atualizar o login.");
                }

                // Limpa estados
                setAdminInfo(null);
                setMeusMembros([]);
              } catch (err) {
                console.error(err);
                alert("Não foi possível sair do grupo.");
              }
            }}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            Sair do grupo
          </button>
        </div>
      </div>
    )}


    {/* 🪪 Modal de informações do usuário */}
    {showModal && selectedUser && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white text-xl font-bold"
          >
            ×
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-5 border-b pb-2">
            Informações do Usuário
          </h2>

          {/* ============================================== */}
          {/* ✅ Foto de Perfil no Modal */}
          {/* ============================================== */}
          {(() => {
            const profileImageSrc = selectedUser.profilePicture 
                ? `http://localhost:4000${selectedUser.profilePicture}` // URL completa da foto
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || '??')}&background=14b8a6&color=fff`; // Fallback: Iniciais

            return (
                <div className="flex justify-center mb-6">
                    <img
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600 shadow-lg"
                        src={profileImageSrc}
                        alt={`Foto de Perfil de ${selectedUser.name}`}
                    />
                </div>
            );
          })()}

          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="p-2 rounded-lg transition duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600">
              <strong>Nome:</strong> {selectedUser.name}
            </div>

            <div className="p-2 rounded-lg transition duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600">
              <strong>Email:</strong> {selectedUser.email}
            </div>

            <div className="p-2 rounded-lg transition duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600">
              <strong>Sexo:</strong> {selectedUser.sexo || "Não informado"}
            </div>

            <div className="p-2 rounded-lg transition duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600">
              <strong>Experiência:</strong> {selectedUser.experiencia ?? "Não informado"}{" "}
              {selectedUser.experiencia ? "anos" : ""}
            </div>

            <div className="p-2 rounded-lg transition duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600">
              <strong>Instrumento:</strong> {selectedUser.instrumento || "Não informado"}
            </div>

            <div className="p-2 rounded-lg transition duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600">
              <strong>Qtd. Instrumentos:</strong> {selectedUser.instrumentosQtd ?? "Não informado"}
            </div>

            <div className="p-2 rounded-lg transition duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600">
              <strong>Data de Nascimento:</strong>{" "}
              {selectedUser.idade
                ? new Date(selectedUser.idade).toLocaleDateString("pt-BR")
                : "Não informada"}
            </div>

            <div className="p-2 rounded-lg transition duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600">
              <strong>Disponibilidade:</strong> {selectedUser.disponibilidade || "Não informado"}
            </div>

            <div className="p-2 rounded-lg transition duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600">
              <strong>Celular:</strong> {selectedUser.celular || "Não informado"}
            </div>
          </div>
        </div>
      </div>

    )}

  </div>
);
};


export default Membros;
