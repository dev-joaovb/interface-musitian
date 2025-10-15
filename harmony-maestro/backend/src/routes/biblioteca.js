import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import path from "path";
import jwt from "jsonwebtoken";

// 🔐 Middleware para autenticar token
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
router.post("/biblioteca", authenticateToken, upload.single("file"), async (req, res) => {
  const { title, artist } = req.body;

  const fileUrl = req.file
    ? `http://localhost:4000/uploads/${req.file.filename}`
    : null;

  const song = await prisma.song.create({
    data: {
      title,
      artist,
      fileUrl,
      userId: req.user.id, // 🔹 vincula a música ao usuário logado
    },
  });

  res.json(song);
});

// PUT /api/biblioteca/:id
router.put("/biblioteca/:id", authenticateToken, upload.single("file"), async (req, res) => {
  const { title, artist } = req.body;
  const songId = Number(req.params.id);

  // Busca música e valida dono
  const existingSong = await prisma.song.findUnique({ where: { id: songId } });
  if (!existingSong) return res.status(404).json({ error: "Música não encontrada" });
  if (existingSong.userId !== req.user.id) return res.status(403).json({ error: "Ação não permitida" });

  const fileUrl = req.file ? `http://localhost:4000/uploads/${req.file.filename}` : undefined;

  const song = await prisma.song.update({
    where: { id: songId },
    data: {
      title,
      artist,
      ...(fileUrl ? { fileUrl } : {}),
    },
  });

  res.json(song);
});

// DELETE /api/biblioteca/:id
router.delete("/biblioteca/:id", authenticateToken, async (req, res) => {
  const songId = Number(req.params.id);

  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) return res.status(404).json({ error: "Música não encontrada" });
  if (song.userId !== req.user.id) return res.status(403).json({ error: "Ação não permitida" });

  await prisma.song.delete({ where: { id: songId } });
  res.json({ message: "Música excluída com sucesso" });
});

export default router;
