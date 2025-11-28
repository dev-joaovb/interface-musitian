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


// 🌀 Loader global com Tailwind
function Loader({ isVisible }) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-900/80 z-[9999] transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600 dark:text-gray-300">Carregando...</p>
      </div>
    </div>
  );
}

// 🎯 Controla o delay e adiciona o fade-in
function PageTransitionWrapper({ children }) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setFadeIn(false);

    const timeout = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setFadeIn(true), 100); // ativa o fade-in suave
    }, 700);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <>
      <Loader isVisible={isLoading} />
      <div
        className={`transition-opacity duration-700 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        {!isLoading && children}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <PageTransitionWrapper>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/biblioteca" element={<Biblioteca />} />
                      <Route path="/partitura" element={<Partitura />} />
                      <Route path="/series" element={<Series />} />
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
        </PageTransitionWrapper>
      </Router>
    </ThemeProvider>
  );
}
