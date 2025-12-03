// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import LinkWithReload from '../layouts/LinkWithReload.jsx';


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    sexo: "",
    experiencia: "",
    instrumento: "",
    instrumentosQtd: "",
    idade: "",
    disponibilidade: "",
    celular: "",
    });
  const [message, setMessage] = useState("");

  // Função que formata o valor para (99) 99999-9999 enquanto o usuário digita
  const formatPhoneInput = (value) => {
    const digits = (value || "").replace(/\D/g, "").slice(0, 11); // só dígitos, máximo 11
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    // 11 dígitos
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Handler específico para o campo celular
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const formatted = formatPhoneInput(raw);
    setFormData((prev) => ({ ...prev, celular: formatted }));
  };

  // Validação rápida que garante 11 dígitos (útil no submit)
  const isPhoneValid = (phone) => {
    const digits = (phone || "").replace(/\D/g, "");
    return digits.length === 11;
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) navigate("/");
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const LOADER_DURATION_MS = 400;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // valida celular (se preenchido)
    if (formData.celular && !isPhoneValid(formData.celular)) {
      setMessage("Por favor, informe um número de celular válido com 11 dígitos.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar usuário");

      // (Opcional) login automático após cadastro:
      // localStorage.setItem("userToken", data.token);
      // localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("✅ Cadastro realizado com sucesso! Redirecionando para o login...");
      //setTimeout(() => navigate("/login"), 1500);
      setTimeout(() => {
        // Redireciona para /login forçando o reload (F5)
        window.location.href = "/login";
    }, LOADER_DURATION_MS);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Crie sua conta
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Participe do grupo e gerencie seus eventos
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
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
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

          {/* Sexo */}
          <div>
            <label className="text-sm font-medium text-gray-700">Sexo</label>
            <select
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          {/* Experiência como músico */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Experiência (em anos)
            </label>
            <input
              type="number"
              name="experiencia"
              value={formData.experiencia}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* 🎵 Instrumento principal */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Instrumento principal
            </label>
            <select
              name="instrumento"
              value={formData.instrumento}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
            >
              <option value="">Selecione seu instrumento</option>

              {/* 🎸 Cordas */}
              <optgroup label="🎸 Cordas">
                <option value="Violão">Violão</option>
                <option value="Guitarra">Guitarra</option>
                <option value="Baixo">Baixo</option>
                <option value="Contrabaixo">Contrabaixo</option>
                <option value="Violino">Violino</option>
                <option value="Viola">Viola</option>
                <option value="Violoncelo">Violoncelo</option>
                <option value="Harpa">Harpa</option>
              </optgroup>

              {/* 🎷 Sopros */}
              <optgroup label="🎷 Sopros">
                <option value="Flauta doce">Flauta doce</option>
                <option value="Flauta transversal">Flauta transversal</option>
                <option value="Clarinete">Clarinete</option>
                <option value="Saxofone alto">Saxofone alto</option>
                <option value="Saxofone tenor">Saxofone tenor</option>
                <option value="Oboé">Oboé</option>
                <option value="Fagote">Fagote</option>
                <option value="Trompete">Trompete</option>
                <option value="Trombone">Trombone</option>
                <option value="Tuba">Tuba</option>
                <option value="Cornetim">Cornetim</option>
                <option value="Trompa">Trompa</option>
                <option value="Gaita">Gaita</option>
              </optgroup>

              {/* 🥁 Percussão */}
              <optgroup label="🥁 Percussão">
                <option value="Bateria">Bateria</option>
                <option value="Cajón">Cajón</option>
                <option value="Pandeiro">Pandeiro</option>
                <option value="Tamborim">Tamborim</option>
                <option value="Congas">Congas</option>
                <option value="Bongo">Bongo</option>
                <option value="Tímpano">Tímpano</option>
                <option value="Pratos">Pratos</option>
                <option value="Triângulo">Triângulo</option>
              </optgroup>

              {/* 🎹 Teclas */}
              <optgroup label="🎹 Teclas">
                <option value="Piano">Piano</option>
                <option value="Teclado">Teclado</option>
                <option value="Órgão">Órgão</option>
                <option value="Cravo">Cravo</option>
                <option value="Acordeon">Acordeon</option>
              </optgroup>

              {/* 🎤 Vocais */}
              <optgroup label="🎤 Vocais">
                <option value="Vocal">Vocal</option>
                <option value="Back vocal">Back vocal</option>
                <option value="Tenor">Tenor</option>
                <option value="Soprano">Soprano</option>
                <option value="Contralto">Contralto</option>
                <option value="Baixo (voz)">Baixo (voz)</option>
              </optgroup>

              {/* 🎺 Outros / regionais */}
              <optgroup label="🌍 Outros instrumentos">
                <option value="Ukulele">Ukulele</option>
                <option value="Bandolim">Bandolim</option>
                <option value="Cavaquinho">Cavaquinho</option>
                <option value="Percussão geral">Percussão geral</option>
                <option value="Outros">Outros</option>
              </optgroup>
            </select>
          </div>


          {/* Quantos instrumentos toca */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Quantos instrumentos sabe tocar
            </label>
            <input
              type="number"
              name="instrumentosQtd"
              value={formData.instrumentosQtd}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Idade */}
          <div>
            <label className="text-sm font-medium text-gray-700">Data de Nascimento</label>
            <input
              type="date"
              name="idade"
              value={formData.idade}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Disponibilidade */}
          <div>
            <label className="text-sm font-medium text-gray-700">Disponibilidade</label>
            <input
              type="text"
              name="disponibilidade"
              value={formData.disponibilidade}
              onChange={handleChange}
              placeholder="Ex: Noites e finais de semana"
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Número de celular */}
          <div>
            <label className="text-sm font-medium text-gray-700">Celular</label>
            <input
              type="tel"
              name="celular"
              inputMode="tel"
              value={formData.celular}
              onChange={handlePhoneChange}
              placeholder="(00) 90000-0000"
              maxLength={16} // formação: (99) 99999-9999 => 15-16 chars incluindo espaços/hífens
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Formato: (DD) 9XXXX-XXXX — 11 dígitos
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg flex justify-center items-center transition-all duration-300"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Cadastrar
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Já tem uma conta?{" "}
          <LinkWithReload
                to="/login"
                className="text-teal-600 hover:underline">
              Fazer Login
            </LinkWithReload>
        </p>
      </div>
    </div>
  );
};

export default Register;
