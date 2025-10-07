import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 📌 Listar todas as séries
router.get("/series", async (req, res) => {
  try {
    const series = await prisma.series.findMany({
      include: { events: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(series);
  } catch (err) {
    console.error("Erro ao listar séries:", err);
    res.status(500).json({ error: "Erro ao listar séries" });
  }
});

// 📌 Criar nova série (vinculada a um evento)
router.post("/series", async (req, res) => {
  try {
    const { eventId, startDate, hour } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
    });

    if (!event) return res.status(404).json({ error: "Evento não encontrado" });

    const seriesDate = new Date(`${startDate}T00:00:00-03:00`);
    const eventDate = new Date(event.date);

    // ❌ Impede cadastro de série após o evento
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
router.put("/series/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, hour } = req.body;

    // Busca a série existente para obter o evento vinculado
    const existingSeries = await prisma.series.findUnique({
      where: { id: Number(id) },
      include: { events: true },
    });

    if (!existingSeries) {
      return res.status(404).json({ error: "Série não encontrada" });
    }

    // Verifica se há evento vinculado e valida a data
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
router.delete("/series/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.series.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Série deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar série:", err);
    res.status(500).json({ error: "Erro ao deletar série" });
  }
});

export default router;
