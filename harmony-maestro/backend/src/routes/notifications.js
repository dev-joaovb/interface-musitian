import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Buscar notificações
router.get("/", async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      include: { event: true }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar notificação
router.post("/", async (req, res) => {
  try {
    const { message, eventId } = req.body;
    const notification = await prisma.notification.create({
      data: { message, eventId }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
});

export default router;
