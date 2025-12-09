import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { logActivity } from "./logActivity.js";
// import { createGroupNotification } from "./createGroupNotification.js"; // Se necessário para notificar escala

const router = express.Router();
const prisma = new PrismaClient();

// 🔐 Middleware para autenticação (mantido)
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user; // user.id vem do token
    next();
  });
}

// ======================================================================
// Helper Functions (assumindo que ScheduleConfig e WeeklySchedule existem)
// ======================================================================

/**
 * Busca todos os membros ativos (não admin) convidados pelo admin logado.
 * @param {number} adminId - ID do Admin.
 * @returns {Promise<User[]>} Lista de membros.
 */
async function getActiveGroupMembers(adminId) {
    // 1. Encontra todos os convites aceitos enviados por este Admin
    const acceptedInvites = await prisma.invite.findMany({
        where: {
            inviterId: adminId,
            status: "accepted",
        },
        select: {
            inviteeId: true,
        },
    });

    const memberIds = acceptedInvites.map(i => i.inviteeId).filter(id => id !== null);

    const allEligibleIds = [...new Set([...memberIds, adminId])];

    // 2. Busca os dados dos usuários (garantindo que não sejam admin)
    const members = await prisma.user.findMany({
        where: {
            id: { in: allEligibleIds },
            statusAcount: "active",
        },
        select: {
            id: true,
            name: true,
            instrumento: true,
            role: true,
            profilePicture: true,
        }
    });

    return members;
}

/**
 * Calcula a semana atual (1, 2, 3...) baseada na data de início do sistema.
 * Por simplicidade, assumimos o início do sistema como Jan 1 do ano atual.
 * @returns {number} O número da semana desde o início do ano.
 */
function getWeekNumber(date = new Date()) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil((diff / oneWeek));
}

// ======================================================================
// Rota de Configurações Padrão (Admin)
// ======================================================================

/**
 * POST/PUT /api/escala/config - Salva ou atualiza a configuração padrão.
 * ADMIN ONLY
 */
router.post("/escalas/config", authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Acesso negado" });

    try {
        // ✅ Adicione maxSongs à desestruturação
        const { rehearsalDays, eventDay, usersPerScale, maxSongs } = req.body; 

        const config = await prisma.scheduleConfig.upsert({
            where: { ownerId: req.user.id },
            update: {
                rehearsalDays,
                eventDay,
                usersPerScale: Number(usersPerScale),
                maxSongs: Number(maxSongs) || 5, // Padrão 5
            },
            create: {
                ownerId: req.user.id,
                rehearsalDays,
                eventDay,
                usersPerScale: Number(usersPerScale),
                maxSongs: Number(maxSongs) || 5, // Padrão 5
            }
        });

        await logActivity(req.user.id, "schedule_config_updated", "Configurações de escala padrão atualizadas.");
        res.json(config);

    } catch (err) {
        console.error("Erro ao salvar configuração de escala:", err);
        res.status(500).json({ error: "Erro interno ao salvar configuração" });
    }
});

/**
 * GET /api/escala/config - Busca a configuração padrão.
 */
router.get("/escalas/config", authenticateToken, async (req, res) => {
    try {
        const config = await prisma.scheduleConfig.findUnique({
            where: { ownerId: req.user.id },
        });

        if (!config) {
            // Retorna um padrão vazio se não configurado
            return res.json({ rehearsalDays: [], eventDay: null, usersPerScale: 4 });
        }
        res.json(config);
    } catch (err) {
        console.error("Erro ao buscar configuração de escala:", err);
        res.status(500).json({ error: "Erro interno ao buscar configuração" });
    }
});

// ======================================================================
// Lógica de Escala Semanal
// ======================================================================

/**
 * GET /api/escala/current - Gera ou busca a escala da semana atual (ou próxima).
 */
