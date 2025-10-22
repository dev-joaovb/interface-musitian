// routes/inviteRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { logActivity } from "./logActivity.js";

const router = express.Router();
const prisma = new PrismaClient();

// 🧹 Excluir convites "pending" com mais de 12h
const deleteOldPendingInvites = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 horas atrás
    const deleted = await prisma.invite.deleteMany({
      where: {
        status: "pending",
        createdAt: {
          lt: cutoffDate, // lt = menor que (anterior à data limite)
        },
      },
    });

    if (deleted.count > 0) {
      console.log(`🧹 ${deleted.count} convites pendentes antigos removidos automaticamente.`);
    }
  } catch (err) {
    console.error("Erro ao excluir convites pendentes antigos:", err);
  }
};


// 👥 Listar membros do grupo de um administrador
router.get("/group/:inviterId", async (req, res) => {
  try {

    // 🧹 Limpa convites pendentes antigos antes de listar
    await deleteOldPendingInvites();

    const { inviterId } = req.params;

    const members = await prisma.invite.findMany({
      where: {
        inviterId: Number(inviterId),
        status: "accepted",
      },
      include: {
        invitee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Retorna apenas os usuários (sem duplicar estrutura)
    const formatted = members.map((m) => m.invitee);

    res.json(formatted);
  } catch (err) {
    console.error("Erro ao buscar membros do grupo:", err);
    res.status(500).json({ error: "Erro interno ao buscar membros do grupo" });
  }
});

// Usuário convidado
// 👤 Ver administrador que convidou e outros membros do mesmo grupo
router.get("/groupinfo/:userId", async (req, res) => {
  try {

    // 🧹 Limpa convites pendentes antigos antes de listar
    await deleteOldPendingInvites();

    const { userId } = req.params;

    // Busca o convite que o usuário recebeu e foi aceito
    const invite = await prisma.invite.findFirst({
      where: {
        inviteeId: Number(userId),
        status: "accepted",
      },
      include: {
        inviter: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!invite) {
      return res.status(404).json({ error: "Nenhum grupo associado encontrado." });
    }

    // Busca outros usuários convidados pelo mesmo admin que também aceitaram
    const outrosMembros = await prisma.invite.findMany({
      where: {
        inviterId: invite.inviterId,
        status: "accepted",
      },
      include: {
        invitee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const membros = outrosMembros
      .map((m) => m.invitee)
      .filter((u) => u && u.id !== Number(userId)); // Remove o próprio usuário da lista

    res.json({
      admin: invite.inviter,
      membros,
    });
  } catch (err) {
    console.error("Erro ao buscar grupo do usuário:", err);
    res.status(500).json({ error: "Erro interno ao buscar grupo do usuário" });
  }
});

// 🔍 Buscar usuário por email
router.get("/users/search", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email é obrigatório" });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).json({ error: "Erro interno ao buscar usuário" });
  }
});

// 🔍 Buscar informações detalhadas de um usuário (para admin visualizar antes de convidar)
router.get("/users/details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        sexo: true,
        experiencia: true,
        instrumento: true,
        instrumentosQtd: true,
        idade: true,
        disponibilidade: true,
        celular: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    console.error("Erro ao buscar detalhes do usuário:", err);
    res.status(500).json({ error: "Erro interno ao buscar detalhes do usuário" });
  }
});


// Alias (compatibilidade) => /invites/received/:userId
router.get("/invites/received/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const invites = await prisma.invite.findMany({
      where: { inviteeId: userId, status: "pending" },
      include: {
        inviter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(invites);
  } catch (err) {
    console.error("Erro ao buscar convites (received):", err);
    res.status(500).json({ error: "Erro interno ao buscar convites" });
  }
});


// ✉️ Criar convite (melhorado)
router.post("/invites", async (req, res) => {
  try {
    const { inviterId, inviteeEmail } = req.body;
    if (!inviterId || !inviteeEmail)
      return res.status(400).json({ error: "Dados insuficientes" });

    // 🧩 Impede auto-convite
    const inviter = await prisma.user.findUnique({ where: { id: Number(inviterId) } });
    if (inviter?.email === inviteeEmail)
      return res.status(400).json({ error: "Você não pode enviar convite para si mesmo" });

    const invitee = await prisma.user.findUnique({
      where: { email: inviteeEmail },
    });
    if (!invitee)
      return res.status(404).json({ error: "Usuário convidado não encontrado" });

    // 🚫 Evita duplicidade (pendente ou aceito)
    const existing = await prisma.invite.findFirst({
      where: {
        inviterId,
        inviteeId: invitee.id,
        status: { in: ["pending", "accepted"] },
        active: true,
      },
    });
    if (existing)
      return res.status(400).json({ error: "Convite já existente entre esses usuários" });

    const invite = await prisma.invite.create({
      data: {
        inviterId,
        inviteeId: invitee.id,
        inviteeEmail,
        status: "pending",
        active: true,
      },
    });

    await logActivity(inviterId, "invite_created", `Convite enviado para ${inviteeEmail} por ${inviter.email}`);

    res.json(invite);
  } catch (err) {
    console.error("Erro ao criar convite:", err);
    res.status(500).json({ error: "Erro interno ao criar convite" });
  }
});

// 📬 Listar convites recebidos (para o usuário logado)
router.get("/invites/:userId", async (req, res) => {

  try {

    // 🧹 Limpa convites pendentes antigos antes de listar
    await deleteOldPendingInvites();

    const { userId } = req.params;

    const invites = await prisma.invite.findMany({
      where: {
        inviteeId: Number(userId),
        status: "pending",
      },
      include: {
        inviter: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(invites);
  } catch (err) {
    console.error("Erro ao listar convites recebidos:", err);
    res.status(500).json({ error: "Erro interno ao listar convites" });
  }
});

// ✅ Aceitar convite
router.post("/invites/accept/:inviteId", async (req, res) => {
  try {
    const inviteId = Number(req.params.inviteId);
    const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
    if (!invite) return res.status(404).json({ error: "Convite não encontrado" });
    if (invite.status !== "pending") return res.status(400).json({ error: "Convite já respondido" });

    const updated = await prisma.invite.update({
      where: { id: inviteId },
      data: { status: "accepted" },
    });

    // notifica quem convidou
    await prisma.notification.create({
      data: {
        title: "Convite aceito",
        message: `${invite.inviteeEmail} aceitou seu convite.`,
        userId: invite.inviterId,
        date: new Date(),
      },
    });

    await logActivity(invite.inviteeId, "invite_accepted", `Convite aceito por ${invite.inviteeEmail}`);

    res.json(updated);
  } catch (err) {
    console.error("Erro ao aceitar convite:", err);
    res.status(500).json({ error: "Erro interno ao aceitar convite" });
  }
});

// ❌ Recusar convite
router.post("/invites/reject/:inviteId", async (req, res) => {
  try {
    const { inviteId } = req.params;

    const invite = await prisma.invite.findUnique({
      where: { id: Number(inviteId) },
    });

    if (!invite) return res.status(404).json({ error: "Convite não encontrado" });
    if (invite.status !== "pending")
      return res.status(400).json({ error: "Convite já respondido" });

    const updated = await prisma.invite.update({
      where: { id: Number(inviteId) },
      data: { status: "rejected" },
    });

    // Notifica o dono
    await prisma.notification.create({
      data: {
        title: "Convite recusado",
        message: `O usuário ${invite.inviteeEmail} recusou seu convite.`,
        userId: invite.inviterId,
      },
    });

    await logActivity(invite.inviteeId, "invite_rejected", `Convite recusado por ${invite.inviteeEmail}`);

    res.json(updated);
  } catch (err) {
    console.error("Erro ao recusar convite:", err);
    res.status(500).json({ error: "Erro ao recusar convite" });
  }
});

// Alterar status do usuario
// PATCH /api/users/role/:userId
router.patch("/users/role/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { role },
    });

    await logActivity(Number(userId), "enter_group", `Usuário ${updatedUser.email} entrou no grupo a convite do administrador.`);

    res.json(updatedUser);
  } catch (err) {
    console.error("Erro ao atualizar role do usuário:", err);
    res.status(500).json({ error: "Erro interno ao atualizar role" });
  }
});

// Atualizar status do convite para "leaver" quando o usuário sair do grupo
router.patch("/invites/leave/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {},
    });

    // Atualiza o status de todos os convites aceitos desse usuário
    await prisma.invite.updateMany({
      where: {
        inviteeId: Number(userId),
        status: "accepted",
      },
      data: {
        status: "leaver", // Marca como "leaver" para indicar que saiu do grupo
      },
    });

    await logActivity(Number(userId), "leave_group", `Usuário ${updatedUser.email} saiu do grupo.`);

    res.json({ message: "Status do convite atualizado para 'rejected'" });
  } catch (err) {
    console.error("Erro ao atualizar status do convite:", err);
    res.status(500).json({ error: "Erro interno ao atualizar status do convite" });
  }
});

// 🔔 Criar notificação
router.post("/notifications", async (req, res) => {
  try {
    const { title, message, userId } = req.body;
    if (!title || !message || !userId)
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        userId,
        date: new Date(),
      },
    });

    res.json(notification);
  } catch (err) {
    console.error("Erro ao criar notificação:", err);
    res.status(500).json({ error: "Erro interno ao criar notificação" });
  }

});

// 🧹 Limpar notificações antigas (mais de 24h) - executa a cada hora
const deleteOldNotifications = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h atrás
    const deleted = await prisma.notification.deleteMany({
      where: {
        date: {
          lt: cutoffDate, // lt = menor que
        },
      },
    });
    if (deleted.count > 0) {
      console.log(`🧹 ${deleted.count} notificações antigas removidas automaticamente.`);
    }
  } catch (err) {
    console.error("Erro ao limpar notificações antigas:", err);
  }
};

// 📋 Listar notificações
router.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { date: "desc" },
    });

    deleteOldNotifications();

    res.json(notifications);
  } catch (err) {
    console.error("Erro ao listar notificações:", err);
    res.status(500).json({ error: "Erro interno ao listar notificações" });
  }
});

export default router;
