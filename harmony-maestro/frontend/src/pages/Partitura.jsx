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

  const [pastas, setPastas] = useState([]);
  const [pastaAberta, setPastaAberta] = useState(null);
  const [novaPastaNome, setNovaPastaNome] = useState("");
  const [editarPastaData, setEditarPastaData] = useState(null);


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
        
        // setPartituras(data);
        
        // Filtra apenas partituras sem pasta
        setPartituras(data.filter((p) => !p.folderId));

      } catch {
        console.error("Erro ao buscar partituras");
      }
    };

    const fetchPastas = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/partitura/pastas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPastas(data);
        } else {
          console.error("Erro ao carregar pastas:", await res.text());
        }
      } catch (err) {
        console.error("Erro ao carregar pastas", err);
      }
    };

    fetchPartituras();
    fetchPastas();
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

      // Atualiza lista de pastas (caso backend crie algo relacionado)
      const pastasRes = await fetch("http://localhost:4000/api/partitura/pastas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pastasRes.ok) setPastas(await pastasRes.json());

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

      // Atualiza também pasta aberta se necessário
      if (pastaAberta) {
        setPastaAberta({
          ...pastaAberta,
          partituras: pastaAberta.partituras.filter((p) => p.id !== id),
        });
      }
    } else {
      alert("Erro ao excluir partitura");
    }
  };

    // ----------------------
  // PASTAS: criar / editar / excluir / abrir
  // ----------------------
  const criarPasta = async (nomePasta) => {
    if (!nomePasta) {
      alert("Nome da pasta obrigatório");
      return;
    }
    const token = localStorage.getItem("userToken");
    try {
      const res = await fetch("http://localhost:4000/api/partitura/pastas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: nomePasta }),
      });

      if (res.ok) {
        const nova = await res.json();
        setPastas((prev) => [nova, ...prev]);
        setNovaPastaNome("");
        // opcional forçar reload para manter consistência com backend
        window.location.reload();
      } else {
        console.error("Erro ao criar pasta:", await res.text());
      }
    } catch (err) {
      console.error("Erro ao criar pasta:", err);
    }
  };

  const abrirPasta = (folder) => {
    setPastaAberta(folder);
  };

  const excluirPasta = async (id) => {
    const token = localStorage.getItem("userToken");
    if (!window.confirm("Tem certeza que deseja excluir esta pasta e desassociar as partituras?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/partitura/pastas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPastas((prev) => prev.filter((p) => p.id !== id));
        if (pastaAberta && pastaAberta.id === id) setPastaAberta(null);
        window.location.reload();
      } else {
        console.error("Erro ao excluir pasta:", await res.text());
      }
    } catch (err) {
      console.error("Erro ao excluir pasta:", err);
    }
  };

  const editarPasta = async (id, novoNome) => {
    const token = localStorage.getItem("userToken");
    try {
      const res = await fetch(`http://localhost:4000/api/partitura/pastas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: novoNome }),
      });

      if (res.ok) {
        const atualizado = await res.json();
        setPastas((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
        setEditarPastaData(null);
        window.location.reload();
      } else {
        console.error("Erro ao editar pasta:", await res.text());
      }
    } catch (err) {
      console.error("Erro ao editar pasta:", err);
    }
  };

  // ----------------------
  // Drag & Drop (mover partituras para pastas)
  // ----------------------
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("partituraId", id);
  };

  const handleDrop = async (e, folderId) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");
    const partituraId = Number(e.dataTransfer.getData("partituraId"));

    if (!partituraId) return;

    try {
      const res = await fetch(`http://localhost:4000/api/partitura/mover/${partituraId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folderId }), // se quiser remover da pasta envie null (backend precisa aceitar)
      });

      if (!res.ok) {
        console.error("Erro ao mover partitura:", await res.text());
        return;
      }

      const moved = await res.json();

      // Remove da lista principal (partituras sem pasta)
      setPartituras((prev) => prev.filter((p) => p.id !== partituraId));

      // Atualiza pastas localmente: adiciona a partitura movida na pasta correta
      setPastas((prev) =>
        prev.map((p) => (p.id === folderId ? { ...p, partituras: [...(p.partituras || []), moved] } : p))
      );

      // Se pastaAberta for a pasta destino, atualiza essa também
      if (pastaAberta && pastaAberta.id === folderId) {
        setPastaAberta((prev) => ({ ...prev, partituras: [...(prev.partituras || []), moved] }));
      }

      // Se a partitura estava dentro de uma pasta aberta, remova dela
      setPastas((prev) =>
        prev.map((p) => ({
          ...p,
          partituras: p.partituras ? p.partituras.filter((pt) => pt.id !== partituraId) : p.partituras,
        }))
      );
      window.location.reload();
    } catch (err) {
      console.error("Erro ao mover partitura:", err);
    }
  };

  // Permitir dropar na área sem pasta (desassociar)
  const handleDropNoFolder = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");
    const partituraId = Number(e.dataTransfer.getData("partituraId"));
    if (!partituraId) return;

    try {
      const res = await fetch(`http://localhost:4000/api/partitura/mover/${partituraId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folderId: null }), // backend deve aceitar null para remover associação
      });

      if (!res.ok) {
        console.error("Erro ao remover partitura da pasta:", await res.text());
        return;
      }

      const updated = await res.json();

      // Atualiza listas locais
      // adiciona à lista principal
      setPartituras((prev) => [updated, ...prev]);

      // remove de todas as pastas
      setPastas((prev) =>
        prev.map((p) => ({
          ...p,
          partituras: p.partituras ? p.partituras.filter((pt) => pt.id !== partituraId) : p.partituras,
        }))
      );

      if (pastaAberta) {
        setPastaAberta({
          ...pastaAberta,
          partituras: pastaAberta.partituras.filter((pt) => pt.id !== partituraId),
        });
      }
      window.location.reload();
    } catch (err) {
      console.error("Erro ao desassociar partitura:", err);
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

      <h1 className="text-3xl font-semibold text-gray-800 mb-16 text-center">
        Biblioteca de Partituras
      </h1>

      {/* Texto para ADMIN */}
      {user?.role === "admin" && (
        <div className="mb-10 text-center">
          
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
            Aqui em <strong> Biblioteca de Partituras</strong> você pode cadastrar novas partituras (em PDF), organizar em pastas,
            editar informações, remover arquivos e manter todo o acervo musical
            sempre atualizado. Arraste partituras para as pastas, mova, renomeie
            e mantenha tudo organizado com facilidade.
          </p>
        </div>
      )}

      {/* Texto para USER */}
      {user?.role === "user" && (
        <div className="mb-10 text-center">
          
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
            Aqui em <strong> Biblioteca de Partituras</strong> você pode visualizar e acessar todas as partituras
            disponíveis para estudo e uso nos cultos e apresentações.
            A organização em pastas facilita a navegação, permitindo que você
            encontre rapidamente o material necessário.
          </p>
        </div>
      )}

      {/* Upload (admins) */}
      {user?.role === "admin" && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          
          <h2 className="text-lg font-semibold mb-4">Adicionar Partitura</h2>

          <form
            onSubmit={handleUpload}
            className="flex flex-col md:flex-row items-center gap-4"
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
        </div>
      )}

      {/* PASTAS + CRIAR PASTA */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">Pastas</h2>
            {user?.role === "admin" && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nova pasta..."
                  value={novaPastaNome}
                  onChange={(e) => setNovaPastaNome(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <button
                  onClick={() => criarPasta(novaPastaNome)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded"
                >
                  Criar
                </button>
              </div>
            )}
          </div>

          {pastas.length === 0 ? (
            <p className="text-gray-500">Nenhuma pasta criada.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {pastas.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-50 p-5 rounded-xl border flex flex-col justify-between cursor-pointer group hover:bg-gray-100 transition relative"
                  onClick={() => abrirPasta(p)}
                  onDrop={(e) => handleDrop(e, p.id)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-base">{p.name}</h3>
                      <p className="text-xs text-gray-500">
                        {(p.partituras || []).length} partituras
                      </p>
                    </div>

                    {/* Placeholder "Abrir" */}
                    <span className="text-xs text-teal-700 opacity-0 group-hover:opacity-100 transition">
                      Abrir
                    </span>
                  </div>

                  {/* Apenas nomes quando a pasta está fechada */}
                  <div className="mb-4 text-xs text-gray-600">
                    {(p.partituras || []).length > 0 ? (
                      p.partituras.slice(0, 6).map((pt) => (
                        <p key={pt.id} className="truncate">{pt.nome}</p>
                      ))
                    ) : (
                      <p className="text-gray-400 text-xs">Nenhum arquivo</p>
                    )}
                  </div>

                  {/* Rodapé - botões fora do card clicável */}
                  {user?.role === "admin" && (
                    <div
                      className="flex gap-2 pt-3 border-t"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        title="Editar"
                        onClick={() => setEditarPastaData(p)}
                        className="flex-1 text-sm px-3 py-1 rounded bg-white border hover:bg-gray-200 transition"
                      >
                        ✏️ Editar
                      </button>

                      <button
                        title="Excluir"
                        onClick={() => excluirPasta(p.id)}
                        className="flex-1 text-sm px-3 py-1 rounded bg-red-100 text-red-600 border hover:bg-red-200 transition"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Se uma pasta estiver aberta, mostra seu conteúdo */}
      {pastaAberta ? (
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{pastaAberta.name}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPastaAberta(null)}
                className="px-3 py-1 bg-gray-100 rounded"
              >
                Fechar
              </button>
            </div>
          </div>

          {(!pastaAberta.partituras || pastaAberta.partituras.length === 0) ? (
            <p className="text-gray-500">Nenhuma partitura nesta pasta.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-4">
              {pastaAberta.partituras.map((p) => {
                const fileUrl = p.arquivoUrl?.startsWith("http")
                  ? p.arquivoUrl
                  : `http://localhost:4000${p.arquivoUrl || ""}`;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer w-70 transform transition duration-300 hover:scale-105 hover:brightness-90 hover:shadow-xl"
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    onClick={() => {
                      setPdfUrl(fileUrl);
                      setShowPdf(true);
                    }}
                  >
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

                    <div className="p-3">
                      <h3 className="text-base font-semibold text-gray-800 truncate">{p.nome}</h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.descricao || "Sem descrição"}</p>

                      {user?.role === "admin" && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id);
                              window.location.reload();
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                          >
                            Excluir
                          </button>

                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleDropNoFolder({ preventDefault: () => {}, dataTransfer: { getData: () => p.id } });
                              window.location.reload();
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Lista principal de partituras (sem pasta) */}
      {!pastaAberta && (
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">Partituras (Sem pasta)</h2>

          <p className="text-sm text-gray-600 mb-4">
            Para organizar suas partituras, arraste e solte os arquivos nas pastas desejadas.
          </p>

          <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-4">
            {partituras.length === 0 ? (
              // 🔍 Se não há partituras sem pasta, verificar se existem partituras em pastas
              pastas.some((p) => p.partituras && p.partituras.length > 0) ? (
                <p className="text-gray-500 text-center col-span-full">
                  Nenhum arquivo sem pasta no momento.
                </p>
              ) : (
                <p className="text-gray-500 text-center col-span-full">
                  Nenhuma partitura enviada ainda.
                </p>
              )
            ) : (
              partituras.map((p) => {
                const fileUrl = p.arquivoUrl?.startsWith("http")
                  ? p.arquivoUrl
                  : `http://localhost:4000${p.arquivoUrl || ""}`;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer w-70 transform transition duration-300 hover:scale-105 hover:brightness-90 hover:shadow-xl"
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    onClick={() => {
                      setPdfUrl(fileUrl);
                      setShowPdf(true);
                    }}
                  >
                    <div className="relative w-full h-95 bg-gray-100 flex items-center justify-center">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400">Prévia indisponível</span>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="text-base font-semibold text-gray-800 truncate">{p.nome}</h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {p.descricao || "Sem descrição"}
                      </p>

                      {user?.role === "admin" && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Show Modal PDF */}
      {showPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 h-[90vh] flex flex-col">
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

            <div className="flex-1 overflow-hidden">
              <iframe src={pdfUrl} title="Visualizador de Partitura" className="w-full h-full" allow="fullscreen" />
              <noscript>
                <div className="p-6 text-center">
                  <p className="mb-4">Ative o JavaScript para visualizar o PDF.</p>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                    Clique aqui para abrir a partitura.
                  </a>
                </div>
              </noscript>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar pasta */}
      {editarPastaData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3">
            <h3 className="text-lg font-semibold mb-3">Editar Pasta</h3>
            <input
              type="text"
              value={editarPastaData.name}
              onChange={(e) => setEditarPastaData({ ...editarPastaData, name: e.target.value })}
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditarPastaData(null)} className="px-3 py-1 rounded border">
                Cancelar
              </button>
              <button
                onClick={() => editarPasta(editarPastaData.id, editarPastaData.name)}
                className="px-3 py-1 rounded bg-teal-600 text-white"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
