import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./biblioteca.js";


const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const loggedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        invites: true,
        receivedInvites: true,
      },
    });

    if (!loggedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // 🔹 Se o usuário for 'user', pega o admin que o convidou
    let ownerId = loggedUser.id;
    if (loggedUser.role === "user") {
      const invite = await prisma.invite.findFirst({
        where: {
          inviteeId: loggedUser.id,
          status: "accepted",
          active: true,
        },
      });
      if (invite) ownerId = invite.inviterId;
    }

    // 🔹 Buscar dados do dono (admin do grupo)
    const nextEvent = await prisma.event.findFirst({
      where: { userId: ownerId, date: { gte: new Date() } },
      orderBy: { date: "asc" },
    });

    const activeMembers = await prisma.user.count({
      where: { statusAcount: "active" },
    });

    const songsCount = await prisma.song.count({
      where: { userId: ownerId },
    });

    const partituraCount = await prisma.partitura.count({
      where: { usuarioId: ownerId },
    });
    

    const upcomingEvents = await prisma.event.findMany({
      where: { userId: ownerId, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
      include: { series: true },
    });

    // 🔹 Logs de atividades recentes
    const recentActivities = await prisma.activityLog.findMany({
      where: {
        OR: [
          { userId: ownerId },
          { user: { id: ownerId } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: true },
    });

    res.json({
      role: loggedUser.role,
      ownerId,
      stats: {
        nextEvent: nextEvent
          ? {
              title: nextEvent.title,
              date: nextEvent.date,
              location: nextEvent.location,
            }
          : null,
        activeMembers,
        songsCount,
        partituraCount,
      },
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        status: e.status,
      })),
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        type: a.type,
        message: a.message,
        createdAt: a.createdAt,
        user: a.user ? { id: a.user.id, name: a.user.name } : null,
      })),
    });
  } catch (error) {
    console.error("Erro no dashboard:", error);
    res.status(500).json({ error: "Erro ao carregar dados do dashboard" });
  }
});

// DELETE /api/activity/clear — Limpa logs antigos (somente admin)
router.delete("/activity/clear", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const deleted = await prisma.activityLog.deleteMany({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // logs com +30 dias
      },
    },
  });

  res.json({ message: `🧹 ${deleted.count} logs antigos removidos com sucesso.` });
});


// ✅ Estatísticas de presença — Confirmação dos ensaios
router.get("/dashboard/presencas", authenticateToken, async (req, res) => {
  try {
    // identificar o dono do grupo
    const loggedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    let ownerId = loggedUser.id;
    if (loggedUser.role === "user") {
      const invite = await prisma.invite.findFirst({
        where: { inviteeId: loggedUser.id, status: "accepted", active: true },
      });
      if (invite) ownerId = invite.inviterId;
    }

    // buscar todas as séries (ensaios) do grupo
    const series = await prisma.series.findMany({
      where: { userId: ownerId },
      include: { presenca: true },
    });

    // Contadores
    let confirmados = 0;
    let naoDisponiveis = 0;
    let aguardando = 0;

    series.forEach((s) => {
      s.presenca.forEach((p) => {
        if (p.status === "Confirmou presença") confirmados++;
        else if (p.status === "Não Disponível") naoDisponiveis++;
        else aguardando++;
      });
    });

    res.json({
      confirmados,
      naoDisponiveis,
      aguardando,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas de presença:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});


export default router;
