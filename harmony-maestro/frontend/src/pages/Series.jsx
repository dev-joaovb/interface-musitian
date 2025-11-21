import React, { useEffect, useState } from "react";

const Series = () => {
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [hour, setHour] = useState("");
  const [message, setMessage] = useState("");
  const [seriesList, setSeriesList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingStartDate, setEditingStartDate] = useState("");
  const [editingHour, setEditingHour] = useState("");

  const [role, setRole] = useState("admin");
  const [ownerId, setOwnerId] = useState(null);

  const [selectedSeriesId, setSelectedSeriesId] = useState(null);


  const [selectedPresencas, setSelectedPresencas] = useState([]);
  // const [confirmedSeries, setConfirmedSeries] = useState([]);
  const [confirmedSeries, setConfirmedSeries] = useState(() => {
  const saved = localStorage.getItem("confirmedSeries");
  return saved ? JSON.parse(saved) : [];
});


  // 📦 Carregar eventos do backend (somente futuros)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");

          const userId = localStorage.getItem("userId");
          const storedData =
            JSON.parse(localStorage.getItem("confirmedSeriesByUser") || "{}");
          setConfirmedSeries(storedData[userId] || []);

        const res = await fetch("http://localhost:4000/api/calendar/series", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao buscar eventos");

        const data = await res.json();
        const today = new Date();

        // data.events é o novo array retornado
        const upcoming = data.events.filter(
          (e) => new Date(e.date) >= today
        );

        const nextEvent = upcoming.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        )[0];

        setEvents(nextEvent ? [nextEvent] : []);
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      }
    };

    fetchEvents();
  }, []);


  // 📦 Carregar séries já registradas
  useEffect(() => {
    const fetchSeries = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:4000/api/series", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.series) {
          const sortedData = data.series.sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate)
          );
          setSeriesList(sortedData);
          setRole(data.role);
          setOwnerId(data.ownerId);
        }
      } catch (err) {
        console.error("Erro ao carregar séries:", err);
      }
    };
    fetchSeries();
  }, []);


  // 📦 Registrar série
  const handleSaveSeries = async (event) => {
    if (!event || !startDate || !hour) {
      alert("Preencha todos os campos!");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:4000/api/series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Série - ${event.title}`,
          startDate,
          hour,
          eventId: event.id,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar série");

      const newSeries = await res.json();
      setMessage(`✅ Série "${newSeries.title}" registrada com sucesso!`);
      setSeriesList((prev) =>
        [...prev, newSeries].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        )
      );

      setStartDate("");
      setHour("");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao registrar série");
    }
  };


    // 📦 Atualizar série (edição inline)
  const handleUpdateSeries = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:4000/api/series/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: editingStartDate,
          hour: editingHour,
        }),
      });
      const updated = await res.json();
      setSeriesList((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setEditingId(null);
      setMessage("✅ Série atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao atualizar série");
    }
  };

    // 📦 Deletar série
  const handleDeleteSeries = async (id) => {
    if (!window.confirm("Deseja realmente deletar esta série?")) return;

    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:4000/api/series/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSeriesList((prev) => prev.filter((s) => s.id !== id));
      setMessage("✅ Série deletada com sucesso!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao deletar série");
    }
  };

  // 📦 Confirmar presença na séries
  
 // ✅ Confirmar presença
const handleConfirmPresence = async (id, status) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // ← 🔹 Salve o ID do usuário logado no login e use aqui
  try {
    const res = await fetch(`http://localhost:4000/api/series/${id}/presenca`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error("Erro ao confirmar presença");
    const updated = await res.json();

    setSeriesList((prev) =>
      prev.map((s) =>
        s.id === updated.serieId ? { ...s, status_presenca: status } : s
      )
    );

    // 🔒 Bloqueia apenas para o usuário atual
    setConfirmedSeries((prev) => {
      const storedData =
        JSON.parse(localStorage.getItem("confirmedSeriesByUser") || "{}");

      const userConfirmed = storedData[userId] || [];
      const updatedUserConfirmed = [...new Set([...userConfirmed, id])];

      const newData = { ...storedData, [userId]: updatedUserConfirmed };

      localStorage.setItem("confirmedSeriesByUser", JSON.stringify(newData));

      return updatedUserConfirmed;
    });

    setMessage(`✅ Sua presença foi marcada como: ${status}`);
  } catch (err) {
    console.error(err);
    setMessage("Erro ao confirmar presença");
  }
};


// ✅ Visualizar lista de presenças (admin)
const handleViewPresences = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://localhost:4000/api/series/${id}/presenca`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erro ao carregar presenças");
    const data = await res.json();

    setSelectedPresencas(data); // ✅ Armazena no estado
    setSelectedSeriesId(id); // ✅ guarda o ID da série
  } catch (err) {
    console.error(err);
    setMessage("Erro ao carregar presenças");
  }
};