router.get("/escalas/current", authenticateToken, async (req, res) => {
    const adminId = req.user.id;
    const today = new Date();
    const currentWeekNumber = getWeekNumber(today);

    try {
        // 1. Busca a configuração
        const config = await prisma.scheduleConfig.findUnique({ where: { ownerId: adminId } });
        // Garante que usersPerScale é um número válido, ou usa o padrão 4
        const usersPerScale = Number(config?.usersPerScale) || 4; 

        // 2. Tenta buscar a escala já salva para esta semana
        let weeklySchedule = await prisma.weeklySchedule.findFirst({
            where: {
                ownerId: adminId,
                weekNumber: currentWeekNumber,
            },
        });

        // A. Busca todos os membros do grupo ATIVOS
        const allMembers = await getActiveGroupMembers(adminId);
        const memberIds = allMembers.map(m => m.id);
        
        // 3. SE O NÚMERO DE MEMBROS FOR INSUFICIENTE (CORREÇÃO DE FLUXO)
        if (memberIds.length < usersPerScale) {
            // Não retorna 400. Retorna 200 OK com dados vazios para que o frontend não quebre.
            return res.status(200).json({ 
                schedule: null,
                scaledMembers: [],
                songs: [],
                config: config || { rehearsalDays: [], eventDay: null, usersPerScale: 4, maxSongs: 5 },
                error: `Aviso: Apenas ${memberIds.length} membro(s) encontrado(s). Mínimo necessário: ${usersPerScale}.`,
            });
        }
        
        // 4. Se a escala NÃO existir, gera a próxima escala
        if (!weeklySchedule) {
            
            // B. Encontra o ID do último usuário escalado (para rotação)
            const lastSchedule = await prisma.weeklySchedule.findFirst({
                where: { ownerId: adminId },
                orderBy: { weekNumber: 'desc' },
                select: { currentUsers: true }
            });

            let lastUserIds = [];
            if (lastSchedule) {
                // Pega os IDs atuais escalados na última semana (Certificar-se que JSON foi parsed)
                lastUserIds = lastSchedule.currentUsers 
                    ? JSON.parse(JSON.stringify(lastSchedule.currentUsers)).map(u => u.userId)
                    : [];
            }
            
            // C. Lógica de Rotação (A rotação parece OK, mas dependente do estado anterior)
            let startIndex = 0;
            if (lastUserIds.length > 0) {
                const lastUserId = lastUserIds[0];
                startIndex = memberIds.findIndex(id => id === lastUserId);
                
                // Se o último usuário não for encontrado (ex: saiu do grupo), recomeça.
                if (startIndex === -1) {
                    startIndex = 0;
                } else {
                    // Rotaciona para o próximo bloco
                    const nextStartIndex = (startIndex + usersPerScale) % memberIds.length;
                    startIndex = nextStartIndex;
                }
            }
            
            // D. Define os IDs da nova escala
            let newScaleIds = [];
            for (let i = 0; i < usersPerScale; i++) {
                newScaleIds.push(memberIds[(startIndex + i) % memberIds.length]);
            }
            
            const newScaleUsers = newScaleIds.map(id => ({ userId: id, substituteId: null }));
            
            // E. Calcula o início da semana (Próxima Segunda-feira)
            const todayIndex = today.getDay(); // 0 (Domingo) a 6 (Sábado)
            const daysToAdd = todayIndex === 0 ? 1 : (8 - todayIndex); 
            const nextMonday = new Date(today);
            nextMonday.setDate(today.getDate() + daysToAdd);
            nextMonday.setHours(0, 0, 0, 0);


            // F. Salva a nova escala
            weeklySchedule = await prisma.weeklySchedule.create({
                data: {
                    ownerId: adminId,
                    weekNumber: currentWeekNumber,
                    startDate: nextMonday, 
                    originalUserIds: newScaleIds,
                    currentUsers: newScaleUsers,
                }
            });
        }
        
        // 5. Busca os detalhes dos usuários escalados (usando o weeklySchedule gerado ou encontrado)
        const currentScaleIds = weeklySchedule.currentUsers
            ? JSON.parse(JSON.stringify(weeklySchedule.currentUsers)).map(u => u.userId)
            : [];
            
        const usersDetails = await prisma.user.findMany({
            where: { id: { in: currentScaleIds } },
            select: { id: true, name: true, instrumento: true, profilePicture: true }
        });

        // 6. Prepara a resposta, mesclando dados de escala com detalhes do usuário
        const scaledMembers = weeklySchedule.currentUsers.map(scaleItem => {
            const userDetail = usersDetails.find(u => u.id === scaleItem.userId);
            return {
                ...userDetail,
                isSubstitute: scaleItem.substituteId !== null,
                originalMemberId: scaleItem.substituteId,
            };
        });
        
        // 7. Busca as músicas
        const allAvailableSongs = await prisma.song.findMany({
            where: { userId: adminId }, 
            orderBy: { createdAt: 'desc' },
        });

        // 8. IDENTIFICAÇÃO E FILTRAGEM DAS MÚSICAS SELECIONADAS (Ajuste crucial)
        const selectedSongIds = weeklySchedule.selectedSongIds || []; 
        
        // Se selectedSongIds for do tipo JSON no Prisma, pode vir como string, 
        // então deve-se garantir que é um array. Se for Int[], essa etapa não é necessária.
        // Assumindo que o campo 'selectedSongIds' foi salvo como um ARRAY no DB:
        let currentSelectedSongs = [];
        
        if (Array.isArray(selectedSongIds) && selectedSongIds.length > 0) {
            // Filtra a lista completa de músicas para incluir apenas as que têm os IDs selecionados.
            currentSelectedSongs = allAvailableSongs.filter(song => 
                selectedSongIds.includes(song.id)
            );
        }
        
        // Se por algum motivo o selectedSongIds for uma string JSON no DB:
        
        try {
            const ids = typeof selectedSongIds === 'string' ? JSON.parse(selectedSongIds) : selectedSongIds;
            if (Array.isArray(ids)) {
                 currentSelectedSongs = allAvailableSongs.filter(song => 
                    ids.includes(song.id)
                );
            }
        } catch (e) {
            console.error("Erro ao fazer parse dos IDs de músicas selecionadas:", e);
        }
        

        // 9. Retorna a escala e músicas
        res.json({
            schedule: weeklySchedule,
            scaledMembers,
            // songs agora é a lista completa de músicas disponíveis
            songs: allAvailableSongs,
            selectedSongs: currentSelectedSongs, 
            config,
        });

    } catch (err) {
        console.error("Erro fatal ao gerar/buscar escala:", err);
        // Retorna 500 para erros não esperados (como erro no prisma/DB)
        res.status(500).json({ error: "Erro interno ao gerar/buscar escala. Verifique o console do backend." });
    }
});


