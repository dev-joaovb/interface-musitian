import React from "react";
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} Harmony Maestro. Todos os direitos reservados.
    </footer>
  );
}
