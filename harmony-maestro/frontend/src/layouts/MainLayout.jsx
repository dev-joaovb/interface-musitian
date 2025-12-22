import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";
import * as THREE from "three";

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const vantaRef = useRef(null);
  const vantaInstance = useRef(null);

  useEffect(() => {
    let cancelled = false;
    import("vanta/dist/vanta.waves.min").then((VANTA) => {
      if (cancelled) return;
      const v = (VANTA.default || VANTA)({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        color: 0x3b82f6,
        shininess: 35.0,
        waveHeight: 15.0,
        waveSpeed: 0.75,
        zoom: 0.65,
      });
      vantaInstance.current = v;
    }).catch((err) => {
      console.warn("Vanta load failed:", err);
    });

    return () => {
      cancelled = true;
      if (vantaInstance.current) vantaInstance.current.destroy();
    };
  }, []);

  return (
    // aplicamos bg-gray-50 aqui, que antes estava no <body>
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Vanta container: use style zIndex para forçar ficar atrás */}
      <div
        ref={vantaRef}
        className="wave-bg absolute top-0 left-0 w-full h-full"
        style={{ zIndex: -1 }}
        aria-hidden
      />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            /* Alterado: 
              bg-black/20 (opacidade de 20% em vez de 50%)
              backdrop-blur-sm (adiciona um desfoque suave no fundo)
            */
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
