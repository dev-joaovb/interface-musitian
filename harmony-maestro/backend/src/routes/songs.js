import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Buscar todas as músicas
router.get("/", async (req, res) => {
  try {
    const songs = await prisma.song.findMany();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar uma música
router.post("/", async (req, res) => {
  try {
    const { title, artist, fileUrl } = req.body;
    const song = await prisma.song.create({
      data: { title, artist, fileUrl }
    });
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
