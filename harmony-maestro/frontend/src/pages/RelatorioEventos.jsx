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
              {ev.description && (
                <p className="mt-2 text-gray-700">{ev.description}</p>
              )}

              {ev.attendanceResumo && (
                <div className="mt-3 text-sm text-gray-700">
                  <p>👥 Total de Participantes: {ev.attendanceResumo.totalParticipantes}</p>
                  <p>✅ Compareceram: {ev.attendanceResumo.compareceram}</p>
                  <p>🚫 Faltaram: {ev.attendanceResumo.faltaram}</p>
                  <p>⌛ Aguardando Resposta: {ev.attendanceResumo.aguardando}</p>
                </div>
              )}

              {/* 👇 NOVO BLOCO — lista detalhada de presenças/ausências */}
              {ev.attendanceReport && ev.attendanceReport.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    📋 Relatório de Presenças:
                  </h3>
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1 text-left">Nome</th>
                        <th className="border px-2 py-1 text-left">E-mail</th>
                        <th className="border px-2 py-1 text-center">Status</th>
                        <th className="border px-2 py-1 text-center">Confirmação Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ev.attendanceReport.map((r) => (
                        <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                          <td className="border px-2 py-1">{r.userName}</td>
                          <td className="border px-2 py-1">{r.userEmail}</td>
                          <td
                            className={`border px-2 py-1 text-center ${
                              r.status === "Confirmou presença"
                                ? "text-green-600"
                                : r.status === "Não Disponível"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {r.status}
                          </td>
                          <td
                            className={`border px-2 py-1 text-center ${
                              r.confirmacaoAdmin === "Compareceu"
                                ? "text-green-600"
                                : r.confirmacaoAdmin === "Não Compareceu"
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                          >
                            {r.confirmacaoAdmin || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {ev.membros && ev.membros.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Membros participantes:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {ev.membros.map((m) => (
                      <li key={m.id}>{m.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <span
                className="inline-block mt-3 px-3 py-1 rounded text-white text-xs"
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
