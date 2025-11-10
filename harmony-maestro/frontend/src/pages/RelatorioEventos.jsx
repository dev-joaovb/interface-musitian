import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

  // 📄 Função para gerar o PDF do relatório completo
  const gerarPDF = () => {
    if (!eventos.length) return;

    const doc = new jsPDF();
    const logoUrl = "/logo-vide.png"; // coloque o logo da VIDE na pasta public

    // Pega o responsável do primeiro evento (todos são do mesmo grupo)
    const responsavel = eventos[0]?.responsavel;
    const nomeResponsavel = responsavel?.name || "Usuário Responsável";
    const emailResponsavel = responsavel?.email || "";

    // Adiciona logo no topo (x, y, largura, altura)
    doc.addImage(logoUrl, "PNG", 14, 10, 25, 25);

    // Cabeçalho com título e usuário
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Relatório de Eventos — ${month.toUpperCase()} / ${year}`, 45, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Responsável: ${nomeResponsavel}`, 45, 28);
    if (emailResponsavel) doc.text(`E-mail: ${emailResponsavel}`, 45, 34);

    let y = 45; // inicia o conteúdo abaixo do cabeçalho

    eventos.forEach((ev, index) => {
      // Título do evento
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`${index + 1}. ${ev.title}`, 14, y);
      y += 6;

      // Data, local e descrição
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Data: ${new Date(ev.date).toLocaleString("pt-BR")}`, 14, y);
      y += 6;
      if (ev.location) {
        doc.text(`Local: ${ev.location}`, 14, y);
        y += 6;
      }
      if (ev.description) {
        const descLines = doc.splitTextToSize(ev.description, 180);
        doc.text(descLines, 14, y);
        y += descLines.length * 6;
      }

      // Resumo de presença com nomes
      if (ev.attendanceResumo) {
        y += 4;
        const {
          totalParticipantes,
          compareceram,
          faltaram,
          aguardando,
          nomesParticipantes,
          nomesCompareceram,
          nomesFaltaram,
          nomesAguardando,
        } = ev.attendanceResumo;

        doc.text(
          `Total de Participantes: ${totalParticipantes} (${nomesParticipantes?.join(", ") || "-"})`,
          14,
          y
        );
        y += 6;
        doc.text(
          `Compareceram: ${compareceram} (${nomesCompareceram?.join(", ") || "-"})`,
          14,
          y
        );
        y += 6;
        doc.text(
          `Faltaram: ${faltaram} (${nomesFaltaram?.join(", ") || "-"})`,
          14,
          y
        );
        y += 6;
        doc.text(
          `Aguardando Resposta: ${aguardando} (${nomesAguardando?.join(", ") || "-"})`,
          14,
          y
        );
        y += 8;
      }

      // Tabela de presenças
      if (ev.attendanceReport?.length) {
        const tableData = ev.attendanceReport.map((r) => [
          r.userName || "",
          r.userEmail || "",
          r.status || "",
          r.confirmacaoAdmin || "-",
        ]);

        doc.autoTable({
          startY: y,
          head: [["Nome", "E-mail", "Status", "Confirmação Admin"]],
          body: tableData,
          styles: { fontSize: 9, cellPadding: 2 },
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246] },
        });

        y = doc.lastAutoTable.finalY + 10;
      } else {
        y += 8;
      }

      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`Relatorio_Eventos_${month}_${year}.pdf`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Relatório de Eventos — {month.toUpperCase()} / {year}
        </h1>
        {eventos.length > 0 && (
          <button
            onClick={gerarPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200"
          >
            📄 Baixar Relatório
          </button>
        )}
      </div>

      {/* Corpo dos eventos */}
      {eventos.length === 0 ? (
        <p className="text-gray-500 text-lg">Nenhum evento realizado neste mês.</p>
      ) : (
        <div className="grid gap-6">
          {eventos.map((ev) => (
            <div
              key={ev.id}
              className="bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">{ev.title}</h2>
                <span
                  className="px-3 py-1 rounded-full text-white text-xs font-medium shadow"
                  style={{ backgroundColor: ev.color || "#3b82f6" }}
                >
                  {ev.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                📅 {new Date(ev.date).toLocaleString("pt-BR")}
              </p>
              {ev.location && (
                <p className="text-sm text-gray-600 mt-1">📍 {ev.location}</p>
              )}
              {ev.description && (
                <p className="mt-3 text-gray-700 leading-relaxed">
                  {ev.description}
                </p>
              )}

              {ev.attendanceResumo && (
                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  <p>Total de Participantes: {ev.attendanceResumo.totalParticipantes}</p>
                  <p>Compareceram: {ev.attendanceResumo.compareceram}</p>
                  <p>Faltaram: {ev.attendanceResumo.faltaram}</p>
                  <p>Aguardando Resposta: {ev.attendanceResumo.aguardando}</p>
                </div>
              )}

              {ev.attendanceReport && ev.attendanceReport.length > 0 && (
                <div className="mt-5 border-t pt-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Relatório de Presenças
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-3 py-2 text-left">Nome</th>
                          <th className="border px-3 py-2 text-left">E-mail</th>
                          <th className="border px-3 py-2 text-center">Status</th>
                          <th className="border px-3 py-2 text-center">
                            Confirmação Admin
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ev.attendanceReport.map((r) => (
                          <tr
                            key={r.id}
                            className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-all"
                          >
                            <td className="border px-3 py-2">{r.userName}</td>
                            <td className="border px-3 py-2">{r.userEmail}</td>
                            <td
                              className={`border px-3 py-2 text-center ${
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
                              className={`border px-3 py-2 text-center ${
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
