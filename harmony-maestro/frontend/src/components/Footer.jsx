import React from "react";
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
      &copy; {new Date().getFullYear()} Feito por João Victor. Todos os direitos reservados.
    </footer>
  );
}
