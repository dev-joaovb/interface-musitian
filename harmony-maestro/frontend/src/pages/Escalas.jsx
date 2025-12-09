import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { Clock, Calendar, Music, Settings, Users, AlertTriangle, CheckCircle } from "lucide-react";

// Mapeamento para nomes de dias e cores
const DAY_MAP = {
    Sunday: 'Domingo',
    Monday: 'Segunda-feira',
    Tuesday: 'Terça-feira',
    Wednesday: 'Quarta-feira',
    Thursday: 'Quinta-feira',
    Friday: 'Sexta-feira',
    Saturday: 'Sábado',
};

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const API_URL = "http://localhost:4000/api/escalas"; // ⚠️ Ajuste o prefixo da sua rota

// --- Componente Modal para Seleção de Músicas ---

const SongSelectionModal = ({ songs, maxSongs, selectedSongs, setSelectedSongs, onClose, token, API_URL, fetchScaleData, setMessage }) => {
    
    // Estado temporário para lidar com a seleção dentro do modal
    const [tempSelected, setTempSelected] = useState(selectedSongs.map(s => s.id));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTempSelected(selectedSongs.map(s => s.id));
    }, [selectedSongs]); // Roda sempre que a prop selectedSongs mudar.
    
    const handleToggle = (songId) => {
        setTempSelected(prev => {
            if (prev.includes(songId)) {
                return prev.filter(id => id !== songId);
            } else if (prev.length < maxSongs) {
                return [...prev, songId];
            } else {
                setMessage(`Aviso: Máximo de ${maxSongs} músicas atingido.`);
                return prev;
            }
        });
    };
    
    // Funçao para salvar as músicas (Você precisa ter a rota POST /api/escalas/songs no backend!)
    const handleSaveSongs = async () => {
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${API_URL}/songs`, { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ songIds: tempSelected }),
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Falha ao salvar músicas');

            setMessage('Músicas da semana salvas com sucesso!');
            await fetchScaleData(); // Recarrega os dados completos
            onClose();

        } catch (err) {
            setMessage(`Erro ao salvar músicas: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <Music className="w-5 h-5 text-purple-600"/> Selecionar Músicas da Semana
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Selecione até **{maxSongs}** músicas da lista. (Selecionadas: {tempSelected.length})
                    </p>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-3 flex-1">
                    {songs.length > 0 ? (
                        songs.map(song => (
                            <div 
                                key={song.id} 
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                    tempSelected.includes(song.id) 
                                        ? 'bg-purple-100 dark:bg-purple-900 border-purple-500' 
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => handleToggle(song.id)}
                            >
                                <p className="font-semibold text-gray-900 dark:text-white">{song.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{song.artist || 'Sem Artista'}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">Nenhuma música disponível. Adicione novas músicas primeiro.</p>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveSongs}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar Músicas'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Componente Principal: Escala ---

export default function Escala() {
    const calendarRef = useRef(null);
    const [user] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
    const token = localStorage.getItem("userToken");
    const userRole = user.role || 'user';

    const [loading, setLoading] = useState(true);
    const [scaleData, setScaleData] = useState(null); // Contém scale, members, songs
    // Atualizado com maxSongs: 5
    const [config, setConfig] = useState({ rehearsalDays: [], eventDay: 'Sunday', usersPerScale: 4, maxSongs: 5 });
    
    const [isSongModalOpen, setIsSongModalOpen] = useState(false); 
    const [selectedSongs, setSelectedSongs] = useState([]); 

    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [fcEvents, setFcEvents] = useState([]); // Eventos para o FullCalendar

    // Função para buscar dados da escala e configuração
    const fetchScaleData = async () => {
        if (!token || !user.id) return;
        setLoading(true);

        // 1. Buscar a escala atual
        try {
            const res = await fetch(`${API_URL}/current`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Falha ao buscar escala');

            setScaleData(data);
            setConfig(data.config);
            setMessage('');

            // ✅ Captura as músicas selecionadas do backend
            setSelectedSongs(data.selectedSongs || []);

        if (data.schedule && data.schedule.startDate) {
            // 2. Gerar eventos do FullCalendar com base na escala (Mock/Exemplo)
            const startDate = new Date(data.schedule.startDate);
            const events = [];

            // Adicionar Ensaio (Mock: 10:00h)
            data.config.rehearsalDays.forEach(dayName => {
                const dayIndex = WEEK_DAYS.indexOf(dayName);
                if (dayIndex !== -1) {
                    const eventDate = new Date(startDate);
                    eventDate.setDate(startDate.getDate() + dayIndex - 1); // 0 (Sun) - 1 (Mon)
                    
                    if (dayIndex === 0) eventDate.setDate(startDate.getDate() + 6); // Ajuste Domingo (Start é segunda)
                    if (dayIndex === 1) eventDate.setDate(startDate.getDate());
                    if (dayIndex > 1) eventDate.setDate(startDate.getDate() + dayIndex -1);

                    events.push({
                        title: `Ensaio Semanal (${data.scaledMembers.length} Músicos)`,
                        start: `${eventDate.toISOString().split('T')[0]}T10:00:00`,
                        allDay: false,
                        color: '#14b8a6', // Teal
                    });
                }
            });

            // Adicionar Evento (Mock: 19:00h)
            if (data.config.eventDay) {
                const dayIndex = WEEK_DAYS.indexOf(data.config.eventDay);
                if (dayIndex !== -1) {
                    const eventDate = new Date(startDate);
                    eventDate.setDate(startDate.getDate() + dayIndex - 1); // Ajuste similar ao ensaio

                    events.push({
                        title: `Apresentação Semanal`,
                        start: `${eventDate.toISOString().split('T')[0]}T19:00:00`,
                        allDay: false,
                        color: '#8b5cf6', // Roxo
                    });
                }
            }

            // MOCK: Adicionar as músicas à descrição dos eventos usando selectedSongs
            const songsList = (data.selectedSongs || []).map(s => `- ${s.title} (${s.artist || 'Sem Artista'})`).join('\n');
            events.forEach(e => {
                e.extendedProps = { description: `Músicas da Semana:\n${songsList}` };
            });

            setFcEvents(events);
        } else {
            // Se não há schedule, garante que o calendário esteja vazio
            setFcEvents([]);
            // Exibe o erro/aviso retornado pelo backend
            if (data.error) {
                setMessage(`${data.error}`);
            }
        }
        } catch (err) {
            setMessage(`Erro: ${err.message}`);
            setScaleData(null); // Limpa dados anteriores

            setConfig({ rehearsalDays: [], eventDay: 'Sunday', usersPerScale: 4, maxSongs: 5 }); 
            setSelectedSongs([]); 

            setFcEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScaleData();
    }, [token, user.id]);

    // Função para salvar as configurações padrão (Admin)
    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await fetch(`${API_URL}/config`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(config),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Falha ao salvar');

            setMessage('Configurações salvas com sucesso!');
            setIsConfigModalOpen(false);
            fetchScaleData(); // Recarrega a escala com a nova config

        } catch (err) {
            setMessage(`Erro ao salvar: ${err.message}`);
        }
    };
    
    // Simulação da lógica de alerta de escala excessiva
    const getScaleWarning = (memberId) => {
        if (memberId % 2 === 0 && scaleData && scaleData.schedule.weekNumber > 1) { 
            return { show: true, text: 'Alerta: Membro escalado na semana passada.' };
        }
        return { show: false };
    };
    
    // Função para abrir o modal de substituição (Lógica Simplificada)
    const handleSubstitute = (memberIdToReplace) => {
        alert(`Implementar modal de substituição para o membro ID: ${memberIdToReplace}`);
    };
    
    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center h-full dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">Carregando escalas...</p>
            </div>
        );
    }
    
    // Garante que config não é nulo e tem os defaults
    const finalConfig = config ?? { rehearsalDays: [], eventDay: null, usersPerScale: 4, maxSongs: 5 };

    const rehearsalDaysNames = finalConfig.rehearsalDays.map(day => DAY_MAP[day]).join(', ') || 'Nenhum dia definido';
    const eventDayName = DAY_MAP[finalConfig.eventDay] || 'Não definido';


    return (
        <div className="flex-1 overflow-auto p-4 md:p-6 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                Escalas de Comprometimento
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-4xl mx-left mb-10">
                Acompanhe a escala da semana, os compromissos agendados e os músicos designados. O sistema aplica a rotação automática semanal.
            </p>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Erro') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                    {message}
                </div>
            )}

            {/* Configurações e Status da Semana */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Status da Escala */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="font-semibold text-lg text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-2">
                        <Calendar className="w-5 h-5"/> Escala Atual
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Semana de: 
                        <strong className="text-gray-800 dark:text-white">
                            {/* Verifica se scaleData.schedule e startDate existem */}
                            {scaleData?.schedule?.startDate 
                                ? new Date(scaleData.schedule.startDate).toLocaleDateString('pt-BR') 
                                : 'Não Definida'}
                        </strong>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Músicos por escala: <strong className="text-gray-800 dark:text-white">{finalConfig.usersPerScale}</strong>
                    </p>
                </div>

                {/* 2. Dias Padrão */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                    <h2 className="font-semibold text-lg text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5"/> Compromissos Padrão
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Ensaios: <strong className="text-gray-800 dark:text-white">{rehearsalDaysNames || 'Nenhum'}</strong>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Evento: <strong className="text-gray-800 dark:text-white">{eventDayName}</strong>
                    </p>
                </div>

                {/* 3. Músicas da Semana */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div>
                        <h2 className="font-semibold text-lg text-teal-600 dark:text-teal-400 mb-2 flex items-center gap-2">
                            <Music className="w-5 h-5"/> Músicas em Foco
                        </h2>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {selectedSongs?.length > 0 ? (
                                selectedSongs?.map((s, index) => ( // Usa selectedSongs (corrigido)
                                    <li key={s.id} className="truncate">
                                        {index + 1}. {s.title}
                                    </li>
                                ))
                            ) : (
                                <li>Nenhuma música selecionada para a semana.</li>
                            )}
                        </ul>
                         <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                            Limite: {finalConfig.maxSongs} músicas.
                        </p>
                    </div>
                    {/* Botão de Seleção (Admin Only) */}
                    {userRole === 'admin' && (
                        <button
                            onClick={() => setIsSongModalOpen(true)}
                            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors w-full"
                        >
                            Selecionar Músicas
                        </button>
                    )}
                </div>
            </div>

            {/* Menu de Configuração (Admin Only) */}
            {userRole === 'admin' && (
                <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between items-center border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Gerencie os dias padrões de ensaio, evento e o número de músicos por escala.
                    </p>
                    <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar Escala
                    </button>
                </div>
            )}
            
            <hr className="border-gray-200 dark:border-gray-800 mb-8" />

            {/* Calendário FullCalendar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-8">
                <FullCalendar
                    ref={calendarRef}
                    height="50vh"
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridWeek"
                    locale={ptBrLocale}
                    weekends={true}
                    headerToolbar={{
                        left: "prev,next",
                        center: "title",
                        right: "today",
                    }}
                    events={fcEvents}
                    // Adicione lógica de dateClick/eventClick se desejar editar eventos aqui
                />
            </div>
            
            <hr className="border-gray-200 dark:border-gray-800 mb-8" />

            {/* Membros Escalados */}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                Músicos Escalados para a Semana
            </h2>
            
            <div className="space-y-3">
                {scaleData?.scaledMembers?.length > 0 ? (
                    scaleData?.scaledMembers?.map(member => {
                        const warning = getScaleWarning(member.id);
                        
                        return (
                            <div 
                                key={member.id} 
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center"
                            >
                                <div className="flex items-center">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=14b8a6&color=fff`}
                                        alt={member.name}
                                        className="w-10 h-10 rounded-full mr-4 border-2 border-teal-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {member.instrumento || 'Instrumento não definido'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Alerta de Escala Excessiva */}
                                    {warning.show && userRole === 'admin' && (
                                        <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            {warning.text}
                                        </div>
                                    )}

                                    {/* Indicador de Substituição */}
                                    {member.isSubstitute && (
                                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                            (Substituto)
                                        </span>
                                    )}

                                    {/* Botão de Substituição (Admin Only) */}
                                    {userRole === 'admin' && (
                                        <button
                                            onClick={() => handleSubstitute(member.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                            disabled={warning.show} // Admin não deve substituir se houver aviso (ou forçar com alerta)
                                        >
                                            Substituir
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-lg">
                        Nenhum membro escalado para esta semana.
                    </div>
                )}
            </div>

            {/* Modal de Configuração (Admin Only) */}
            {userRole === 'admin' && isConfigModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsConfigModalOpen(false); }}
                >
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <form onSubmit={handleSaveConfig}>
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-teal-600"/> Configuração Padrão de Escalas
                                </h3>
                            </div>

                            <div className="p-6 space-y-4">
                                
                                {/* Dias de Ensaio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Dias Padrão de Ensaio (Pode selecionar múltiplos)
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {WEEK_DAYS.slice(1, 6).map(day => ( // Seg à Sex
                                            <label key={day} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={config.rehearsalDays.includes(day)}
                                                    onChange={(e) => {
                                                        const { checked } = e.target;
                                                        setConfig(prev => ({
                                                            ...prev,
                                                            rehearsalDays: checked
                                                                ? [...prev.rehearsalDays, day]
                                                                : prev.rehearsalDays.filter(d => d !== day)
                                                        }));
                                                    }}
                                                    className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-700 mr-2"
                                                />
                                                {DAY_MAP[day]}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Dia do Evento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Dia Padrão de Evento/Apresentação
                                    </label>
                                    <select
                                        value={config.eventDay}
                                        onChange={(e) => setConfig({ ...config, eventDay: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="Sunday">Domingo</option>
                                        <option value="Saturday">Sábado</option>
                                        <option value="Friday">Sexta-feira</option>
                                        <option value="None">Nenhum</option>
                                    </select>
                                </div>
                                
                                {/* Músicos por Escala */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Músicos por Escala (Ex: 4 = ABCD, EFGH)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.usersPerScale}
                                        onChange={(e) => setConfig({ ...config, usersPerScale: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                {/* ✅ NOVO CAMPO: Máximo de Músicas por Semana */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Máximo de Músicas por Escala
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.maxSongs}
                                        onChange={(e) => setConfig({ ...config, maxSongs: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsConfigModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2 inline-block"/> Salvar Configurações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ✅ NOVO MODAL DE SELEÇÃO DE MÚSICAS (Admin Only) */}
            {userRole === 'admin' && isSongModalOpen && (
                <SongSelectionModal
                    songs={scaleData?.songs || []} // Lista completa de músicas disponíveis
                    maxSongs={finalConfig.maxSongs}
                    selectedSongs={selectedSongs}
                    setSelectedSongs={setSelectedSongs}
                    onClose={() => setIsSongModalOpen(false)}
                    token={token}
                    API_URL={API_URL}
                    fetchScaleData={fetchScaleData} // Para recarregar após salvar
                    setMessage={setMessage}
                />
            )}
        </div>
    );
}