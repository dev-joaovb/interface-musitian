// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { LogIn } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Se já estiver logado, redireciona direto para o painel
    const token = localStorage.getItem("userToken");
    if (token) navigate("/");
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer login");

      // Salva o token e usuário
      localStorage.setItem("token", data.token);
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userPass", formData.password);

      // 🔹 Salva o token e informações do usuário
      localStorage.setItem("userId", data.user.id);   // ✅ Salva o ID do usuário logado
      localStorage.setItem("role", data.user.role);   // ✅ Salva o papel (user/admin)

      // Redireciona
      navigate("/");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Bem-vindo de volta
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Acesse sua conta para continuar
        </p>

        {message && (
          <div
            className={`mb-4 text-sm text-center ${
              message.includes("Erro") ? "text-red-500" : "text-teal-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg flex justify-center items-center transition-all duration-300"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Entrar
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Ainda não tem conta?{" "}
          <Link to="/register" className="text-teal-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
