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

// Atualizar
router.put("/calendar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, location, description, color } = req.body;
    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: { title, date: new Date(date), location, description, color },
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// Deletar
router.delete("/calendar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id: Number(id) } });
    res.json({ message: "Evento deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar evento" });
  }
});

export default router;
