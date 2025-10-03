import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import path from "path";

const router = express.Router();
const prisma = new PrismaClient();

// Configuração do upload (salva em /uploads)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 🔹 Servir arquivos estáticos (precisa estar no app principal também!)
router.use("/uploads", express.static(path.resolve("uploads")));

// GET /api/biblioteca
router.get("/biblioteca", async (req, res) => {
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(songs);
});

// POST /api/biblioteca
router.post("/biblioteca", upload.single("file"), async (req, res) => {
  const { title, artist } = req.body;

  // 🔹 gera URL completa
  const fileUrl = req.file
    ? `http://localhost:4000/uploads/${req.file.filename}`
    : null;

  const song = await prisma.song.create({
    data: { title, artist, fileUrl },
  });

  res.json(song);
});

// PUT /api/biblioteca/:id
router.put("/biblioteca/:id", upload.single("file"), async (req, res) => {
  const { title, artist } = req.body;

  const fileUrl = req.file
    ? `http://localhost:4000/uploads/${req.file.filename}`
    : undefined;

  const song = await prisma.song.update({
    where: { id: Number(req.params.id) },
    data: {
      title,
      artist,
      ...(fileUrl ? { fileUrl } : {}),
    },
  });

  res.json(song);
});

// DELETE /api/biblioteca/:id
router.delete("/biblioteca/:id", async (req, res) => {
  await prisma.song.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Música excluída com sucesso" });
});

export default router;
