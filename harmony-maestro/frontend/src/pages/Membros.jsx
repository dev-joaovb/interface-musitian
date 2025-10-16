// src/pages/Membros.jsx
import React, { useState, useEffect } from "react";
import { Search, UserPlus, Loader2, CheckCircle } from "lucide-react";

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

  return (
  <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 min-h-screen">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Membros</h1>

    {/* 🔍 Campo de busca visível apenas para administradores */}
    {user.role === "admin" && (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Convidar Membros</h1>
        <div className="flex items-center">
          <input
            type="email"
            placeholder="Digite o e-mail do membro..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-2 rounded mb-4">
        {message}
      </div>
    )}

    {/* Resultado da pesquisa (somente admin pode ver) */}
    {user.role === "admin" && userFound && (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">{userFound.name}</h3>
            <p className="text-sm text-gray-500">{userFound.email}</p>
          </div>
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
        </div>
      </div>
    )}

    {/* Membros do grupo (visível para admin) */}
    {user.role === "admin" && groupMembers.length > 0 && (
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Membros do Grupo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <h3 className="font-semibold text-gray-800">{m.name}</h3>
              <p className="text-sm text-gray-500">{m.email}</p>
            </div>
          ))}
        </div>
      </div>
    )}

{/* 👤 Exibição de informações do grupo para usuários comuns */}
{user.role === "user" && adminInfo && (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 mt-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-2">
      Administrador do grupo
    </h2>
    <p className="text-gray-700">
      <strong>{adminInfo.name}</strong> ({adminInfo.email})
    </p>

    <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-6">Membros Convidados</h1>

    <div className="mt-4">
      <h3 className="font-semibold text-gray-700 mb-2">
        {/* Membros do grupo (incluindo você): */}
      </h3>
      <ul className="space-y-1">
        <li key={user.id} className="text-gray-800 font-medium">
          • {user.name} ({user.email}){" "}
          <span className="text-gray-500 text-sm">(você)</span>
        </li>

        {meusMembros.length > 0 ? (
          meusMembros.map((m) => (
            <li key={m.id} className="text-gray-600">
              • {m.name} ({m.email})
            </li>
          ))
        ) : (
          <li className="text-gray-500 italic">Nenhum outro membro no grupo.</li>
        )}
      </ul>
    </div>
  
  
        {/* Botão Sair do grupo */}
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
      

      // Atualiza status do convite para "rejected"
      await fetch(`http://localhost:4000/api/invites/leave/${user.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // 🔁 Faz novo login automático para atualizar o token JWT
      const loginRes = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: updatedUser.email, password: localStorage.getItem("userPass") }),
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

      

      // Limpa estados do grupo
      setAdminInfo(null);
      setMeusMembros([]);

      alert("Você saiu do grupo com sucesso!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Não foi possível sair do grupo.");
    }
  }}
  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
>
  Sair do grupo
</button>
      </div>
    )}
  </div>
);
};


export default Membros;
