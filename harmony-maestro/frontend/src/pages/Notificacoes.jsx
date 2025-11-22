// src/pages/Notificacoes.jsx
import React, { useEffect, useState } from "react";
import { Bell, Loader2, Check, X } from "lucide-react";

const Notificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifRes, inviteRes] = await Promise.all([
          fetch(`http://localhost:4000/api/notifications/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:4000/api/invites/received/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const notifData = await notifRes.json();
        const inviteData = await inviteRes.json();

        setNotificacoes(notifData);
        setConvites(inviteData);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, token]);

  const aceitarConvite = async (inviteId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/invites/accept/${inviteId}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Erro ao aceitar convite");
      setConvites((prev) => prev.filter((c) => c.id !== inviteId));

      // 🔄 Atualiza o role do usuário para "user"
      const roleRes = await fetch(`http://localhost:4000/api/users/role/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: "user" }),
      });

      if (!roleRes.ok) throw new Error("Erro ao atualizar role do usuário");

      // ✅ Atualiza o usuário localmente após mudar o role
      const updatedUser = { ...user, role: "user" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser); // <-- ADICIONADO AQUI

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
          alert("Convite aceito com sucesso!");
          window.location.reload(); // garante que a biblioteca recarregue o contexto
        } else {
          alert("Convite aceito, mas houve falha ao atualizar o login.");
        }


      alert("Convite aceito com sucesso!");
    } catch (err) {
      console.error("Erro ao aceitar convite:", err);
      alert("Não foi possível aceitar o convite.");
    }
  };

  const recusarConvite = async (inviteId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/invites/reject/${inviteId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao recusar convite");

      setConvites((prev) => prev.filter((c) => c.id !== inviteId));
      alert("Convite recusado com sucesso!");
    } catch (err) {
      console.error("Erro ao recusar convite:", err);
      alert("Não foi possível recusar o convite.");
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6 text-teal-600" />
        Minhas Notificações
      </h1>
      <p className="text-base text-gray-600  mb-10 max-w-4xl mx-letf">
        Aqui você receberá notificações sobre novidades, convites, eventos,
        alterações de agenda e outras atualizações importantes, permitindo que você
        acompanhe tudo o que acontece no grupo em tempo real.
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          {/* Convites */}
          {convites.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Convites Pendentes
              </h2>
              {convites.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center mb-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      Convite de {c.inviter.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">{c.inviter.email}</p>
                    <p className="text-xs text-gray-400">
                      Você foi convidado por <strong>{c.inviter.name}</strong> para participar do grupo dele.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => aceitarConvite(c.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg flex items-center"
                    >
                      <Check className="w-4 h-4 mr-1" /> Aceitar
                    </button>
                    <button
                      onClick={() => recusarConvite(c.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" /> Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notificações normais */}
<div className="space-y-4">
  {(() => {
    // 🔹 Filtra notificações com menos de 24h
    const now = new Date();
    const validNotifs = notificacoes.filter((n) => {
      const notifDate = new Date(n.date);
      const diffHours = (now - notifDate) / (1000 * 60 * 60);
      return diffHours < 24;
    });

    // 🔹 Limita a 20 notificações mais recentes
    const limitedNotifs = validNotifs
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);

    return limitedNotifs.length > 0 ? (
      limitedNotifs.map((n) => (
      <div
        key={n.id}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
      >
        <h3 className="font-semibold text-gray-800">{n.title}</h3>
        <p className="text-gray-600">{n.message}</p>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(n.date).toLocaleString("pt-BR")}
        </p>

        {/* 🔹 Botão para redirecionamento (quando a notificação tiver rota) */}
        {n.title.includes("música") && (
          <a
            href="/biblioteca"
            className="mt-2 inline-block text-teal-600 hover:text-teal-800 font-medium"
          >
            Ir para Biblioteca →
          </a>
        )}
        {n.title.includes("partitura") && (
          <a
            href="/partitura"
            className="mt-2 inline-block text-teal-600 hover:text-teal-800 font-medium"
          >
            Ir para Partituras →
          </a>
        )}
        {n.title.includes("evento") && (
          <a
            href="/calendar"
            className="mt-2 inline-block text-teal-600 hover:text-teal-800 font-medium"
          >
            Ir para Calendário →
          </a>
        )}
        {n.title.includes("série") && (
          <a
            href="/series"
            className="mt-2 inline-block text-teal-600 hover:text-teal-800 font-medium"
          >
            Ir para Séries →
          </a>
        )}
      </div>
    ))
    ) : (
      <p className="text-gray-500 text-center">
        Nenhuma notificação encontrada (todas expiraram).
      </p>
    );
  })()}
</div>
        </>
      )}
    </div>
  );
};

export default Notificacoes;
