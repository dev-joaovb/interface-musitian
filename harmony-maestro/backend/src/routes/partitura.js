import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import cors from "cors";
import { fileURLToPath } from "url";

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // endereço do seu front
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

// 🔹 Configura o caminho estático corretamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔐 Middleware para autenticar token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "segredo_super_seguro", (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    req.user = decoded; // 🔹 Aqui vem o { id, email, role } do login
    next();
  });
}

const prisma = new PrismaClient();
const router = express.Router();

// 📁 Pasta de uploads de partituras
const uploadPath = path.resolve("uploads/partituras");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuração do multer para aceitar apenas PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Apenas arquivos PDF são permitidos!"));
    }
    cb(null, true);
  },
});

// 📌 Listar partituras do usuário logado
router.get("/partitura", authenticateToken, async (req, res) => {
  try {
    const partituras = await prisma.partitura.findMany({
      where: { usuarioId: req.user.id },
      orderBy: { criadoEm: "desc" },
    });
    res.json(partituras);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar partituras." });
  }
});

// 📌 Upload de partitura
router.post("/partitura/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const arquivoUrl = `/uploads/partituras/${req.file.filename}`;

    const partitura = await prisma.partitura.create({
      data: {
        nome,
        descricao,
        arquivoUrl,
        usuarioId: req.user.id,
      },
    });

    res.json(partitura);
  } catch (err) {
    res.status(500).json({ error: "Erro ao enviar a partitura." });
  }
});

// 📌 Deletar partitura
router.delete("/partitura/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const partitura = await prisma.partitura.findUnique({ where: { id } });

    if (!partitura || partitura.usuarioId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado." });
    }

    const filePath = path.resolve(`.${partitura.arquivoUrl}`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.partitura.delete({ where: { id } });
    res.json({ message: "Partitura deletada com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar a partitura." });
  }
});

export default router;
