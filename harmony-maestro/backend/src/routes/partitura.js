import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { createGroupNotification } from "./createGroupNotification.js";



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

router.get("/partitura/file/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const partitura = await prisma.partitura.findUnique({ where: { id } });
    if (!partitura) return res.status(404).json({ error: "Partitura não encontrada" });

    const filePath = path.resolve("." + partitura.arquivoUrl);

    // Se tiver CORS global no app.js, essa linha é opcional. De qualquer forma:
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");

    return res.sendFile(filePath);
  } catch (err) {
    console.error("Erro ao enviar arquivo da partitura:", err);
    return res.status(500).json({ error: "Erro ao enviar partitura" });
  }
});

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
    let targetUserId = req.user.id;

    // 🔹 Se for "user", busca o admin que o convidou
    if (req.user.role === "user") {
      const invite = await prisma.invite.findFirst({
        where: { inviteeId: req.user.id },
        select: { inviterId: true },
      });

      if (invite && invite.inviterId) {
        targetUserId = invite.inviterId; // acessa o acervo do admin
      }
    }

    const partituras = await prisma.partitura.findMany({
      where: { usuarioId: targetUserId },
      orderBy: { criadoEm: "desc" },
    });

    res.json(partituras);
  } catch (err) {
    console.error("Erro ao buscar partituras:", err);
    res.status(500).json({ error: "Erro ao buscar partituras." });
  }
});

// 📌 Upload de partitura
router.post("/partitura/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    // 🔒 Usuários "user" não podem enviar partituras
    if (req.user.role === "user") {
      return res.status(403).json({ error: "Usuário comum não pode enviar partituras." });
    }

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

    await createGroupNotification(
      req.user.id,
      "Nova partitura adicionada",
      "{admin} adicionou uma nova partitura, venha conferir.",
      "partitura"
    );


    res.json(partitura);
  } catch (err) {
    res.status(500).json({ error: "Erro ao enviar a partitura." });
  }
});


// 📌 Deletar partitura
router.delete("/partitura/:id", authenticateToken, async (req, res) => {
  try {
    // 🔒 Usuários "user" não podem excluir partituras
    if (req.user.role === "user") {
      return res.status(403).json({ error: "Usuário comum não pode excluir partituras." });
    }

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

// FolderPartitura routes could be added here

// 📁 Criar pasta de partituras
router.post("/partitura/pastas", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Apenas administradores podem criar pastas." });

    const { name } = req.body;

    const folder = await prisma.folderPartitura.create({
      data: { name, userId: req.user.id }
    });

    res.json(folder);
  } catch (error) {
    console.error("Erro ao criar pasta:", error);
    res.status(500).json({ error: "Erro ao criar pasta" });
  }
});


// 📁 Listar pastas de partituras do usuário logado
router.get("/partitura/pastas", authenticateToken, async (req, res) => {
  try {
    let targetUserId = req.user.id;

    if (req.user.role === "user") {
      const invite = await prisma.invite.findFirst({
        where: { inviteeId: req.user.id },
        select: { inviterId: true },
      });
      if (invite) targetUserId = invite.inviterId;
    }

    const pastas = await prisma.folderPartitura.findMany({
      where: { userId: targetUserId },
      include: { partituras: true },
      orderBy: { createdAt: "desc" }
    });

    res.json(pastas);
  } catch (error) {
    console.error("Erro ao buscar pastas:", error);
    res.status(500).json({ error: "Erro ao buscar pastas" });
  }
});

// 📁 Mover pasta de partituras
router.put("/partitura/mover/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Apenas administradores podem mover partituras." });

    const partituraId = Number(req.params.id);
    const { folderId } = req.body;

    const find = await prisma.partitura.findUnique({ where: { id: partituraId } });
    if (!find) return res.status(404).json({ error: "Partitura não encontrada" });

    const moved = await prisma.partitura.update({
      where: { id: partituraId },
      data: { folderId: folderId === null ? null : Number(folderId) },
    });

    res.json(moved);
  } catch (error) {
    console.error("Erro ao mover partitura:", error);
    res.status(500).json({ error: "Erro ao mover partitura" });
  }
});


// 🗑️ Deletar pasta de partituras
router.delete("/partitura/pastas/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Apenas administradores podem excluir pastas." });

    const folderId = Number(req.params.id);

    await prisma.partitura.updateMany({
      where: { folderId },
      data: { folderId: null }
    });

    await prisma.folderPartitura.delete({
      where: { id: folderId }
    });

    res.json({ message: "Pasta excluída com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir pasta:", err);
    res.status(500).json({ error: "Erro ao excluir pasta" });
  }
});

// ✏️ Editar pasta de partituras
router.put("/partitura/pastas/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Apenas administradores podem editar pastas." });

    const { name } = req.body;
    const folderId = Number(req.params.id);

    const folder = await prisma.folderPartitura.update({
      where: { id: folderId },
      data: { name }
    });

    res.json(folder);
  } catch (err) {
    console.error("Erro ao editar pasta:", err);
    res.status(500).json({ error: "Erro ao editar pasta" });
  }
});


export default router;