/**
 * POST /api/escala/substitute - Atualiza a escala com uma substituição.
 * ADMIN ONLY
 */
router.post("/escalas/substitute", authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Acesso negado" });
    
    try {
        const { scheduleId, userToRemoveId, newSubstituteId } = req.body;
        
        const schedule = await prisma.weeklySchedule.findUnique({
            where: { id: Number(scheduleId) },
        });

        if (!schedule) return res.status(404).json({ error: "Escala não encontrada" });

        // 1. Atualiza a lista currentUsers na escala
        const updatedUsers = schedule.currentUsers.map(item => {
            if (item.userId === userToRemoveId) {
                // Substitui o membro A pelo membro H
                return { 
                    userId: newSubstituteId, 
                    substituteId: userToRemoveId // Guarda quem foi substituído
                };
            }
            return item;
        });

        const updatedSchedule = await prisma.weeklySchedule.update({
            where: { id: Number(scheduleId) },
            data: { currentUsers: updatedUsers },
        });

        await logActivity(req.user.id, "schedule_substitution", `Substituição na escala da semana ${schedule.weekNumber}: ${userToRemoveId} substituído por ${newSubstituteId}.`);
        
        // Retorna a escala atualizada (você pode retornar a lista completa novamente)
        res.json(updatedSchedule);

    } catch (err) {
        console.error("Erro ao realizar substituição:", err);
        res.status(500).json({ error: "Erro interno ao realizar substituição" });
    }
});

/**
 * POST /api/escala/songs - Salva as músicas selecionadas para a semana atual.
 * ADMIN ONLY
 */
router.post("/escalas/songs", authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Acesso negado" });
    
    const adminId = req.user.id;
    const today = new Date();
    const currentWeekNumber = getWeekNumber(today);
    
    try {
        const { songIds } = req.body; // Array de IDs de músicas

        // 1. Busca ou cria a escala da semana atual
        let weeklySchedule = await prisma.weeklySchedule.findFirst({
            where: { ownerId: adminId, weekNumber: currentWeekNumber },
        });

        if (!weeklySchedule) {
            // Se a escala ainda não foi gerada, gere-a ou avise. 
            // Para simplificar, assumimos que ela foi gerada na rota /current, 
            // mas se não, vamos procurar o ID.
            const error = "Escala semanal não encontrada. Tente recarregar a página e salvar as configurações de escala primeiro.";
             return res.status(404).json({ error });
        }
        
        // 2. Atualiza a escala com os novos IDs de música
        const updatedSchedule = await prisma.weeklySchedule.update({
            where: { id: weeklySchedule.id },
            data: { 
                selectedSongIds: JSON.stringify(songIds), // Este campo deve ser JSON/Array no seu modelo WeeklySchedule
            },
        });

        await logActivity(req.user.id, "schedule_songs_updated", `Músicas da semana ${currentWeekNumber} atualizadas.`);
        
        res.json({ success: true, schedule: updatedSchedule });

    } catch (err) {
        console.error("Erro ao salvar músicas da escala:", err);
        res.status(500).json({ error: "Erro interno ao salvar músicas" });
    }
});

export default router;