import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Biblioteca from "./pages/Biblioteca";
import Series from "./pages/Series";
import Membros from "./pages/Membros";
import Notificacoes from "./pages/Notificacoes";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  return (
    <Router>
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
    </Router>
  );
}
