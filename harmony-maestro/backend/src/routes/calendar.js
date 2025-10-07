import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Listar todos
router.get("/calendar", async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});

// Criar
router.post("/calendar", async (req, res) => {
  try {
    const { title, date, location, description, color } = req.body;
    const event = await prisma.event.create({
      data: { title, date: new Date(date), location, description, color },
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

// Atualizar evento
router.put("/calendar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, location, description, color, status } = req.body;

    const event = await prisma.event.update({
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

    res.json(event);
  } catch (err) {
    console.error("Erro ao atualizar evento:", err);
    if (err.code === "P2025") {
      // Prisma error: Record not found
      return res.status(404).json({ error: "Evento não encontrado" });
    }
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// 🗓️ Deletar evento + deletar todas as séries órfãs após a remoção do evento
router.delete("/calendar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = Number(id);

    // 1) Verifica se o evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    // 2) Deleta o evento
    await prisma.event.delete({
      where: { id: eventId },
    });

    // 3) Busca todas as séries que NÃO possuem nenhum evento (órfãs)
    const orphanSeries = await prisma.series.findMany({
      where: {
        events: {
          none: {}, // nenhuma relação em events
        },
      },
      select: { id: true },
    });

    const orphanIds = orphanSeries.map((s) => s.id);

    // 4) Deleta todas as séries órfãs (se houver)
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
    console.error("Erro ao deletar evento e séries relacionadas:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Evento não encontrado" });
    }
    return res.status(500).json({ error: "Erro ao deletar evento e séries" });
  }
});



export default router;
