import React, { useEffect, useState, useRef } from "react";
import { FiSend, FiMessageCircle, FiMessageSquare} from "react-icons/fi";

const Series = () => {
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [hour, setHour] = useState("");
  const [message, setMessage] = useState("");
  const [seriesList, setSeriesList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingStartDate, setEditingStartDate] = useState("");
  const [editingHour, setEditingHour] = useState("");

  const [role, setRole] = useState("admin");
  const [ownerId, setOwnerId] = useState(null);

  const [selectedSeriesId, setSelectedSeriesId] = useState(null);


  const [selectedPresencas, setSelectedPresencas] = useState([]);
  // const [confirmedSeries, setConfirmedSeries] = useState([]);
  const [confirmedSeries, setConfirmedSeries] = useState(() => {
  const saved = localStorage.getItem("confirmedSeries");
    return saved ? JSON.parse(saved) : [];
  });

  // 📌 Estados do Chat
  const [chatPopupOpen, setChatPopupOpen] = useState(false);
  const [chatFloating, setChatFloating] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatName, setChatName] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChatEventTitle, setCurrentChatEventTitle] = useState("");
  const [chatOptionsOpen, setChatOptionsOpen] = useState(false);
  const userId = localStorage.getItem("userId");
  const [chatStatus, setChatStatus] = useState("active");
  // ✅ Contador de mensagens não lidas
  const [unreadCount, setUnreadCount] = useState(0);
  // ✅ Timestamp da última mensagem enviada pelo usuário logado
  const [lastUserMessageTimestamp, setLastUserMessageTimestamp] = useState(null);


  // 📦 Carregar eventos do backend (somente futuros)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");

          const userId = localStorage.getItem("userId");
          const storedData =
            JSON.parse(localStorage.getItem("confirmedSeriesByUser") || "{}");
          setConfirmedSeries(storedData[userId] || []);

        const res = await fetch("http://localhost:4000/api/calendar/series", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao buscar eventos");

        const data = await res.json();
        const today = new Date();

        // data.events é o novo array retornado
        const upcoming = data.events.filter(
          (e) => new Date(e.date) >= today
        );

        const nextEvent = upcoming.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        )[0];

        setEvents(nextEvent ? [nextEvent] : []);
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      }
    };

    fetchEvents();

  }, []);


  // 📦 Carregar séries já registradas
  useEffect(() => {
    const fetchSeries = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:4000/api/series", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.series) {
          const sortedData = data.series.sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate)
          );
          setSeriesList(sortedData);
          setRole(data.role);
          setOwnerId(data.ownerId);
        }
      } catch (err) {
        console.error("Erro ao carregar séries:", err);
      }
    };
    fetchSeries();
  }, []);


  // 📦 Registrar série
  const handleSaveSeries = async (event) => {
    if (!event || !startDate || !hour) {
      alert("Preencha todos os campos!");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:4000/api/series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Série - ${event.title}`,
          startDate,
          hour,
          eventId: event.id,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar série");

      const newSeries = await res.json();
      setMessage(`✅ Série "${newSeries.title}" registrada com sucesso!`);
      setSeriesList((prev) =>
        [...prev, newSeries].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        )
      );

      setStartDate("");
      setHour("");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao registrar série");
    }
  };


    // 📦 Atualizar série (edição inline)
  const handleUpdateSeries = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:4000/api/series/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: editingStartDate,
          hour: editingHour,
        }),
      });
      const updated = await res.json();
      setSeriesList((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setEditingId(null);
      setMessage("✅ Série atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao atualizar série");
    }
  };

    // 📦 Deletar série
  const handleDeleteSeries = async (id) => {
    if (!window.confirm("Deseja realmente deletar esta série?")) return;

    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:4000/api/series/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSeriesList((prev) => prev.filter((s) => s.id !== id));
      setMessage("✅ Série deletada com sucesso!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao deletar série");
    }
  };

  // 📦 Confirmar presença na séries
  
 // ✅ Confirmar presença
const handleConfirmPresence = async (id, status) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // ← 🔹 Salve o ID do usuário logado no login e use aqui
  try {
    const res = await fetch(`http://localhost:4000/api/series/${id}/presenca`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error("Erro ao confirmar presença");
    const updated = await res.json();

    setSeriesList((prev) =>
      prev.map((s) =>
        s.id === updated.serieId ? { ...s, status_presenca: status } : s
      )
    );

    // 🔒 Bloqueia apenas para o usuário atual
    setConfirmedSeries((prev) => {
      const storedData =
        JSON.parse(localStorage.getItem("confirmedSeriesByUser") || "{}");

      const userConfirmed = storedData[userId] || [];
      const updatedUserConfirmed = [...new Set([...userConfirmed, id])];

      const newData = { ...storedData, [userId]: updatedUserConfirmed };

      localStorage.setItem("confirmedSeriesByUser", JSON.stringify(newData));

      return updatedUserConfirmed;
    });

    setMessage(`✅ Sua presença foi marcada como: ${status}`);
  } catch (err) {
    console.error(err);
    setMessage("Erro ao confirmar presença");
  }
};


