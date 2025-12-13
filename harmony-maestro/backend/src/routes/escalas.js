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
        const { rehearsalDays, eventDay, usersPerScale, maxSongs, repeatCount } = req.body;
        
        const config = await prisma.scheduleConfig.upsert({
            where: { ownerId: req.user.id },
            update: {
                rehearsalDays,
                eventDay,
                usersPerScale: Number(usersPerScale),
                maxSongs: Number(maxSongs) || 5, // Padrão 5
                repeatCount: Number(repeatCount) || 1,
            },
            create: {
                ownerId: req.user.id,
                rehearsalDays,
                eventDay,
                usersPerScale: Number(usersPerScale),
                maxSongs: Number(maxSongs) || 5, // Padrão 5
                repeatCount: Number(repeatCount) || 1,
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
        // Garante que usersPerScale e repeatCount são números válidos, ou usam o padrão
        const usersPerScale = Number(config?.usersPerScale) || 4; 
        // Pega o repeatCount da config
        const repeatCount = Number(config?.repeatCount) || 1; 

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
            
            // B. Encontra a ÚLTIMA escala gerada no banco (qualquer semana anterior)
            const lastSchedule = await prisma.weeklySchedule.findFirst({
                where: { ownerId: adminId },
                orderBy: { weekNumber: 'desc' },
                // o Prisma pode quebrar ao tentar selecioná-los em um schema desatualizado.
                select: { currentUsers: true, rotationIndex: true, repeatCounter: true } 
            });
            
            let lastRotationIndex = lastSchedule?.rotationIndex ?? 0;
            let lastRepeatCounter = lastSchedule?.repeatCounter ?? 1;
            
            // --- C. Lógica de Rotação e Repetição (O coração da nova lógica) ---
            let nextRotationIndex = lastRotationIndex;
            let nextRepeatCounter = lastRepeatCounter;
            
            // Verifica se devemos avançar o bloco de rotação
            if (lastRepeatCounter >= repeatCount) {
                // Avança o índice de rotação para o próximo bloco
                nextRotationIndex = (lastRotationIndex + usersPerScale) % memberIds.length;
                // Reinicia o contador de repetição
                nextRepeatCounter = 1; 
            } else {
                // Repete o mesmo bloco e incrementa o contador
                nextRepeatCounter = lastRepeatCounter + 1;
            }
            
            // D. Define os IDs da nova escala
            let newScaleIds = [];
            for (let i = 0; i < usersPerScale; i++) {
                // Começa a partir do índice de rotação calculado
                newScaleIds.push(memberIds[(nextRotationIndex + i) % memberIds.length]);
            }
            
            // E. Calcula o início da semana (Você precisa de uma função que encontre a Segunda-feira da currentWeekNumber)
            // Para simplificar, vamos usar a data de hoje.
            const startDate = new Date(today);
            startDate.setHours(0, 0, 0, 0); // Padrão: 00:00:00 da data atual (se for necessário, ajuste para a Segunda)

            const newScaleUsers = newScaleIds.map(id => ({ userId: id, substituteId: null }));
            
            // F. Salva a nova escala
            weeklySchedule = await prisma.weeklySchedule.create({
                data: {
                    ownerId: adminId,
                    weekNumber: currentWeekNumber,
                    startDate: startDate, // Ajuste para a data correta do início da semana
                    originalUserIds: newScaleIds, // Os IDs definidos pela rotação
                    currentUsers: newScaleUsers,
                    rotationIndex: nextRotationIndex, // ✅ Salva o índice de onde a escala começou
                    repeatCounter: nextRepeatCounter, // ✅ Salva o contador de repetição
                }
            });
        }
        
        // 5. Busca os detalhes dos usuários escalados (usando o weeklySchedule gerado ou encontrado)
        let currentUsersArray = weeklySchedule.currentUsers;

        // ✅ Normalização do JSON/Array (Correção defensiva anterior)
        if (typeof currentUsersArray === 'string') {
            try {
                currentUsersArray = JSON.parse(currentUsersArray);
            } catch (e) {
                console.error("Erro ao fazer parse de currentUsers:", e);
                currentUsersArray = [];
            }
        }
        if (!Array.isArray(currentUsersArray)) {
            currentUsersArray = [];
        }
            
        // 🛑 CORREÇÃO PRINCIPAL AQUI: Garante que todos os IDs são números inteiros
        const currentScaleIds = currentUsersArray
            .map(u => u.userId)
            .filter(id => id !== null && id !== undefined) // Remove entradas nulas/indefinidas por segurança
            .map(id => Number(id)); // CONVERTE O ID PARA NÚMERO

        // Agora, currentScaleIds é uma lista de NÚMEROS: [1, 2, 6, 2]

        // ... (Restante da busca)
        const usersDetails = await prisma.user.findMany({
            where: { id: { in: currentScaleIds } }, // ✅ Agora só recebe números
            select: { id: true, name: true, instrumento: true, profilePicture: true }
        });

        // 6. Prepara a resposta (incluindo o status de substituição)
        const scaledMembers = weeklySchedule.currentUsers.map(scaleItem => {
            const userDetail = usersDetails.find(u => u.id === scaleItem.userId);
            // Assinala quem foi o membro original, se houver substituição
            const originalMemberDetail = scaleItem.substituteId 
                ? allMembers.find(m => m.id === scaleItem.substituteId) : null;
                
            return {
                ...userDetail,
                isSubstitute: scaleItem.substituteId !== null,
                originalMemberName: originalMemberDetail?.name, // Útil para exibir no front
                userRemovedId: scaleItem.substituteId, // O ID do membro que foi removido
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
            const ids = Array.isArray(selectedSongIds) 
                ? selectedSongIds 
                : (typeof selectedSongIds === 'string' ? JSON.parse(selectedSongIds) : []);
                
            if (Array.isArray(ids) && ids.length > 0) {
                currentSelectedSongs = allAvailableSongs.filter(song => 
                    ids.includes(song.id)
                );
            }
        } catch (e) {
            console.error("Erro ao fazer parse dos IDs de músicas selecionadas:", e);
        }
        
        const allAvailableMembers = allMembers;
        
        // 9. Retorna a escala e músicas
        res.json({
            schedule: weeklySchedule,
            scaledMembers,
            songs: allAvailableSongs,
            selectedSongs: currentSelectedSongs, 
            config,
            members: allAvailableMembers,
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
        const { scheduleId, userToRemoveId, newSubstituteId } = req.body; // userToRemoveId é o membro A, newSubstituteId é o G
        
        const schedule = await prisma.weeklySchedule.findUnique({
            where: { id: Number(scheduleId) },
        });

        if (!schedule) return res.status(404).json({ error: "Escala não encontrada" });

        // 1. ATUALIZAÇÃO DA LISTA DE USUÁRIOS ATUAIS
        const updatedUsers = schedule.currentUsers.map(item => {
            // Garante que ambos os IDs são números para comparação
            const currentUserId = Number(item.userId);
            const targetUserToRemoveId = Number(userToRemoveId);
            const newSubId = Number(newSubstituteId);

            if (currentUserId === targetUserToRemoveId) {
                // Substitui o membro A pelo membro G
                return { 
                    userId: newSubId, // O substituto (G) agora ocupa o lugar
                    // ✅ CORRIGIDO: Usa 'substituteId' e armazena o ID do membro que saiu (A)
                    substituteId: targetUserToRemoveId 
                };
            }
            // ✅ GARANTE CONSISTÊNCIA: Se o item é mantido, garante que seus IDs são números
            return {
                userId: currentUserId,
                substituteId: item.substituteId ? Number(item.substituteId) : null
            };
        });

        // 2. ATUALIZAÇÃO DA LISTA DE MEMBROS A PULAR
        // O membro removido (A) deve ser colocado no final da lista de espera
        // Para que ele seja escalado o mais rápido possível na próxima rotação.
        
        // Puxa a lista de IDs originais (que define a ordem de rotação)
        // ✅ GARANTE QUE OS IDS SÃO NÚMEROS
        const userToRemoveNumber = Number(userToRemoveId);
        
        // Puxa a lista de IDs originais (que define a ordem de rotação)
        // ✅ CORRIGIDO: Sanitiza a lista de IDs originais para garantir que são números e não têm undefined
        const originalUserIds = schedule.originalUserIds
            .map(id => Number(id))
            .filter(id => id !== null && id !== undefined && !isNaN(id)); // Remove lixo

        // A. Remove o membro substituído (A)
        const indexToRemove = originalUserIds.indexOf(userToRemoveNumber);
        if (indexToRemove > -1) {
            // remove 1 elemento na posição indexToRemove
            originalUserIds.splice(indexToRemove, 1); 
        }
        
        // B. Adiciona o membro substituído (A) de volta ao final da lista (prioridade)
        // ✅ Corrigido: Usa o ID como número e garante que ele não é nulo antes de adicionar
        let nextOriginalUserIds = originalUserIds;
        if (userToRemoveNumber) {
            nextOriginalUserIds = [...originalUserIds, userToRemoveNumber];
        }

        const updatedSchedule = await prisma.weeklySchedule.update({
            where: { id: Number(scheduleId) },
            data: { 
                currentUsers: updatedUsers,
                // Reinicia a lista de rotação para incluir A no final
                originalUserIds: nextOriginalUserIds // Agora é uma lista limpa de números
            },
        });

        await logActivity(req.user.id, "schedule_substitution", `Substituição na semana ${schedule.weekNumber}: Membro original ${userToRemoveId} substituído por ${newSubstituteId}.`);
        
        // Retorna a escala atualizada
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