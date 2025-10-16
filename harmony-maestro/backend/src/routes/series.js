import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

// 📌 Listar todas as séries
router.get("/series", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { receivedInvites: true },
    });

    let ownerId = user.id; // padrão: ele mesmo (admin)
    if (user.role === "user") {
      // procura o convite aceito mais recente
      const acceptedInvite = user.receivedInvites.find(
        (i) => i.status === "accepted" && i.active
      );
      if (acceptedInvite) ownerId = acceptedInvite.inviterId;
    }

    const series = await prisma.series.findMany({
      where: { userId: ownerId },
      include: { events: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      series,
      role: user.role,
      ownerId,
    });
  } catch (err) {
    console.error("Erro ao listar séries:", err);
    res.status(500).json({ error: "Erro ao listar séries" });
  }
});


// 📌 Criar nova série (vinculada a um evento)
router.post("/series", authenticateToken, async (req, res) => {
  try {
    const { eventId, startDate, hour } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
    });

    if (!event) return res.status(404).json({ error: "Evento não encontrado" });

    const seriesDate = new Date(`${startDate}T00:00:00-03:00`);
    const eventDate = new Date(event.date);

    if (seriesDate > eventDate) {
      return res.status(400).json({
        error: "Não é possível registrar um ensaio após a data do evento.",
      });
    }

    const series = await prisma.series.create({
      data: {
        title: `Série de Ensaios - ${event.title}`,
        startDate: seriesDate,
        hour,
        userId: req.user.id, // 🔹 Relaciona o usuário autenticado
        events: { connect: { id: Number(eventId) } },
      },
    });

    res.json(series);
  } catch (err) {
    console.error("Erro ao criar série:", err);
    res.status(500).json({ error: "Erro ao criar série" });
  }
});



// 📌 Atualizar série
router.put("/series/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, hour } = req.body;

    const existingSeries = await prisma.series.findUnique({
      where: { id: Number(id) },
      include: { events: true },
    });

    if (!existingSeries) {
      return res.status(404).json({ error: "Série não encontrada" });
    }

    // 🔹 Permitir apenas o dono editar
    if (existingSeries.userId !== req.user.id) {
      return res.status(403).json({ error: "Ação não permitida" });
    }

    if (existingSeries.events.length > 0 && startDate) {
      const eventDate = new Date(existingSeries.events[0].date);
      const newSeriesDate = new Date(`${startDate}T00:00:00-03:00`);

      if (newSeriesDate > eventDate) {
        return res.status(400).json({
          error: "A data do ensaio não pode ser posterior à data do evento vinculado.",
        });
      }
    }

    const updated = await prisma.series.update({
      where: { id: Number(id) },
      data: {
        startDate: startDate
          ? new Date(`${startDate}T00:00:00-03:00`)
          : undefined,
        hour: hour || undefined,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar série:", err);
    res.status(500).json({ error: "Erro ao atualizar série" });
  }
});


// 📌 Deletar série
router.delete("/series/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.series.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Série não encontrada" });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: "Ação não permitida" });
    }

    await prisma.series.delete({ where: { id: Number(id) } });

    res.json({ message: "Série deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar série:", err);
    res.status(500).json({ error: "Erro ao deletar série" });
  }
});

export default router;
