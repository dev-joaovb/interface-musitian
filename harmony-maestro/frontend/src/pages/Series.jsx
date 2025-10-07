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

  // 📦 Carregar eventos do backend (somente futuros)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/calendar");
        const data = await res.json();
        const today = new Date();
        const upcoming = data.filter((e) => new Date(e.date) >= today);
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
    try {
      const res = await fetch("http://localhost:4000/api/series");
      const data = await res.json();

      // ✅ Ordenar do mais antigo para o mais recente
      const sortedData = data.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );

      setSeriesList(sortedData);
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

  try {
    const res = await fetch("http://localhost:4000/api/series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    // ✅ Adiciona a nova série e mantém a ordem crescente (mais antigo → mais recente)
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
    try {
      const res = await fetch(`http://localhost:4000/api/series/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    try {
      await fetch(`http://localhost:4000/api/series/${id}`, { method: "DELETE" });
      setSeriesList((prev) => prev.filter((s) => s.id !== id));
      setMessage("✅ Série deletada com sucesso!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao deletar série");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Séries de Ensaios
      </h1>

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
                  <button
                    onClick={() => handleSaveSeries(event)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                  >
                    Salvar Série
                  </button>
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
                </div>

                {editingId !== serie.id && (
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
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Series;
