import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Buscar todas as séries
router.get("/", async (req, res) => {
  try {
    const series = await prisma.series.findMany({
      include: { songs: true } // Exemplo: série pode estar ligada a músicas
    });
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar série
router.post("/", async (req, res) => {
  try {
    const { title, description, songsIds } = req.body;

    const series = await prisma.series.create({
      data: {
        title,
        description,
        songs: songsIds
          ? { connect: songsIds.map((id) => ({ id })) }
          : undefined
      },
      include: { songs: true }
    });

    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar série
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, songsIds } = req.body;

    const series = await prisma.series.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        songs: songsIds
          ? { set: songsIds.map((id) => ({ id })) }
          : undefined
      },
      include: { songs: true }
    });

    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar série
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.series.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Série removida com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
