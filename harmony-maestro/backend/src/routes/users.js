// routes/users.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import multer from "multer";

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Exemplo: Armazenar no diretório 'uploads/perfil/'
    cb(null, 'uploads/perfil/'); 
  },
  filename: (req, file, cb) => {
    // Nome do arquivo: user-ID-timestamp.ext
    cb(null, `user-${req.user.id}-${Date.now()}.${file.originalname.split('.').pop()}`);
  }
});

const upload = multer({ storage: storage });

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

// // ✉️ Configuração do envio de e-mail
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "sejoaovb@gmail.com",
//     pass: process.env.EMAIL_PASS, // use uma senha de app do Gmail
//   },
// });

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

    if (req.user.id !== Number(id)) {
      return res.status(403).json({ error: "Ação não permitida" });
    }

    const {
      nome,
      email,
      senhaAtual,
      novaSenha,
      notifEmail,
      tema,
      experiencia,
      instrumentosQtd,
      instrumento,
      disponibilidade,
      celular,
    } = req.body;

    const updateData = {};

    if (nome) updateData.name = nome;
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== Number(id)) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      updateData.email = email;
    }

    // Validação do tema
    if (typeof tema !== "undefined") {
      if (!["light", "dark"].includes(tema)) {
        return res.status(400).json({ error: "Tema inválido" });
      }
      updateData.tema = tema;
    }

    if (typeof notifEmail !== "undefined") updateData.notifEmail = notifEmail;
    if (typeof experiencia !== "undefined") updateData.experiencia = Number(experiencia);
    if (typeof instrumentosQtd !== "undefined") updateData.instrumentosQtd = Number(instrumentosQtd);
    if (instrumento) updateData.instrumento = instrumento;
    if (disponibilidade) updateData.disponibilidade = disponibilidade;
    if (celular) updateData.celular = celular;

    // Atualização de senha com verificação
    if (senhaAtual && novaSenha) {
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      const senhaCorreta = await bcrypt.compare(senhaAtual, user.password);
      if (!senhaCorreta) {
        return res.status(400).json({ error: "Senha atual incorreta." });
      }

      const hashed = await bcrypt.hash(novaSenha, 10);
      updateData.password = hashed;
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        notifEmail: true,
        tema: true,
        experiencia: true,
        instrumentosQtd: true,
        instrumento: true,
        disponibilidade: true,
        celular: true,
        sexo: true,
        idade: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});


// 🖼️ Rota para atualizar a foto de perfil
router.patch("/userss/:id/profile-picture", authenticateToken, upload.single("profilePicture"), // ✅ Middleware Multer para 1 arquivo
  async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.id !== Number(id)) {
        return res.status(403).json({ error: "Ação não permitida" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }

      // 💡 O caminho onde o arquivo foi salvo pelo Multer
      // Você deve ajustar este path para a URL pública se estiver usando S3 ou outro serviço
      const profilePicturePath = `/uploads/perfil/${req.file.filename}`; 

      const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: { profilePicture: profilePicturePath }, // ✅ Atualiza o campo no DB
        select: {
          profilePicture: true,
          name: true,
        },
      });

      res.json(updated);
    } catch (err) {
      console.error("Erro ao fazer upload da foto:", err);
      res.status(500).json({ error: "Erro ao atualizar foto de perfil" });
    }
  }
);


// 🔹 Rota para obter o perfil do usuário logado
router.get("/users/profile", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        statusAcount: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    res.status(500).json({ error: "Erro ao carregar perfil." });
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para porta 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📬 Rota Pública: Receber formulário de contato da Landing Page
router.post("/users/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1. Validação básica
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    // 2. Salvar no Banco de Dados
    const newMessage = await prisma.contactMessage.create({
      data: { name, email, message },
    });

    // 3. Enviar E-mail de Notificação para o Admin (Opcional, mas recomendado)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Você recebe o e-mail
      subject: `🎵 Novo Contato: ${name}`,
      text: `Você recebeu uma nova mensagem de ${name} (${email}):\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Novo contato via Landing Page</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensagem:</strong></p>
          <p style="background: #f4f4f4; pading: 15px; border-radius: 5px;">${message}</p>
          <hr />
          <small>Enviado em: ${new Date().toLocaleString()}</small>
        </div>
      `,
    };

    // Enviando o e-mail (não bloqueia a resposta pro usuário)
    transporter.sendMail(mailOptions).catch(err => console.error("Erro email:", err));

    res.status(201).json({ 
      message: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
      id: newMessage.id 
    });

  } catch (err) {
    console.error("Erro na rota de contato:", err);
    res.status(500).json({ error: "Erro interno ao processar sua mensagem." });
  }
});

// 📋 Rota Privada: Listar mensagens de contato (Apenas Admin)
router.get("/users/contact/messages", authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar mensagens." });
  }
});

export default router;
