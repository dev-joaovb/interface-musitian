// App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Biblioteca from "./pages/Biblioteca";
import Series from "./pages/Series";
import Escalas from "./pages/Escalas";
import Membros from "./pages/Membros";
import Notificacoes from "./pages/Notificacoes";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Partitura from "./pages/Partitura";
import RelatorioEventos from "./pages/RelatorioEventos";
import { ThemeProvider } from "./context/ThemeContext";
import { Theme } from "@fullcalendar/core/internal";

// 🔐 Proteção de rotas
function ProtectedRoute({ children }) {
  const user = localStorage.getItem("userToken");
  if (!user) return <Navigate to="/login" replace />;
  return children;
}


// 🌀 Loader global com Tailwind (Movido para o topo do App, sempre pronto)
function GlobalLoader({ isVisible }) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center 
      bg-gray-100/80 dark:bg-gray-900/80 z-[9999] 
      transition-opacity duration-500 
      ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 dark:text-gray-300">Carregando...</p>
      </div>
    </div>
  );
}

export default function App() {

  const [initialLoading, setInitialLoading] = useState(true);

  // Simula o tempo mínimo de visualização do loader na carga inicial (pós-reload)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 400); // 500ms é um bom tempo de "transição de entrada"
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>

      <GlobalLoader isVisible={initialLoading} />

      <Router>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  {/* 💡 O conteúdo da página aparece somente após o loader inicial sumir */}
                  <div className={`transition-opacity duration-400 ${initialLoading ? 'opacity-0' : 'opacity-100'}`}></div>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/biblioteca" element={<Biblioteca />} />
                      <Route path="/partitura" element={<Partitura />} />
                      <Route path="/series" element={<Series />} />
                      <Route path="/escalas" element={<Escalas />} />
                      <Route path="/membros" element={<Membros />} />
                      <Route path="/notificacoes" element={<Notificacoes />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                      <Route path="/relatorio/eventos/:year/:month" element={<RelatorioEventos />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
      </Router>
    </ThemeProvider>
  );
}
