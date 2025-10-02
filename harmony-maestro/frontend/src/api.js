import axios from "axios";

// Se estiver usando Vite, o proxy pode redirecionar /api para o backend.
// Exemplo: no vite.config.js você configura o proxy (posso te mandar depois).
// Aqui basta usar "/api".

const api = axios.create({
  baseURL: "/api", // 🔹 prefixo, não precisa colocar localhost:5000 toda vez
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
