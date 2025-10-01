import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Buscar todos os eventos
router.get("/", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { notifications: true }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar evento
router.post("/", async (req, res) => {
  try {
    const { title, date, location } = req.body;
    const event = await prisma.event.create({
      data: { title, date: new Date(date), location }
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
