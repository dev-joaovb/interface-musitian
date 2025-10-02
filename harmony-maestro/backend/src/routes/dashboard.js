import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    // 📌 Estatísticas
    const nextEvent = await prisma.event.findFirst({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" }
    });

    const activeMembers = await prisma.member.count({
      where: { active: true }
    });

    const songsCount = await prisma.song.count();

    // 📌 Próximos Ensaios
    const upcomingEvents = await prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
      include: { series: true }
    });

    // 📌 Atividades Recentes
    // Sugestão: criar um modelo `ActivityLog` no Prisma para registrar qualquer evento
    const recentActivities = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true }
    });

    res.json({
      stats: {
        nextEvent: nextEvent
          ? {
              title: nextEvent.title,
              date: nextEvent.date,
              location: nextEvent.location
            }
          : null,
        activeMembers,
        songsCount
      },
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        status: e.status // Ex: "escalado", "pendente"
      })),
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        type: a.type,
        message: a.message,
        createdAt: a.createdAt,
        user: a.user ? { id: a.user.id, name: a.user.name } : null
      }))
    });
  } catch (error) {
    console.error("Erro no dashboard:", error);
    res.status(500).json({ error: "Erro ao carregar dados do dashboard" });
  }
});

export default router;
