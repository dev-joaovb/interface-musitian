// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

// 🔐 Componente de proteção de rotas
function ProtectedRoute({ children }) {
  const user = localStorage.getItem("userToken"); // ou "authUser", se preferir

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas (com layout principal) */}
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
    </Router>
  );
}