// ✅ Admin confirma presença (Compareceu / Não Compareceu)
const handleConfirmacaoAdmin = async (serieId, userId, confirmacao) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(
      `http://localhost:4000/api/series/${serieId}/presenca/${userId}/confirmar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmacao }),
      }
    );

    if (!res.ok) throw new Error("Erro ao confirmar presença");

    // Atualiza estado local sem recarregar
    setSelectedPresencas((prev) =>
      prev.map((p) =>
        p.id === userId ? { ...p, confirmacaoAdmin: confirmacao } : p
      )
    );
  } catch (err) {
    console.error(err);
    setMessage("Erro ao confirmar presença ou o usuário ainda não respondeu ao status de presença.");
  }
};

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Séries de Ensaios
      </h1>

      {/* Texto para ADMIN */}
      {role === "admin" && (
        <p className="text-balance text-gray-600 max-w-6xl mx-left mb-10">
          Esta página permite criar e gerenciar séries de ensaios relacionados a um
          evento agendado. Quando um evento estiver disponível, você poderá registrar
          novos ensaios até a data do evento, organizando a preparação do grupo de
          forma prática e eficiente.  
          Além disso, você poderá acompanhar a participação dos membros, marcando
          quem <strong>Compareceu</strong> ou <strong>Não compareceu</strong> em cada
          ensaio, facilitando o controle de presença e o planejamento do grupo.
        </p>
      )}

      {/* Texto para USER */}
      {role === "user" && (
        <p className="text-balance text-gray-600 max-w-6xl mx-left mb-10">
          Nesta página você pode visualizar os eventos e as séries de ensaios
          agendados pelo administrador. Aqui você verá as datas, horários e
          informações dos ensaios que foram programados.  
          Sua única ação nesta tela será confirmar sua disponibilidade, clicando em
          <strong> Confirmar presença</strong> ou <strong> Não disponível</strong>
          para cada ensaio.
        </p>
      )}

      {/* 📅 Próximos eventos */}
      {events.length > 0 ? (
        events.map((event) => {
          const daysLeft = Math.ceil(
            (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={event.id}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-100 mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded">
                  Faltam {daysLeft} dias
                </span>
              </div>

              {/* 📆 Registrar Série */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-gray-700 font-medium mb-2">
                  Registrar Série de Ensaios
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Início dos Ensaios
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Hora do Ensaio
                    </label>
                    <input
                      type="time"
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  {role === "admin" && (
                    <button
                      onClick={() => handleSaveSeries(event)}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                    >
                      Salvar Série
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">Nenhum evento futuro encontrado.</p>
      )}

      {/* 💾 Mensagem de sucesso */}
      {message && (
        <div className="mt-4 p-3 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm">
          {message}
        </div>
      )}

      {/* 📋 Lista de séries registradas */}
      {seriesList.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Séries Registradas
          </h2>
          <div className="space-y-3">
            {seriesList.map((serie) => (
              <div
                key={serie.id}
                className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">{serie.title}</p>

                  {editingId === serie.id ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="date"
                        value={editingStartDate}
                        onChange={(e) => setEditingStartDate(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                      <input
                        type="time"
                        value={editingHour}
                        onChange={(e) => setEditingHour(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => handleUpdateSeries(serie.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(serie.startDate).toLocaleDateString("pt-BR")} às{" "}
                      {serie.hour}
                    </p>
                  )}

                  {/* ✅ Botões de confirmação de presença - visível apenas para usuários */}
                  {role === "user" && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleConfirmPresence(serie.id, "Confirmou presença")}
                        disabled={confirmedSeries.includes(serie.id)}
                        className={`px-3 py-1 rounded text-white transition-colors ${
                          confirmedSeries.includes(serie.id)
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        Confirmar Presença
                      </button>
                      <button
                        onClick={() => handleConfirmPresence(serie.id, "Não Disponível")}
                        disabled={confirmedSeries.includes(serie.id)}
                        className={`px-3 py-1 rounded text-white transition-colors ${
                          confirmedSeries.includes(serie.id)
                            ? "bg-red-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        Não Disponível
                      </button>
                    </div>
                  )}


                </div>

                {role === "admin" && editingId !== serie.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(serie.id);
                        setEditingStartDate(
                          new Date(serie.startDate).toISOString().split("T")[0]
                        );
                        setEditingHour(serie.hour);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    > 
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSeries(serie.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Deletar
                    </button>

                    {role === "admin" && (
                      <button
                        onClick={() => handleViewPresences(serie.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Ver Lista de Confirmados
                      </button>
                    )}

                  </div>
                )}
              </div>
            ))}

            {/* ✅ Lista visual de presenças */}
            {role === "admin" && selectedPresencas.length > 0 && (
              <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white mb-3">Lista de Presenças</h3>
                <table className="w-full text-sm text-gray-200">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Nome</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Confirmação de Presença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPresencas.map((p) => (
                      <tr
                        key={p.id}
                        className={`border-b border-gray-700 ${
                          p.confirmacaoAdmin ? "bg-gray-700/30 opacity-70" : "hover:bg-gray-700/30"
                        }`}
                      >
                        <td className="py-2">{p.nome}</td>
                        <td className="py-2">{p.email}</td>
                        <td className="py-2">
                          {p.status === "Confirmou presença" ? (
                            <span className="text-green-400 font-medium">{p.status}</span>
                          ) : p.status === "Não Disponível" ? (
                            <span className="text-red-400 font-medium">{p.status}</span>
                          ) : (
                            <span className="text-yellow-400 font-medium">{p.status}</span>
                          )}
                        </td>

                        <td className="py-2">
                          {p.confirmacaoAdmin ? (
                            <span className="text-blue-400 font-semibold">
                              Formulário preenchido ({p.confirmacaoAdmin})
                            </span>
                          ) : (
                            <div className="flex items-center space-x-4">
                              <label className="flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name={`confirmacao-${p.id}`}
                                  onChange={() =>
                                    handleConfirmacaoAdmin(selectedSeriesId, p.id, "Compareceu")
                                  }
                                  className="accent-green-500"
                                />
                                <span>Sim</span>
                              </label>
                              <label className="flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name={`confirmacao-${p.id}`}
                                  onChange={() =>
                                    handleConfirmacaoAdmin(selectedSeriesId, p.id, "Não Compareceu")
                                  }
                                  className="accent-red-500"
                                />
                                <span>Não</span>
                              </label>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Series;
