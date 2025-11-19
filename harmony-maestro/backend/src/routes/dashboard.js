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

    // 🔹 Contar apenas os membros convidados pelo admin dono do grupo
    const activeMembers = await prisma.invite.count({
      where: {
        inviterId: ownerId,   // apenas membros convidados pelo admin
        status: "accepted",   // convite aceito
        active: true          // vínculo ativo
      }
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

// 📊 Novo cálculo de média de presenças/faltas por mês e ano
router.get("/dashboard/faltas/:year/:month", authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10) - 1; // 0–11

    // Identificar o dono
    const loggedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    let ownerId = loggedUser.id;
    if (loggedUser.role === "user") {
      const invite = await prisma.invite.findFirst({
        where: {
          inviteeId: loggedUser.id,
          status: "accepted",
          active: true
        }
      });
      if (invite) ownerId = invite.inviterId;
    }

    // Intervalo do mês selecionado
    const start = new Date(yearNum, monthNum, 1);
    const end = new Date(yearNum, monthNum + 1, 1);

    // Buscar somente eventos do mês
    const eventos = await prisma.past_events.findMany({
      where: {
        userId: ownerId,
        date: {
          gte: start,
          lt: end
        },
        attendanceResumo: { not: null }
      },
      select: {
        attendanceResumo: true
      }
    });

    if (eventos.length === 0) {
      return res.json({
        faltaram: 0,
        compareceram: 0,
        totalParticipantes: 0,
        mediaFaltas: 0,
        mediaPresencas: 0
      });
    }

    // Soma total
    let totalFaltaram = 0;
    let totalCompareceram = 0;
    let totalParticipantes = 0;

    eventos.forEach(ev => {
      const resumo = typeof ev.attendanceResumo === "string"
        ? JSON.parse(ev.attendanceResumo)
        : ev.attendanceResumo;

      totalFaltaram += resumo.faltaram || 0;
      totalCompareceram += resumo.compareceram || 0;
      totalParticipantes += resumo.totalParticipantes || 0;
    });

    // Médias
    const mediaPresencas = totalParticipantes > 0
      ? totalCompareceram / totalParticipantes
      : 0;

    const mediaFaltas = totalParticipantes > 0
      ? totalFaltaram / totalParticipantes
      : 0;

    res.json({
      faltaram: totalFaltaram,
      compareceram: totalCompareceram,
      totalParticipantes,
      mediaFaltas: Number((mediaFaltas * 100).toFixed(2)),
      mediaPresencas: Number((mediaPresencas * 100).toFixed(2))
    });

  } catch (error) {
    console.error("Erro ao calcular médias:", error);
    res.status(500).json({ error: "Erro ao calcular médias" });
  }
});


// 📊 Estatísticas de eventos realizados (por mês e ano)
router.get("/dashboard/eventos-realizados/:year", authenticateToken, async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const loggedUser = await prisma.user.findUnique({ where: { id: req.user.id } });

    let ownerId = loggedUser.id;
    if (loggedUser.role === "user") {
      const invite = await prisma.invite.findFirst({
        where: { inviteeId: loggedUser.id, status: "accepted", active: true },
      });
      if (invite) ownerId = invite.inviterId;
    }

    // Buscar todos eventos realizados do ano
    const events = await prisma.past_events.findMany({
      where: {
        userId: ownerId,
        date: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lte: new Date(`${year}-12-31T23:59:59Z`),
        },
      },
    });

    // Contar eventos por mês
    const months = Array.from({ length: 12 }, (_, i) => ({
      mes: new Date(0, i).toLocaleString("pt-BR", { month: "short" }),
      eventos: 0,
    }));

    events.forEach((e) => {
      const monthIndex = new Date(e.date).getMonth();
      months[monthIndex].eventos++;
    });

    res.json(months);
  } catch (error) {
    console.error("Erro ao gerar estatísticas de eventos realizados:", error);
    res.status(500).json({ error: "Erro ao carregar dados de eventos realizados" });
  }
});

// 📄 Relatório de eventos realizados por mês e ano (com presença dos participantes)
router.get("/dashboard/relatorio/eventos/:year/:month", authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const yearNum = parseInt(year, 10);

    // Normaliza o nome do mês recebido (remove ponto, deixa minúsculo)
    const monthNormalized = month.toLowerCase().replace('.', '').trim();

    // Mapeamento de possíveis formas do mês
    const monthMap = {
      jan: 0, janeiro: 0,
      fev: 1, fevereiro: 1,
      mar: 2, março: 2,
      abr: 3, abril: 3,
      mai: 4, maio: 4,
      jun: 5, junho: 5,
      jul: 6, julho: 6,
      ago: 7, agosto: 7,
      set: 8, setembro: 8,
      out: 9, outubro: 9,
      nov: 10, novembro: 10,
      dez: 11, dezembro: 11
    };

    const monthIndex = monthMap[monthNormalized];
    if (monthIndex === undefined) {
      console.error(`Mês inválido recebido: ${month}`);
      return res.status(400).json({ error: `Mês inválido: ${month}` });
    }

    // Identifica o usuário logado
    const loggedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    let ownerId = loggedUser.id;

    // Se o usuário for comum, pegar o ID do dono (quem convidou)
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

    // 🔹 Busca o responsável (admin/dono do grupo)
    const responsavel = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, name: true, email: true },
    });

    // Define intervalo do mês
    const startDate = new Date(yearNum, monthIndex, 1);
    const endDate = new Date(yearNum, monthIndex + 1, 1);

    // Busca os eventos realizados dentro do período
    const eventos = await prisma.past_events.findMany({
      where: {
        userId: ownerId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Busca os membros (usuários aceitos nos convites)
    const membros = await prisma.invite.findMany({
      where: { status: "accepted", active: true },
      include: {
        invitee: { select: { id: true, name: true, email: true } },
      },
    });

    // Monta os dados detalhados de cada evento
const eventosComDetalhes = await Promise.all(
  eventos.map(async (ev) => {
    return {
      ...ev,
      responsavel,
      presencas: ev.presencas ? JSON.parse(JSON.stringify(ev.presencas)) : [],
      attendanceResumo: ev.attendanceResumo
        ? JSON.parse(JSON.stringify(ev.attendanceResumo))
        : null,
    };
  })
);

    res.json(eventosComDetalhes);
  } catch (error) {
    console.error("Erro ao gerar relatório de eventos:", error);
    res.status(500).json({ error: "Erro ao carregar relatório de eventos" });
  }
});



export default router;
