import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function RelatorioEventos() {
  const { year, month } = useParams();
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:4000/api/dashboard/relatorio/eventos/${year}/${month}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setEventos)
      .catch((err) => console.error("Erro ao buscar relatório de eventos:", err));
  }, [year, month]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Relatório de Eventos Realizados — {month.toUpperCase()} / {year}
      </h1>

      {eventos.length === 0 ? (
        <p className="text-gray-500">Nenhum evento realizado neste mês.</p>
      ) : (
        <div className="grid gap-4">
          {eventos.map((ev) => (
            <div key={ev.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-medium">{ev.title}</h2>
              <p className="text-sm text-gray-600">
                📅 {new Date(ev.date).toLocaleString("pt-BR")}
              </p>
              {ev.location && <p className="text-sm">📍 {ev.location}</p>}
              {ev.description && <p className="mt-2 text-gray-700">{ev.description}</p>}
              {ev.presencasResumo && (
                <div className="mt-3 text-sm text-gray-700">
                    <p>✅ Confirmaram presença: {ev.presencasResumo.confirmados}</p>
                    <p>❌ Não disponíveis: {ev.presencasResumo.naoDisponiveis}</p>
                </div>
                )}

                {ev.faltasResumo && (
                <div className="mt-2 text-sm text-gray-700">
                    <p>👥 Presentes: {ev.faltasResumo.presentes}</p>
                    <p>🚫 Faltaram: {ev.faltasResumo.faltaram}</p>
                </div>
                )}

                {ev.membros && ev.membros.length > 0 && (
                <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-600">Membros participantes:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                    {ev.membros.map((m) => (
                        <li key={m.id}>{m.name}</li>
                    ))}
                    </ul>
                </div>
                )}
              <span
                className={`inline-block mt-2 px-3 py-1 rounded text-white text-xs`}
                style={{ backgroundColor: ev.color || "#3b82f6" }}
              >
                {ev.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
