// src/pages/Membros.jsx
import React, { useEffect, useState } from "react";
import { Edit, Trash2, Shield, UserPlus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Membros = () => {
  const navigate = useNavigate();
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  // Carrega o usuário logado e verifica token
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchMembros();
  }, []);

  // Buscar membros do backend
  const fetchMembros = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await fetch("http://localhost:4000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar membros");
      setMembros(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Alterar role (admin/user)
  const toggleRole = async (id, currentRole) => {
    try {
      const token = localStorage.getItem("userToken");
      const newRole = currentRole === "admin" ? "user" : "admin";
      const res = await fetch(`http://localhost:4000/api/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar função");
      setMembros((prev) =>
        prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
      );
      setMessage(`Função de ${data.name} alterada com sucesso!`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Remover membro
  const deleteMember = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este membro?")) return;
    try {
      const token = localStorage.getItem("userToken");
      const res = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao remover membro");
      setMembros((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Carregando membros...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Membros</h1>
          <p className="text-gray-600">Gerencie os membros do seu grupo musical</p>
        </div>

        {user?.role === "admin" && (
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Membro
          </button>
        )}
      </div>

      {message && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-2 rounded mb-4">
          {message}
        </div>
      )}

      {/* Grid de membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {membros.map((membro) => (
          <div
            key={membro.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{membro.name}</h3>
                <p className="text-sm text-gray-500">{membro.email}</p>
              </div>
              {membro.role === "admin" ? (
                <Shield className="text-teal-600" />
              ) : (
                <Edit className="text-gray-400" />
              )}
            </div>

            <span
              className={`inline-block text-xs px-2 py-1 rounded-full ${
                membro.role === "admin"
                  ? "bg-teal-100 text-teal-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {membro.role === "admin" ? "Administrador" : "Convidado"}
            </span>

            {user?.role === "admin" && user.id !== membro.id && (
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => toggleRole(membro.id, membro.role)}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Alterar
                </button>
                <button
                  onClick={() => deleteMember(membro.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 inline" /> Remover
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Membros;
