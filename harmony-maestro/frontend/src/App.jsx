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

// 🎯 PageTransitionWrapper (robusto, usa rAF + transitionDelay para evitar "flash")
function PageTransitionWrapper({ children }) {
  const location = useLocation();

  // controla o overlay loader
  const [showLoader, setShowLoader] = useState(true);
  // controla quando iniciar a animação do conteúdo (fade-in)
  const [playPageAnimation, setPlayPageAnimation] = useState(false);
  // força o conteúdo a estar "montado" e pronto para animar
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    // cada troca de rota reinicia o fluxo
    setShowLoader(true);
    setPlayPageAnimation(false);
    setContentReady(false);

    // 1) deixamos o conteúdo montar primeiro (pequeno delay de tick)
    // isso garante que o DOM do children exista antes de animar
    const mountTick = requestAnimationFrame(() => {
      // dá uma micro-pausa para o browser pintar o conteúdo
      setContentReady(true);
    });

    // 2) tempo mínimo que o loader ficará visível (ms)
    // ajuste 600 para ficar mais longo, 350 para mais curto
    const LOADER_MIN_MS = 900;

    // timer para iniciar fade-out do loader (reduzir sua opacidade)
    const t1 = setTimeout(() => {
      setShowLoader(false); // o Loader aplica transition-opacity
    }, LOADER_MIN_MS);

    // 3) depois do loader começar a sumir, TOQUE no page animation
    // adicionamos pequeno delay para garantir que o loader já esteja desaparecendo
    const t2 = setTimeout(() => {
      // espera o próximo frame para garantir paint antes da transição do conteúdo
      requestAnimationFrame(() => {
        setPlayPageAnimation(true);
      });
    }, LOADER_MIN_MS + 80); // 80ms depois do início do fade-out do loader

    return () => {
      cancelAnimationFrame(mountTick);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.pathname]);

  /**
   * Observações sobre as classes/estilos:
   * - O conteúdo fica sempre montado (evita pulo).
   * - Enquanto `contentReady` for false, aplicamos uma invisibilidade imediata (sem transição).
   * - Quando contentReady true e playPageAnimation false, deixamos opacity 0 (pronto para transição).
   * - Quando playPageAnimation true, aplicamos transition de opacidade+translate para um fade suave.
   *
   * Usamos estilos inline para controlar transitionDelay/Duration com precisão.
   */

  const transitionDuration = 700; // ms
  const transitionEasing = "cubic-bezier(.2,.8,.2,1)";

  // estilos dinâmicos do container que envolve as páginas
  const pageStyle = {
    transition: `opacity ${transitionDuration}ms ${transitionEasing}, transform ${transitionDuration}ms ${transitionEasing}`,
    // Se página ainda não está pronta para transição, escondemos sem transição
    opacity: contentReady ? (playPageAnimation ? 1 : 0) : 0,
    transform: contentReady ? (playPageAnimation ? "translateY(0px)" : "translateY(6px)") : "translateY(6px)",
    // força o browser a otimizar a animação
    willChange: "opacity, transform",
    // evita interação enquanto anima (o loader pode ainda estar sobrepondo)
    pointerEvents: showLoader ? "none" : "auto",
  };

  return (
    <>
      {/* Loader permanece no topo e controla seu próprio fade via classes */}
      <Loader isVisible={showLoader} />

      {/* Conteúdo: sempre montado, animado via style */}
      <div style={pageStyle}>
        {children}
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
