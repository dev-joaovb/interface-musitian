import React, { useEffect, useState } from "react";
import {
  FiCalendar,
  FiUsers,
  FiFileText,
  FiChevronRight,
  FiPlus,
  FiUpload,
  FiLayers,
  FiUserPlus,
  FiMusic,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import LinkWithReload from '../layouts/LinkWithReload.jsx';


export default function Dashboard() {
  const [data, setData] = useState(null);
  const [role, setRole] = useState(null);

  // 🔹 Carregar dados do backend
useEffect(() => {
  const token = localStorage.getItem("token");
    fetch("http://localhost:4000/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao carregar dashboard");
      return res.json();
    })
    .then((json) => {
      setData(json);
      setRole(json.role);
    })
    .catch((err) => console.error("Erro no fetch do Dashboard:", err));
}, []);


// 🔹 Estatísticas de presença em ensaios
// const [presencaData, setPresencaData] = useState(null);

// useEffect(() => {
//   const token = localStorage.getItem("token");
//   fetch("http://localhost:4000/api/dashboard/presencas", {
//     headers: { Authorization: `Bearer ${token}` },
//   })
//     .then((res) => res.json())
//     .then((json) => {
//       // converte os dados para formato de gráfico
//       const data = [
//         { status: "Confirmou Presença", valor: json.confirmados, cor: "#22c55e" },
//         { status: "Não Disponível", valor: json.naoDisponiveis, cor: "#ef4444" },
//         { status: "Aguardando Resposta", valor: json.aguardando, cor: "#facc15" },
//       ];
//       setPresencaData(data);
//     })
//     .catch((err) =>
//       console.error("Erro ao buscar dados de presença:", err)
//     );
// }, []);


// 🔹 Médias mensais de presença e falta
const [ano_Selecionado, setAno_Selecionado] = useState(new Date().getFullYear());
const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);

const [dadosFaltas, setDadosFaltas] = useState(null);

useEffect(() => {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:4000/api/dashboard/faltas/${ano_Selecionado}/${mesSelecionado}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((json) => setDadosFaltas(json))
    .catch((err) => console.error("Erro ao buscar faltas:", err));
}, [ano_Selecionado, mesSelecionado]);


// 🔹 Estatísticas de eventos por ano
const [eventosData, setEventosData] = useState([]);
const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

