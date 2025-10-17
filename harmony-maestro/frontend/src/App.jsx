// App.jsx
import React, { useState, useEffect } from "react";
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

// 🔐 Protege rotas privadas
function ProtectedRoute({ children }) {
  const user = localStorage.getItem("userToken");
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// 🔹 Loader Global Reutilizável
function GlobalLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 transition-all">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium animate-pulse">
          Carregando...
        </p>
      </div>
    </div>
  );
}

// 🔹 Controla transição de páginas com delay suave
function PageWrapper({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // delay entre rotas
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return loading ? <GlobalLoader /> : children;
}

export default function App() {
  return (
    <Router>
      <PageWrapper>
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
                    <Route path="/series" element={<Series />} />
                    <Route path="/membros" element={<Membros />} />
                    <Route path="/notificacoes" element={<Notificacoes />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </PageWrapper>
    </Router>
  );
}