// ✅ Visualizar lista de presenças (admin)
const handleViewPresences = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://localhost:4000/api/series/${id}/presenca`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erro ao carregar presenças");
    const data = await res.json();

    setSelectedPresencas(data); // ✅ Armazena no estado
    setSelectedSeriesId(id); // ✅ guarda o ID da série
  } catch (err) {
    console.error(err);
    setMessage("Erro ao carregar presenças");
  }
};

// ✅ Admin confirma presença (Compareceu / Não Compareceu)
const handleConfirmacaoAdmin = async (serieId, userId, confirmacao) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(
      `http://localhost:4000/api/series/${serieId}/presenca/${userId}/confirmar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmacao }),
      }
    );

    if (!res.ok) throw new Error("Erro ao confirmar presença");

    // Atualiza estado local sem recarregar
    setSelectedPresencas((prev) =>
      prev.map((p) =>
        p.id === userId ? { ...p, confirmacaoAdmin: confirmacao } : p
      )
    );
  } catch (err) {
    console.error(err);
    setMessage("Erro ao confirmar presença ou o usuário ainda não respondeu ao status de presença.");
  }
};

// 📌 Chat do Evento

// 👉 ref que aponta para o final da lista de mensagens
const messagesEndRef = useRef(null);

// ✅ Mapeamento de refs para as mensagens do usuário (para scroll)
const messageRefs = useRef({});

// 👉 função que faz o scroll automático
const scrollToBottom = () => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
};

// 📦 carregar chat salvo (se houver)
useEffect(() => {
  const savedChatId = localStorage.getItem("currentChatId");
  if (!savedChatId) return;

  const loadChat = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:4000/api/series/chat/${savedChatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      localStorage.removeItem("currentChatId");
      return;
    }

    const chat = await res.json();
    if (chat.status === "closed") {
      localStorage.removeItem("currentChatId");
      return;
    }

    // Restaurar chat
    setCurrentChatId(chat.id);
    setCurrentChatEventTitle(chat.eventTitle || "Evento");
    setChatFloating(true);
    setChatStatus(chat.status);

    setUnreadCount(0); // Zera o contador de não lidas ao restaurar o chat

    // ✅ Buscar o timestamp da última mensagem do usuário
    const lastMsgRes = await fetch(`http://localhost:4000/api/series/chat/${savedChatId}/last-message-by-user`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const lastMsgData = lastMsgRes.ok ? await lastMsgRes.json() : { lastCreatedAt: null };
    
    // Salva o timestamp para ser usado no scroll após o carregamento das mensagens
    setLastUserMessageTimestamp(lastMsgData.lastCreatedAt);


    // 🔥 Carregar mensagens do chat restaurado
    const loadMessages = async (targetTimestamp) => {
      const token = localStorage.getItem("token");
      const r = await fetch(`http://localhost:4000/api/series/chat/${chat.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (r.ok) {
      //  const msgs = await r.json();
        const data = await r.json();
        const msgs = data.messages || []; // Garante que é um array vazio se não houver 'messages'
        setChatMessages(msgs);
        //setTimeout(scrollToBottom, 50);
      }
    };

    loadMessages();
  };

  loadChat();
}, []);

// 📦 useEffect para executar o scroll APÓS a abertura e o carregamento do timestamp
useEffect(() => {
    // 1. Só tenta rolar se o chat estiver ABERTO
    if (chatPopupOpen) {
        // 2. Tenta rolar para a última mensagem do usuário (se houver)
        if (lastUserMessageTimestamp) {
            // Um pequeno delay garante que o DOM esteja completamente atualizado (todas as refs criadas)
            const delay = setTimeout(() => {
                const targetRef = messageRefs.current[lastUserMessageTimestamp];

                if (targetRef) {
                    // console.log("Rolando para:", lastUserMessageTimestamp); // Debug: Verifique se o timestamp é válido
                    targetRef.scrollIntoView({ behavior: "smooth", block: "center" });
                } else {
                    // Se a ref não foi encontrada, rola para o final (última mensagem geral)
                    scrollToBottom(); 
                }
            }, 100); 

            return () => clearTimeout(delay); // Limpeza do timeout

        } else if (chatMessages.length > 0) {
            // 3. Se o usuário nunca mandou mensagem, rola para o final do chat (UX padrão)
            // Se o chat for muito longo, ele aparecerá no topo (isso é ajustado pelo scrollToBottom)
            scrollToBottom();
        }
    }
}, [chatPopupOpen, lastUserMessageTimestamp, chatMessages.length]);


// 📦 Polling para Notificações de Novas Mensagens
useEffect(() => {
  if (!currentChatId || chatPopupOpen) {
    // Não faz polling se o chat não estiver ativo ou se o pop-up estiver aberto
    return;
  }

  const checkNewMessages = async () => {
    const token = localStorage.getItem("token");
    const r = await fetch(`http://localhost:4000/api/series/chat/${currentChatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (r.ok) {
      const { messages, lastMessage } = await r.json();
      
      if (lastMessage) {
        const lastSenderId = Number(lastMessage.userId);
        const currentUserId = Number(userId);

        if (lastSenderId !== currentUserId) {
          // Se a última mensagem NÃO foi enviada por mim, incrementa
          
          setUnreadCount(1); // Simplesmente indica que há uma nova mensagem
        } else if (lastSenderId === currentUserId) {
          // Se a última mensagem foi enviada por mim, não há nada não lido
          setUnreadCount(0);
        }
      }
    }
  };

  // Configura o intervalo de Polling (a cada 5 segundos)
  const intervalId = setInterval(checkNewMessages, 5000); 

  // Função de limpeza do intervalo
  return () => clearInterval(intervalId);

}, [currentChatId, chatPopupOpen, userId]); // Depende do chat ativo e se o pop-up está aberto


