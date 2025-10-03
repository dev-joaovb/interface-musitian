import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import axios from "axios";

export default function Calendar() {
  const calendarRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  const [form, setForm] = useState({
    id: "",
    title: "",
    start: "",
    location: "",
    description: "",
    color: "#3b82f6",
  });

  // 🔹 Carregar eventos do backend
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/calendar") // 🔹 URL com base no backend
      .then((res) => {
        if (Array.isArray(res.data)) {
          setEvents(res.data);
        } else {
          console.error("Resposta inesperada da API:", res.data);
          setEvents([]);
        }
      })
      .catch((err) => console.error("Erro ao carregar eventos:", err));
  }, []);

  // Helper: formata p/ datetime-local
  const toLocalInputValue = (dateLike) => {
    if (!dateLike) return "";
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  // Abrir modal
  const openModal = (mode, date = null, eventApi = null) => {
    if (mode === "new") {
      setForm({
        id: "",
        title: "",
        start: date ? toLocalInputValue(date) : "",
        location: "",
        description: "",
        color: "#3b82f6",
      });
      setCurrentEventId(null);
    } else if (mode === "edit" && eventApi) {
      setForm({
        id: eventApi.id,
        title: eventApi.title || "",
        start: toLocalInputValue(eventApi.start),
        location: eventApi.extendedProps?.location || "",
        description: eventApi.extendedProps?.description || "",
        color: eventApi.backgroundColor || "#3b82f6",
      });
      setCurrentEventId(eventApi.id);
    }
    setIsModalOpen(true);
  };

    // Salvar evento
    const saveEvent = async () => {
    if (!form.title || !form.start) {
        alert("Preencha título e data/hora.");
        return;
    }

    const payload = {
        title: form.title,
        date: form.start,
        location: form.location,
        description: form.description,
        color: form.color,
    };

    try {
        if (currentEventId) {
        // Atualizar evento existente
        const res = await axios.put(
            `http://localhost:4000/api/calendar/${currentEventId}`,
            payload
        );

        setEvents((prev) =>
            prev.map((e) => (e.id === currentEventId ? res.data : e))
        );
        } else {
        // Criar novo evento
        const res = await axios.post(
            "http://localhost:4000/api/calendar",
            payload
        );

        setEvents((prev) => [...prev, res.data]);
        }

        // Resetar formulário e fechar modal
        setForm({
        title: "",
        start: "",
        location: "",
        description: "",
        color: "#3b82f6",
        });
        setCurrentEventId(null);
        setIsModalOpen(false);
        window.location.reload();
    } catch (err) {
        console.error("Erro ao salvar evento:", err);
    }
    };

    // Excluir evento
    const deleteEvent = async () => {
    if (!currentEventId) return;
    if (!window.confirm("Excluir este evento?")) return;

    try {
        await axios.delete(
        `http://localhost:4000/api/calendar/${currentEventId}`
        );

        setEvents((prev) => prev.filter((e) => e.id !== currentEventId));

        // Resetar form e fechar modal
        setForm({
        title: "",
        start: "",
        location: "",
        description: "",
        color: "#3b82f6",
        });
        setCurrentEventId(null);
        setIsModalOpen(false);
        window.location.reload();
    } catch (err) {
        console.error("Erro ao excluir evento:", err);
    }
    };


  // Handlers
  const handleDateClick = (arg) => openModal("new", arg.date);
  const handleEventClick = (arg) => openModal("edit", null, arg.event);

  // Converte p/ FullCalendar
  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.date,
    backgroundColor: e.color || "#3b82f6",
    extendedProps: {
      location: e.location,
      description: e.description,
    },
  }));

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendário</h1>
          <p className="text-gray-600">Gerencie seus ensaios e eventos</p>
        </div>
        <button
          onClick={() => openModal("new")}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span className="mr-2">＋</span>
          Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={fcEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </div>

{/* Modal */}
{isModalOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={(e) => {
      if (e.target === e.currentTarget) setIsModalOpen(false);
    }}
  >
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          {currentEventId ? "Editar Evento" : "Novo Evento"}
        </h3>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data e Hora
          </label>
          <input
            type="datetime-local"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cor
          </label>
          <select
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="#3b82f6">Azul</option>
            <option value="#10b981">Verde</option>
            <option value="#f59e0b">Amarelo</option>
            <option value="#ef4444">Vermelho</option>
            <option value="#8b5cf6">Roxo</option>
          </select>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancelar
        </button>

        {currentEventId && (
          <button
            onClick={deleteEvent}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Excluir
          </button>
        )}

        <button
          onClick={saveEvent}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
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
