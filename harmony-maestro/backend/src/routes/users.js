// routes/users.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const router = express.Router();
const prisma = new PrismaClient();

// 🔐 Middleware para autenticação
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

// 🔐 Middleware para verificar se é admin
const verifyAdmin = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
};

// 🧾 Listar todos os usuários (apenas para admin)
router.get("/users", authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// 🔄 Alterar função do usuário (admin/user)
router.patch("/users/:id/role", authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ error: "Função inválida" });
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    });
  } catch (err) {
    console.error("Erro ao atualizar função:", err);
    res.status(500).json({ error: "Erro ao alterar função do usuário" });
  }
});

// 🗑️ Deletar usuário (apenas admin)
router.delete("/users/:id", authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Impede que o admin delete ele mesmo
    if (Number(id) === req.user.id) {
      return res.status(400).json({ error: "Você não pode remover a si mesmo" });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "Usuário removido com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar usuário:", err);
    res.status(500).json({ error: "Erro ao remover usuário" });
  }
});

// ✉️ Configuração do envio de e-mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sejoaovb@gmail.com",
    pass: process.env.EMAIL_PASS, // use uma senha de app do Gmail
  },
});

// 📋 Buscar dados de um usuário
router.get("/userss/:id", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// ✏️ Atualizar dados do usuário (nome, email, senha e notificações)
router.put("/userss/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, senha } = req.body;

    // Só permite atualizar o próprio usuário (ou permitir admins se desejar)
    if (req.user.id !== Number(id)) {
      return res.status(403).json({ error: "Ação não permitida" });
    }

    const updateData = {};

    if (name) updateData.name = name;

    if (email) {
      // evita conflito de email
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== Number(id)) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      updateData.email = email;
    }

    // Atualização de senha com verificação da senha atual
    if (req.body.senhaAtual && req.body.novaSenha) {
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });

      const senhaCorreta = await bcrypt.compare(req.body.senhaAtual, user.password);
      if (!senhaCorreta) {
        return res.status(400).json({ error: "Senha atual incorreta." });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.novaSenha, saltRounds);
      updateData.password = hashedPassword;
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

export default router;