// 📦 Criar chat do evento
const [creatingChat, setCreatingChat] = useState(false);

const handleCreateChat = async () => {
  if (!chatName) return alert("Nome obrigatório!");

  const token = localStorage.getItem("token");
  const eventId = events[0]?.id;
  if (!eventId) return alert("Nenhum evento disponível");

  setCreatingChat(true);

  try {
    // 🔥 Verificar se já existe chat ativo
    const check = await fetch(`http://localhost:4000/api/series/event/${eventId}/chat/check`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // TRATAMENTO DE ERRO NA VERIFICAÇÃO
    if (check.status === 403) {
        return alert("Acesso negado. Você não tem permissão para criar chat neste evento.");
    }
    
    const exists = await check.json();

    if (exists.exists) {
      return alert(`Já existe um chat ativo: ${exists.name}`);
    }

    // 🔥 Criar chat normalmente
    const res = await fetch(`http://localhost:4000/api/series/event/${eventId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ chatName }),
    });

    if (res.status === 403) { // TRATAMENTO DE ERRO NA CRIAÇÃO
        return alert("Acesso negado. Você não tem permissão para criar chat neste evento.");
    }

    if (!res.ok) throw new Error("Erro ao criar chat");

    const data = await res.json();

    setCurrentChatId(data.id);
    setCurrentChatEventTitle(events[0]?.title || "Evento");
    localStorage.setItem("currentChatId", data.id);
    setChatPopupOpen(true);
    
    // Opcional: Recarregar a lista de chats para refletir a nova criação
    // fetchChats(); // Se você extrair a função fetchChats para fora do useEffect

  } catch (err) {
    alert(err.message);
  } finally {
    setCreatingChat(false);
  }
};


const handleSendMessage = async (text) => {
  if (!text || !currentChatId) return;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:4000/api/series/chat/${currentChatId}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erro ao enviar mensagem");
    }

    const msg = await res.json();
    // atualiza chatMessages localmente
    setChatMessages(prev => [
      ...prev,
      {
        userId: msg.userId,
        user: Number(msg.userId) === Number(userId) ? "Você" : msg.userName || "Usuário",
        text: msg.text,
        timestamp: msg.createdAt,
      }
    ]);

    setUnreadCount(0); // Zera o contador de não lidas ao enviar mensagem

    setTimeout(scrollToBottom, 50); // faz scroll após adicionar a mensagem

    setLastUserMessageTimestamp(msg.createdAt); // Atualiza o timestamp da última mensagem do usuário
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    alert(err.message || "Erro ao enviar mensagem");
  }
};

const [messageInput, setMessageInput] = useState("");

// 📦 Novos estados para guardar os chats acessíveis
const [accessibleChats, setAccessibleChats] = useState([]);
const [loadingChats, setLoadingChats] = useState(true); // Opcional, para indicar carregamento

// 📦 Carregar lista de chats acessíveis
useEffect(() => {
  const token = localStorage.getItem("token");
  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const res = await fetch(`http://localhost:4000/api/series/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // data.chats contém apenas os chats onde o Evento pertence ao ownerId do usuário logado
        setAccessibleChats(data.chats);
      }
    } catch (err) {
      console.error("Erro ao carregar lista de chats:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  fetchChats();
}, [role]);


// 📦 Atualizar status do chat (admin)
const updateStatus = async (status) => {
  const token = localStorage.getItem("token");
  await fetch(`http://localhost:4000/api/series/chat/${currentChatId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  setChatStatus(status);
  
  // ✅ MELHORIA: Feedback mais claro
  let statusMessage;
  switch (status) {
      case 'frozen':
          statusMessage = "Congelado";
          break;
      case 'admin_only':
          statusMessage = "Apenas Admin";
          break;
      case 'active':
          statusMessage = "Reativado (Ativo)";
          break;
      default:
          statusMessage = status;
  }
  
  alert(`Status do chat atualizado para: ${statusMessage}`);
};

// 📦 Encerrar chat (admin)
const endChat = async () => {
  if (!confirm("Deseja ENCERRAR o chat? O chat será inativado e o log salvo automaticamente no fim do evento.")) return; // ✅ Texto revisado

  const token = localStorage.getItem("token");

  await fetch(`http://localhost:4000/api/series/chat/${currentChatId}`, {
    method: "PATCH", // Esta rota agora apenas muda o status para "closed"
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  alert("Chat inativado com sucesso. O log será arquivado com o evento."); // ✅ Texto revisado
  setChatPopupOpen(false);
  setChatFloating(false);
  localStorage.removeItem("currentChatId");
  setCurrentChatId(null);
};

// 🔍 Verifica o estado de bloqueio
const isBlocked = chatStatus === 'frozen' || (chatStatus === 'admin_only' && role !== 'admin');
const isAdmin = role === 'admin';

let inputPlaceholder = "Digite...";
let disableInput = false;

if (chatStatus === 'frozen') {
    inputPlaceholder = "Chat Congelado pelo Administrador";
    disableInput = true;
} else if (chatStatus === 'admin_only' && !isAdmin) {
    inputPlaceholder = "Apenas Administradores podem enviar mensagens";
    disableInput = true;
} else if (chatStatus === 'closed') {
    inputPlaceholder = "Chat Encerrado";
    disableInput = true;
}


// 🔤 Gera iniciais do nome (GA, GS etc.)
// const getInitials = (name) => {
//   if (!name) return "??";
//   const parts = name.trim().split(" ");
//   if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
//   return (parts[0][0] + parts[1][0]).toUpperCase();
// };

// 📅 Função para formatar o timestamp para HH:mm
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  
  // Cria um objeto Date. Se for string do BD (ISO 8601), o new Date() funciona.
  const date = new Date(timestamp); 
  
  // Usa Intl.DateTimeFormat para garantir o formato e fuso horário corretos (opcionalmente)
  return new Intl.DateTimeFormat('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    timeZone: 'America/Sao_Paulo' // Ajuste para o fuso horário desejado
  }).format(date);
};

// 1. Identifica o Evento principal
const firstEventId = events[0]?.id;

// 2. Verifica se o chat do evento principal (events[0]) está na lista de chats acessíveis
// e se ele está ativo/congelado (não 'closed')
const activeChatForEvent = accessibleChats.find(chat => chat.eventId === firstEventId && chat.status !== 'closed');

// 3. Define as permissões
const canCreateChat = (role === "admin" && firstEventId && !activeChatForEvent);
const canOpenChat = (firstEventId && activeChatForEvent); // User ou Admin podem abrir

  return (
    

    <div className="p-6">

      {chatFloating && (
        <div
          // Cor alterada para verde (bg-green-600) com hover (hover:bg-green-700)
          className="fixed bottom-20 right-15 bg-green-600 text-white p-4 rounded-full shadow-lg cursor-pointer z-40 transition-colors duration-200 hover:bg-green-700"
          onClick={() => {
            setChatPopupOpen(true);
            setChatFloating(false);

            setUnreadCount(0); // Zera o contador ao abrir o chat
          }}
        >
          <FiMessageCircle className="w-6 h-6 transform rotate-360" />

          {/* INDICADOR DE MENSAGEM NÃO LIDA */}
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-800 shadow-md">
              {/* Se você quiser mostrar o número, use {unreadCount}, caso contrário, deixe vazio ou use um ponto: */}
              ! 
            </div>
          )}
        </div>
      )}

      {/* Modal de criação de chat */}
      {chatPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 w-[450px] h-[650px] rounded-xl shadow-xl flex flex-col">
            
            {/* Cabeçalho */}
            <div className="p-4 border-b dark:border-gray-700 flex flex-col gap-3">

              {/* Linha 1 — Título + Fechar */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold dark:text-gray-200 mb-2">{currentChatEventTitle || "Chat do Evento"}</h2>

                <button
                  onClick={() => {
                    setChatPopupOpen(false);
                    setChatFloating(true);
                  }}
                  className="text-red-500 font-bold text-lg"
                >
                  ✖
                </button>
              </div>

              {/* Linha 2 — Controles do Admin */}
              {role === "admin" && currentChatId && (
                <div className="flex flex-wrap gap-2 justify-between">

                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                    onClick={() => updateStatus("frozen")}
                  >
                    Congelar
                  </button>

                  <button
                    className="px-3 py-1 rounded bg-yellow-600 text-white text-sm"
                    onClick={() => updateStatus("admin_only")}
                  >
                    Somente Admin
                  </button>

                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                    onClick={() => updateStatus("active")}
                  >
                    Reativar
                  </button>

                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                    onClick={() => endChat()}
                  >
                    Encerrar
                  </button>
                </div>
              )}

            </div>

            {/* Mensagens */}
            <div className="flex flex-col gap-2 p-3 overflow-y-auto flex-1 dark:bg-gray-900">

              {chatMessages.map((msg, index) => {
                const isMine = Number(localStorage.getItem("userId")) === msg.userId;

                // ✅ Identifica se é a mensagem alvo para o scroll
                const isTargetMessage = isMine && msg.timestamp === lastUserMessageTimestamp;

                return (
                  <div
                    key={index}
                    className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      // ✅ REFERÊNCIA NA DIV DO BALÃO DA MENSAGEM
                      ref={isTargetMessage ? (el) => messageRefs.current[msg.timestamp] = el : null}
                      className={`max-w-[80%] px-4 py-3 rounded-xl shadow 
                        ${isMine 
                            ? "bg-green-600 text-white rounded-br-none" // Balão próprio: Verde (Rounded nos cantos, exceto inferior direito)
                            : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-bl-none" // Balão alheio: Cinza (Rounded nos cantos, exceto inferior esquerdo)
                        }`}
                    >

                      {/* Nome do Usuário */}
                      <p className="text-xs font-bold mb-1">{isMine ? "Você" : msg.user}</p>
                      

                      {/* Texto e Horário */}
                      <div className="flex justify-between items-end gap-3">
                          
                          <p className="text-sm break-words leading-snug">{msg.text}</p>

                          {/* ⏰ NOVO: Horário da Mensagem */}
                          <p 
                            className={`text-[10px] whitespace-nowrap opacity-75 ${isMine ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* marcador para scroll automático */}
              <div ref={messagesEndRef} />

            </div>

            {/* Input */}
            <div className="p-4 border-t dark:border-gray-700 flex items-end gap-3 bg-white dark:bg-gray-800">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && messageInput.trim() && !disableInput) { // ✅ Verifica se está desabilitado
                    handleSendMessage(messageInput);
                    setMessageInput("");
                  }
                }}
                placeholder={inputPlaceholder} // ✅ Placeholder dinâmico
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 px-4 py-3 rounded-full dark:bg-gray-700 dark:text-white focus:outline-none focus:border-green-500"
                disabled={disableInput} // ✅ Desabilita input
              />

              <button
                onClick={() => {
                  if (messageInput.trim())
                  handleSendMessage(messageInput);
                  setMessageInput("");
                }}
                className="bg-green-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center h-12 w-12 hover:bg-green-700 transition disabled:opacity-50"
                disabled={!messageInput.trim() || disableInput} // Desabilita se o campo estiver vazio
              >
                <FiSend className="w-8 h-8 transform rotate-45 mr-1" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Criar Chat */}
      {chatOptionsOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96 shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Criar Chat</h2>

          <input
            type="text"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder="Nome do chat"
            className="w-full border px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white"
          />

          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => setChatOptionsOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-400 text-white"
            >
              Cancelar
            </button>

            <button
              onClick={handleCreateChat}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white"
              disabled={creatingChat}
            >
              {creatingChat ? "Criando..." : "Criar"}
            </button>
          </div>
        </div>
      </div>
    )}
      
      {/* Chat */}
      {/* Criar Chat / Abrir Chat - Novo Bloco de Controle de Visibilidade */}
    {(canCreateChat || canOpenChat) && (
      <div className="mb-6">

          {/* Botão para CRIAR NOVO CHAT (Se for Admin do evento e não tiver chat ativo) */}
          {canCreateChat && (
              <button
                  onClick={() => setChatOptionsOpen(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition"
              >
                  Criar Chat para {events[0]?.title}
              </button>
          )}

          {/* Botão para ENTRAR NO CHAT EXISTENTE */}
          {canOpenChat && (
              <button
                  onClick={() => {
                      if (activeChatForEvent) {
                          // Simula a restauração de chat (usa o ID encontrado na lista)
                          setCurrentChatId(activeChatForEvent.id);
                          setCurrentChatEventTitle(activeChatForEvent.event.title || "Evento");
                          localStorage.setItem("currentChatId", activeChatForEvent.id);
                          setChatPopupOpen(true);
                          
                          // Disparar o carregamento das mensagens (chamar loadMessages)
                          // Se você não quiser refatorar loadMessages, pode disparar um recarregamento da tela para forçar o useEffect
                          // Ou idealmente, chamar uma função que carrega as mensagens diretamente aqui.
                      }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
              >
                  Abrir Chat Ativo
              </button>
          )}
      </div>
    )}

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Séries de Ensaios
      </h1>

      {/* Texto para ADMIN */}
      {role === "admin" && (
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-6xl mx-left mb-10">
          Esta página permite criar e gerenciar séries de ensaios relacionados a um
          evento agendado. Quando um evento estiver disponível, você poderá registrar
          novos ensaios até a data do evento, organizando a preparação do grupo de
          forma prática e eficiente.  
          Além disso, você poderá acompanhar a participação dos membros, marcando
          quem <strong>Compareceu</strong> ou <strong>Não compareceu</strong> em cada
          ensaio, facilitando o controle de presença e o planejamento do grupo.
        </p>
      )}

      {/* Texto para USER */}
      {role === "user" && (
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-6xl mx-left mb-10">
          Nesta página você pode visualizar os eventos e as séries de ensaios
          agendados pelo administrador. Aqui você verá as datas, horários e
          informações dos ensaios que foram programados.  
          Sua única ação nesta tela será confirmar sua disponibilidade, clicando em
          <strong> Confirmar presença</strong> ou <strong> Não disponível</strong>
          para cada ensaio.
        </p>
      )}

      {/* 📅 Próximos eventos */}
      {events.length > 0 ? (
        events.map((event) => {
          const daysLeft = Math.ceil(
            (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded">
                  Faltam {daysLeft} dias
                </span>
              </div>

              {/* 📆 Registrar Série */}
              <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                <h4 className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Registrar Série de Ensaios
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Início dos Ensaios
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Hora do Ensaio
                    </label>
                    <input
                      type="time"
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  {role === "admin" && (
                    <button
                      onClick={() => handleSaveSeries(event)}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                    >
                      Salvar Série
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Nenhum evento futuro encontrado.</p>
      )}

      {/* 💾 Mensagem de sucesso */}
      {message && (
        <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      {/* 📋 Lista de séries registradas */}
      {seriesList.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Séries Registradas
          </h2>
          <div className="space-y-3">
            {seriesList.map((serie) => (
              <div
                key={serie.id}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{serie.title}</p>

                  {editingId === serie.id ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="date"
                        value={editingStartDate}
                        onChange={(e) => setEditingStartDate(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                      <input
                        type="time"
                        value={editingHour}
                        onChange={(e) => setEditingHour(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                      <button
                        onClick={() => handleUpdateSeries(serie.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-3 py-1 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(serie.startDate).toLocaleDateString("pt-BR")} às{" "}
                      {serie.hour}
                    </p>
                  )}

                  {/* ✅ Botões de confirmação de presença - visível apenas para usuários */}
                  {role === "user" && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleConfirmPresence(serie.id, "Confirmou presença")}
                        disabled={confirmedSeries.includes(serie.id)}
                        className={`px-3 py-1 rounded text-white transition-colors ${
                          confirmedSeries.includes(serie.id)
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        Confirmar Presença
                      </button>
                      <button
                        onClick={() => handleConfirmPresence(serie.id, "Não Disponível")}
                        disabled={confirmedSeries.includes(serie.id)}
                        className={`px-3 py-1 rounded text-white transition-colors ${
                          confirmedSeries.includes(serie.id)
                            ? "bg-red-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        Não Disponível
                      </button>
                    </div>
                  )}


                </div>

                {role === "admin" && editingId !== serie.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(serie.id);
                        setEditingStartDate(
                          new Date(serie.startDate).toISOString().split("T")[0]
                        );
                        setEditingHour(serie.hour);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    > 
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSeries(serie.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Deletar
                    </button>

                    {role === "admin" && (
                      <button
                        onClick={() => handleViewPresences(serie.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Ver Lista de Confirmados
                      </button>
                    )}

                  </div>
                )}
              </div>
            ))}

            {/* ✅ Lista visual de presenças */}
            {role === "admin" && selectedPresencas.length > 0 && (
              <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white mb-3">Lista de Presenças</h3>
                <table className="w-full text-sm text-gray-200">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Nome</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Confirmação de Presença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPresencas.map((p) => (
                      <tr
                        key={p.id}
                        className={`border-b border-gray-700 ${
                          p.confirmacaoAdmin ? "bg-gray-700/30 opacity-70" : "hover:bg-gray-700/30"
                        }`}
                      >
                        <td className="py-2">{p.nome}</td>
                        <td className="py-2">{p.email}</td>
                        <td className="py-2">
                          {p.status === "Confirmou presença" ? (
                            <span className="text-green-400 font-medium">{p.status}</span>
                          ) : p.status === "Não Disponível" ? (
                            <span className="text-red-400 font-medium">{p.status}</span>
                          ) : (
                            <span className="text-yellow-400 font-medium">{p.status}</span>
                          )}
                        </td>

                        <td className="py-2">
                          {p.confirmacaoAdmin ? (
                            <span className="text-blue-400 font-semibold">
                              Formulário preenchido ({p.confirmacaoAdmin})
                            </span>
                          ) : (
                            <div className="flex items-center space-x-4">
                              <label className="flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name={`confirmacao-${p.id}`}
                                  onChange={() =>
                                    handleConfirmacaoAdmin(selectedSeriesId, p.id, "Compareceu")
                                  }
                                  className="accent-green-500"
                                />
                                <span>Sim</span>
                              </label>
                              <label className="flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name={`confirmacao-${p.id}`}
                                  onChange={() =>
                                    handleConfirmacaoAdmin(selectedSeriesId, p.id, "Não Compareceu")
                                  }
                                  className="accent-red-500"
                                />
                                <span>Não</span>
                              </label>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Series;
