import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


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

// 📄 Função para gerar o PDF do relatório completo (no mesmo formato visível na tela)
const gerarPDF = () => {
  if (!eventos.length) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const logoUrl = "/logo-light.png"; // fallback: se não carregar, segue sem logo

  // pega o responsável do primeiro evento (todos são do mesmo grupo)
  const responsavel = eventos[0]?.responsavel;
  const nomeResponsavel = responsavel?.name || "Usuário Responsável";
  const emailResponsavel = responsavel?.email || "";

  // tenta adicionar logo (não bloqueante)
  try {
    // addImage exige dados binários; em alguns setups o caminho público funciona direto
    // se não funcionar, o try/catch evita quebrar o PDF
    doc.addImage(logoUrl, "PNG", 40, 30, 60, 60);
  } catch (e) {
    // ignora erro de logo
    // console.warn("Logo não carregada no PDF:", e.message);
  }

  // cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Relatório de Eventos — ${month.toUpperCase()} / ${year}`, 120, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Responsável: ${nomeResponsavel}`, 120, 64);
  if (emailResponsavel) doc.text(`E-mail: ${emailResponsavel}`, 120, 78);

  // cursor vertical em pontos
  let y = 110;

  eventos.forEach((ev, index) => {
    // função para garantir espaço em página
    const ensurePageSpace = (needed = 140) => {
      // A4 height ~ 842pt, deixamos margem inferior ~ 60pt
      if (y + needed > 780) {
        doc.addPage();
        y = 40;
      }
    };

    ensurePageSpace(120);

    // === Cabeçalho do Card do Evento ===
    doc.setDrawColor(220);
    doc.setFillColor(245, 247, 250);
    // retângulo de destaque (não obrigatório)
    try {
      doc.roundedRect(40, y, 520, 30, 6, 6, "F");
    } catch (e) {
      // alguns builds do jspdf podem não ter roundedRect — cai para rect
      doc.rect(40, y, 520, 30, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(`${index + 1}. ${ev.title}`, 52, y + 20);

    // status colorido no canto direito
    const statusColor =
      (ev.status && ev.status.toLowerCase().includes("concl")) // Concluído
        ? [34, 197, 94]
        : (ev.status && ev.status.toLowerCase().includes("cancel"))
        ? [239, 68, 68]
        : [59, 130, 246];

    doc.setFillColor(...statusColor);
    doc.setTextColor(255, 255, 255);
    const statusText = ev.status || "";
    const textWidth = doc.getTextWidth(statusText);
    const rectW = Math.min(textWidth + 12, 140); // limita largura para não extrapolar
    doc.rect(540 - rectW, y + 8, rectW, 16, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(statusText, 540 - rectW + 6, y + 20);

    doc.setTextColor(0, 0, 0);
    y += 45;

    // === Informações do Evento ===
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(ev.date).toLocaleString("pt-BR")}`, 52, y);
    y += 14;
    if (ev.location) {
      doc.text(`Local: ${ev.location}`, 52, y);
      y += 14;
    }
    if (ev.description) {
      const descLines = doc.splitTextToSize(ev.description, 480);
      doc.text(descLines, 52, y);
      y += descLines.length * 12 + 6;
    }

    // separador linha
    ensurePageSpace(30);
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(40, y, 555, y);
    y += 14;

    // === Relatório de Presenças ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Relatório de Presenças", 52, y);
    y += 12;

    // captura das séries - tenta várias propriedades que já usamos
    const series =
      (Array.isArray(ev.presencas) && ev.presencas.length > 0 && ev.presencas) ||
      (Array.isArray(ev.attendanceResumoGlobal) && ev.attendanceResumoGlobal.length > 0 && ev.attendanceResumoGlobal) ||
      (Array.isArray(ev.attendanceResumo) && ev.attendanceResumo.length > 0 && ev.attendanceResumo) ||
      [];

    if (series.length > 0) {
      // percorre cada série
      for (let sIndex = 0; sIndex < series.length; sIndex++) {
        const serie = series[sIndex];
        ensurePageSpace(160);

        // determina data/título/campo de presenças corretos conforme estrutura
        const dataSerieRaw = serie.serieData ?? serie.dataSerie ?? serie.startDate ?? null;
        const dataSerie = dataSerieRaw ? new Date(dataSerieRaw).toLocaleDateString("pt-BR") : "Data não disponível";
        const tituloSerie = serie.serieTitulo ?? serie.title ?? `Série ${sIndex + 1}`;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text(`${tituloSerie} — ${dataSerie}`, 58, y);
        y += 10;

        // pega array de presenças (vários nomes possíveis: presencas, registros, reports)
        const presencasArray =
          (Array.isArray(serie.presencas) && serie.presencas) ||
          (Array.isArray(serie.registros) && serie.registros) ||
          (Array.isArray(serie.reports) && serie.reports) ||
          [];

        if (!presencasArray.length) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(107, 114, 128);
          doc.text("Nenhum registro de presença nesta série.", 60, y + 8);
          y += 20;
          continue;
        }

        // monta body para a tabela
        const body = presencasArray.map((r) => [
          r.nome ?? r.userName ?? r.user?.name ?? "",
          r.email ?? r.userEmail ?? r.user?.email ?? "",
          r.status ?? "",
          r.confirmacaoAdmin ?? "-",
        ]);

        // chama autoTable (usando a função importada)
        autoTable(doc, {
          startY: y + 4,
          margin: { left: 52, right: 40 },
          head: [["Nome", "E-mail", "Status", "Confirmação Admin"]],
          body,
          styles: { fontSize: 9, cellPadding: 4, textColor: [17, 24, 39] },
          headStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: "bold" },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          theme: "grid",
          // controla largura das colunas para não estourar
          columnStyles: {
            0: { cellWidth: 160 }, // Nome
            1: { cellWidth: 180 }, // E-mail
            2: { cellWidth: 80 },  // Status
            3: { cellWidth: 80 },  // Confirmação
          },
          tableWidth: "auto",
        });

        // atualiza cursor y com base na última tabela desenhada
        y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : y + 20;

        // checa quebra de página
        if (y > 760) {
          doc.addPage();
          y = 40;
        }
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text("Nenhuma série registrada para este evento.", 52, y);
      y += 18;
    }

    // separador entre eventos
    ensurePageSpace(20);
    doc.setDrawColor(220);
    doc.line(40, y, 560, y);
    y += 24;
  });

  // salva arquivo
  doc.save(`Relatorio_Eventos_${month}_${year}.pdf`);
};


  return (
  <div className="p-8 max-w-6xl mx-auto dark:text-gray-200">
    {/* Cabeçalho da página */}
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
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
      <p className="text-gray-500 dark:text-gray-400 text-lg text-center mt-20">
        Nenhum evento realizado neste mês.
      </p>
    ) : (
      <div className="grid gap-8">
        {eventos.map((ev) => {
          const resumo = ev.attendanceResumoGlobal || ev.attendanceResumo;

          return (
            <div
              key={ev.id}
              className="bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
            >
              {/* Título e status */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {ev.title}
                </h2>
                <span
                  className="px-3 py-1 rounded-full text-white text-xs font-medium shadow"
                  style={{ backgroundColor: ev.color || "#3b82f6" }}
                >
                  {ev.status}
                </span>
              </div>

              {/* Informações básicas */}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                📅 {new Date(ev.date).toLocaleString("pt-BR")}
              </p>
              {ev.location && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  📍 {ev.location}
                </p>
              )}
              {ev.description && (
                <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {ev.description}
                </p>
              )}

              {/* 🔹 Resumo geral de presenças (se existir) */}
              {resumo && resumo.totalParticipantes && (
                <div className="mt-4 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Resumo Geral de Presenças
                  </h3>
                  <div className="flex flex-wrap gap-6 text-sm text-gray-700 dark:text-gray-200">
                    <span>
                      <strong>Total:</strong> {resumo.totalParticipantes}
                    </span>
                    <span className="text-green-700 dark:text-green-400">
                      <strong>Compareceram:</strong> {resumo.compareceram}
                    </span>
                    <span className="text-red-700 dark:text-red-400">
                      <strong>Faltaram:</strong> {resumo.faltaram}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Aguardando:</strong> {resumo.aguardando}
                    </span>
                  </div>
                </div>
              )}

              {/* 🔹 Relatório de Presenças (séries) */}
              {Array.isArray(ev.presencas) && ev.presencas.length > 0 ? (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    🎵 Séries de Ensaios e Presenças
                  </h3>

                  {ev.presencas.map((serie, idx) => (
                    <div
                      key={idx}
                      className="mb-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                    >
                      <h4 className="text-gray-800 dark:text-gray-100 font-medium text-sm mb-3">
                        Série:{" "}
                        <span className="font-semibold">
                          {serie.serieTitulo || "Sem título"}
                        </span>{" "}
                        —{" "}
                        {serie.serieData
                          ? new Date(serie.serieData).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "Data não informada"}
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse rounded-xl overflow-hidden">
                          <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                              <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left w-1/4">
                                Nome
                              </th>
                              <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left w-1/3">
                                E-mail
                              </th>
                              <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center w-1/6">
                                Status
                              </th>
                              <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center w-1/6">
                                Confirmação Admin
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {serie.presencas && serie.presencas.length > 0 ? (
                              serie.presencas.map((r, i) => (
                                <tr
                                  key={i}
                                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all"
                                >
                                  <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 dark:text-gray-200">
                                    {r.nome}
                                  </td>
                                  <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 dark:text-gray-200">
                                    {r.email}
                                  </td>
                                  <td
                                    className={`border border-gray-200 dark:border-gray-600 px-3 py-2 text-center ${
                                      r.status === "Confirmou presença"
                                        ? "text-green-600 dark:text-green-400"
                                        : r.status === "Não Disponível"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-gray-600 dark:text-gray-300"
                                    }`}
                                  >
                                    {r.status}
                                  </td>
                                  <td
                                    className={`border border-gray-200 dark:border-gray-600 px-3 py-2 text-center ${
                                      r.confirmacaoAdmin === "Compareceu"
                                        ? "text-green-600 dark:text-green-400"
                                        : r.confirmacaoAdmin === "Não Compareceu"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    {r.confirmacaoAdmin || "-"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center text-gray-500 dark:text-gray-400"
                                >
                                  Nenhum registro de presença nesta série.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
                  Nenhuma série registrada para este evento.
                </p>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
);
}
