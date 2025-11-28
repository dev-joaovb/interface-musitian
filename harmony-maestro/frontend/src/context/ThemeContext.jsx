// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light"); // light | dark

  // Carregar tema inicial do usuário logado
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const savedTheme = localStorage.getItem(`theme_user_${user.id}`);

    const initial = savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : "light";

    // aplica imediatamente ao documento
    applyTheme(initial);
    setTheme(initial);
  }, []);

  function applyTheme(value) {
    const html = document.documentElement;
    html.setAttribute("data-theme", value);
    html.classList.toggle("dark", value === "dark");

    // IMPORTANT: não gravar mais a chave global 'theme' aqui.
    // Isso evita efeitos colaterais entre usuários diferentes.
    // localStorage.setItem("theme", value); // <-- REMOVIDO
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);

    // grava por usuário (se possível)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      localStorage.setItem(`theme_user_${user.id}`, next);
    }
  }

  function setThemeAndApply(value) {
    setTheme(value);
    applyTheme(value);

    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      localStorage.setItem(`theme_user_${user.id}`, value);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeAndApply }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);