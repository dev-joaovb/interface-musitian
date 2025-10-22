import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import InputMask from "react-input-mask";

// Mascara para celular (frontend)




const router = express.Router();
const prisma = new PrismaClient();

// ✅ Registro de usuário
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      sexo,
      experiencia,
      instrumento,
      instrumentosQtd,
      idade,
      disponibilidade,
      celular,
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios!" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email já cadastrado!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        sexo,
        experiencia: experiencia ? Number(experiencia) : null,
        instrumento,
        instrumentosQtd: instrumentosQtd ? Number(instrumentosQtd) : null,
        idade: idade ? new Date(idade) : null,
        disponibilidade,
        celular,
      },
    });

    res.json({
      message: "Usuário registrado com sucesso!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});


export default router;
