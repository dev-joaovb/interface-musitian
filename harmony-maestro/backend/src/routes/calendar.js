import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";



// 🔐 Middleware para autenticação
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

const router = express.Router();
const prisma = new PrismaClient();

// Listar todos (da página Series.jsx)
// 📅 Listar eventos do calendário
router.get("/calendar/series", authenticateToken, async (req, res) => {
  try {
    // Busca usuário logado com seus convites recebidos
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { receivedInvites: true },
    });

    let ownerId = user.id; // padrão: ele mesmo
    if (user.role === "user") {
      // se for convidado, busca o admin que o convidou
      const acceptedInvite = user.receivedInvites.find(
        (invite) => invite.status === "accepted" && invite.active
      );
      if (acceptedInvite) ownerId = acceptedInvite.inviterId;
    }

    // busca eventos do admin (ou do próprio user, se for admin)
    const events = await prisma.event.findMany({
      where: { userId: ownerId },
      orderBy: { date: "asc" },
    });

    res.json({
      events,
      role: user.role,
      ownerId,
    });
  } catch (err) {
    console.error("Erro ao buscar eventos:", err);
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});


// Listar eventos - Admin vê seus próprios eventos, User vê do admin que o convidou
router.get("/calendar", authenticateToken, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { receivedInvites: { where: { status: "accepted", active: true } } },
    });

    let targetUserId = req.user.id;

    // Se o usuário for "user", ele verá o calendário do admin que o convidou
    if (currentUser.role === "user" && currentUser.receivedInvites.length > 0) {
      targetUserId = currentUser.receivedInvites[0].inviterId;
    }

    const events = await prisma.event.findMany({
      where: { userId: targetUserId },
      orderBy: { date: "asc" },
    });

    res.json({ events, role: currentUser.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});



// Criar
router.post("/calendar", authenticateToken, async (req, res) => {
  try {
    const { title, date, location, description, color } = req.body;
    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        location,
        description,
        color,
        userId: req.user.id, // 🔹 Relaciona ao usuário logado
      },
    });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

// Atualizar evento
router.put("/calendar/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, location, description, color, status } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
    });

    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const updated = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
        ...(location && { location }),
        ...(description && { description }),
        ...(color && { color }),
        ...(status && { status }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar evento:", err);
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// 🗓️ Deletar evento + deletar todas as séries órfãs após a remoção do evento
router.delete("/calendar/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = Number(id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    await prisma.event.delete({ where: { id: eventId } });

    const orphanSeries = await prisma.series.findMany({
      where: { events: { none: {} } },
      select: { id: true },
    });

    const orphanIds = orphanSeries.map((s) => s.id);

    let deletedSeriesCount = 0;
    if (orphanIds.length > 0) {
      const result = await prisma.series.deleteMany({
        where: { id: { in: orphanIds } },
      });
      deletedSeriesCount = result.count ?? 0;
    }

    return res.json({
      message:
        "Evento deletado com sucesso. Séries órfãs (sem eventos) também foram removidas.",
      deletedEventId: eventId,
      deletedSeriesIds: orphanIds,
      deletedSeriesCount,
    });
  } catch (err) {
    console.error("Erro ao deletar evento:", err);
    res.status(500).json({ error: "Erro ao deletar evento e séries" });
  }
});



export default router;