useEffect(() => {
  const token = localStorage.getItem("token");
  fetch(`http://localhost:4000/api/dashboard/eventos-realizados/${anoSelecionado}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then(setEventosData)
    .catch((err) => console.error("Erro ao buscar eventos realizados:", err));
}, [anoSelecionado]);

// Constante de duração do loader (deve ser a mesma usada no LinkWithReload e no Logout)
const LOADER_DURATION_MS = 400; 

// Função para navegação com loader e reload
const navigateWithReload = (path) => {
    // 1. Ativa o loader visualmente (por meio de um Context/Portal ou confiando no delay)
    
    // 2. Aguarda o tempo do Loader
    setTimeout(() => {
        // 3. Força a navegação com RELOAD (F5)
        window.location.href = path;
    }, LOADER_DURATION_MS);
};

  if (!data) return <p>Carregando...</p>;

  return (
  <div>
    {/* Header */}
    <div className="mb-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Dashboard</h1>
      <p className="text-base text-gray-600 dark:text-gray-300">
        Visão geral dos seus ensaios e atividades
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-teal-100 text-teal-600">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Próximo Evento</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {data.stats.nextEvent
                ? new Date(data.stats.nextEvent.date).toLocaleDateString("pt-BR")
                : "Nenhum agendado"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <FiUsers className="w-5 h-5" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Membros Ativos</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {data.stats.activeMembers}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <FiMusic className="w-5 h-5" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Músicas no Acervo</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {data.stats.songsCount}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <FiFileText className="w-5 h-5" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Partituras no Acervo</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {data.stats.partituraCount}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Próximos Ensaios */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Próximos Eventos</h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.upcomingEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Nenhum evento agendado até o momento
          </div>
        ) : (
          data.upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">{event.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString("pt-BR")} -{" "}
                    {new Date(event.date).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    | {event.location}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
                    {event.status}
                  </span>
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                    onClick={() => navigateWithReload('/series')}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
        <LinkWithReload
                to="/series"
                className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
              Ver todos os ensaios
          </LinkWithReload>
      </div>
    </div>

    {/* Quick Actions */}
    {role === "admin" ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <LinkWithReload
            to="/calendar"
            className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            <FiPlus className="w-5 h-5 text-teal-600 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-200">Novo Evento</span>
        </LinkWithReload>

        {/* Link: Upload de Música (para /biblioteca) */}
        <LinkWithReload
            to="/biblioteca"
            className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            <FiUpload className="w-5 h-5 text-teal-600 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-200">Upload de Música</span>
        </LinkWithReload>

        {/* Link: Nova Série (para /series) */}
        <LinkWithReload
            to="/series"
            className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            <FiLayers className="w-5 h-5 text-teal-600 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-200">Nova Série</span>
        </LinkWithReload>

        {/* Link: Adicionar Membro (para /membros) */}
        <LinkWithReload
            to="/membros"
            className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            <FiUserPlus className="w-5 h-5 text-teal-600 mr-2" />
            <span className="font-medium text-gray-700 dark:text-gray-200">Adicionar Membro</span>
        </LinkWithReload>
      </div>
    ) : (
      <div className="p-4 mb-6 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 text-center">
        Você está em um grupo — apenas o administrador pode criar ou editar dados.
      </div>
    )}

    {/* Gráfico de Presença */}
    {/* {presencaData && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Confirmação de Presença nos Ensaios
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={presencaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="valor"
              name="Número de usuários"
              fill="#0d9488"
              barSize={60}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex justify-center mt-4 space-x-4 text-sm">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Confirmou Presença
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Não Disponível
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
            Aguardando Resposta
          </span>
        </div>
      </div>
    )} */}

    {/* Gráfico de Faltas */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Médias de Presença e Faltas — {mesSelecionado}/{ano_Selecionado}
        </h2>

        <div className="flex space-x-4">
          <select
            className="border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={ano_Selecionado}
            onChange={(e) => setAno_Selecionado(e.target.value)}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>

          <select
            className="border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
          >
            {[
              "01 - Janeiro",
              "02 - Fevereiro",
              "03 - Março",
              "04 - Abril",
              "05 - Maio",
              "06 - Junho",
              "07 - Julho",
              "08 - Agosto",
              "09 - Setembro",
              "10 - Outubro",
              "11 - Novembro",
              "12 - Dezembro",
            ].map((m, index) => (
              <option key={index} value={index + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {dadosFaltas && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              {
                name: "Mês Selecionado",
                Falta: Number(dadosFaltas.mediaFaltas.toFixed(2)),
                Presença: Number(dadosFaltas.mediaPresencas.toFixed(2)),
              },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(valor) => `${valor}%`} />
            <Legend />
            <Bar dataKey="Falta" fill="#ef4444" barSize={40} />
            <Bar dataKey="Presença" fill="#22c55e" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>

    {/* Gráfico de Eventos Realizados */}
    {eventosData && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Eventos Realizados — {anoSelecionado}
          </h2>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md p-2 text-sm"
          >
            {[2023, 2024, 2025].map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={eventosData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="eventos"
              name="Eventos Realizados"
              fill="#10b981"
              barSize={60}
              radius={[8, 8, 0, 0]}
              onClick={(data) => {
                const mes = data.mes;
                window.location.href = `/relatorio/eventos/${anoSelecionado}/${mes}`;
              }}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}

    {/* Atividades Recentes */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Atividade Recente
        </h2>
        {role === "admin" && (
          <button
            onClick={async () => {
              const token = localStorage.getItem("token");
              if (window.confirm("Tem certeza que deseja limpar atividades antigas (90+ dias)?")) {
                const res = await fetch("http://localhost:4000/api/activity/clear", {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                alert(data.message || "Limpeza concluída!");
              }
            }}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-bold shadow-sm"
          >
            🧹 Limpar atividades antigas
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.recentActivities.map((a) => (
          <div key={a.id} className="p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-100">
                  {a.user?.name?.[0] ?? "?"}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {a.message}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
