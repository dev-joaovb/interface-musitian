import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { GlobalWorkerOptions } from "pdfjs-dist";

// 🔧 Configura o caminho correto do worker (com '?url' para o Vite)
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
GlobalWorkerOptions.workerSrc = pdfWorkerSrc;


export default function Partitura() {
  const [partituras, setPartituras] = useState([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [thumbnailsGenerated, setThumbnailsGenerated] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("userToken");

    if (!token) return navigate("/login");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchPartituras = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/partitura", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPartituras(data);
      } catch {
        console.error("Erro ao buscar partituras");
      }
    };

    fetchPartituras();
  }, [navigate]);

    // 🔹 Gera miniaturas das partituras ao carregar
    useEffect(() => {
    // 💡 ATUALIZAÇÃO: Se as miniaturas já foram geradas, não faça nada.
    if (partituras.length === 0 || thumbnailsGenerated) return;

    const generateThumbnails = async (partiturasList) => {
        // Mapeia a lista de partituras para uma nova lista com as miniaturas
        const updated = await Promise.all(
        partiturasList.map(async (p) => {
            // Se a miniatura já existe (após um upload novo), pula.
            if (p.thumbnail !== undefined) return p;

            try {
            const fileUrl = `http://localhost:4000/api/partitura/file/${p.id}`;

            // 🔧 Garante que o worker esteja registrado
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
            }

            const token = localStorage.getItem("userToken");

            const response = await fetch(fileUrl, {
                headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
            });

            // Verifica se a resposta foi OK (evita erros com 404/401)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data }).promise;

            const page = await pdf.getPage(1);
            // 💡 Aumentei um pouco a escala (de 0.3 para 0.5) para melhor qualidade da miniatura, ajuste se necessário
            const viewport = page.getViewport({ scale: 0.5 }); 

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;
            const thumbnail = canvas.toDataURL();

            return { ...p, thumbnail };
            } catch (err) {
            console.error("Erro ao gerar miniatura para", p.nome, err);
            return { ...p, thumbnail: null };
            }
        })
        );
        
        // 💡 Atualiza o estado UMA ÚNICA VEZ com a lista completa de miniaturas
        setPartituras(updated);
        // 💡 Marca como gerado para evitar o loop
        setThumbnailsGenerated(true);
    };

    // 💡 Chamamos a função de geração APENAS se houver partituras e não tiver sido gerada
    generateThumbnails(partituras);

    // 💡 DEPENDÊNCIA: O useEffect rodará se a lista for carregada ou se um novo item for adicionado
    // O `thumbnailsGenerated` garante que a primeira leva não cause um loop infinito.
    }, [partituras, thumbnailsGenerated]); // Adicionar 'thumbnailsGenerated' à lista de dependências


  const handleUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");
    if (!file || file.type !== "application/pdf") {
      alert("Selecione apenas arquivos PDF!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("nome", nome);
    formData.append("descricao", descricao);

    const res = await fetch("http://localhost:4000/api/partitura/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      const nova = await res.json();
      setPartituras([nova, ...partituras]);
      setNome("");
      setDescricao("");
      setFile(null);

      setThumbnailsGenerated(false); // Reseta para gerar miniatura da nova partitura

    } else {
      alert("Erro ao enviar partitura");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("userToken");
    if (!window.confirm("Deseja realmente excluir esta partitura?")) return;

    const res = await fetch(`http://localhost:4000/api/partitura/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setPartituras(partituras.filter((p) => p.id !== id));
    } else {
      alert("Erro ao excluir partitura");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Botões de navegação */}
      <div className="flex justify-center items-center mb-6 space-x-4">
        <button
          onClick={() => (window.location.href = "/biblioteca")}
          className="bg-teal-600 hover:bg-teal-700 text-white w-12 h-10 rounded-full flex items-center justify-center shadow-md transition"
          title="Biblioteca Musical"
        >
          &lt;
        </button>
        <button
          onClick={() => (window.location.href = "/partitura")}
          className="bg-teal-600 hover:bg-teal-700 text-white w-12 h-10 rounded-full flex items-center justify-center shadow-md transition"
          title="Partituras"
        >
          &gt;
        </button>
      </div>

      <h1 className="text-3xl font-semibold text-gray-800 mb-4 text-center">
        Biblioteca de Partituras
      </h1>

      {/* Upload */}
      {user?.role === "admin" && (
        <form
            onSubmit={handleUpload}
            className="bg-white p-4 rounded-lg shadow-md mb-14 flex flex-col md:flex-row items-center gap-4"
        >
            <input
            type="text"
            placeholder="Nome da partitura"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border p-2 rounded w-full md:w-1/4"
            required
            />
            <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
            />
            <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded w-full md:w-1/4"
            required
            />
            <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow-md"
            >
            Enviar
            </button>
        </form>
      )}


      {/* Lista de partituras */}
      <div className="grid gap-8 justify-center md:grid-cols-4 lg:grid-cols-4">
        {partituras.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full">
            Nenhuma partitura enviada ainda.
            </p>
        ) : (
            partituras.map((p) => {
            const fileUrl = p.arquivoUrl?.startsWith("http")
                ? p.arquivoUrl
                : `http://localhost:4000${p.arquivoUrl || ""}`;

            return (
                <div
                key={p.id}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer w-70 transform transition duration-300 hover:scale-105 hover:brightness-90 hover:shadow-xl"
                onClick={() => {
                    setPdfUrl(fileUrl);
                    setShowPdf(true);
                }}
                >
                {/* Miniatura */}
                <div className="relative w-full h-95 bg-gray-100 flex items-center justify-center">
                    {p.thumbnail ? (
                    <img
                        src={p.thumbnail}
                        alt={p.nome}
                        className="w-full h-full object-cover"
                    />
                    ) : (
                    <span className="text-gray-400">Prévia indisponível</span>
                    )}
                </div>

                {/* Detalhes */}
                <div className="p-3">
                    <h3 className="text-base font-semibold text-gray-800 truncate">{p.nome}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {p.descricao || "Sem descrição"}
                    </p>

                    {user?.role === "admin" && (
                    <button
                        onClick={(e) => {
                        e.stopPropagation(); // impede abrir o PDF ao clicar em excluir
                        handleDelete(p.id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                    >
                        Excluir
                    </button>
                    )}
                </div>
                </div>
            );
            })
        )}
        </div>

        {/* Show Modal */}
        {showPdf && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 h-[90vh] flex flex-col">
                {/* Cabeçalho */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Visualizar Partitura</h2>
                    <div className="flex items-center gap-2">
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-teal-600 hover:underline"
                        title="Abrir em nova aba / fazer download"
                    >
                        Abrir em nova aba
                    </a>
                    <button
                        onClick={() => {
                        setShowPdf(false);
                        setPdfUrl(null);
                        }}
                        className="text-gray-500 hover:text-gray-800 text-xl font-bold px-3"
                        aria-label="Fechar visualizador"
                    >
                        ×
                    </button>
                    
                    </div>
                </div>

                {/* Visualização do PDF usando <iframe> */}
                <div className="flex-1 overflow-hidden">
                <iframe
                    src={pdfUrl}
                    title="Visualizador de Partitura"
                    className="w-full h-full"
                    allow="fullscreen"
                />
                {/* Fallback se o navegador não suportar iframe/pdf */}
                <noscript>
                    <div className="p-6 text-center">
                    <p className="mb-4">Ative o JavaScript para visualizar o PDF.</p>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline"
                    >
                        Clique aqui para abrir a partitura.
                    </a>
                    </div>
                </noscript>
                </div>
                </div>
            </div>
            )}

    </div>
  );
}
