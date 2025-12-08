import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ⚙️ Chave secreta do JWT
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_seguro";

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Preencha todos os campos!" });

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ error: "Usuário não encontrado!" });

    // Comparar senhas
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ error: "Senha incorreta!" });

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture, //Incluindo profilePicture no retorno
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

export default router;
