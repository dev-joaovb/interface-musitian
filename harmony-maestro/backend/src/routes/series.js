import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { logActivity } from "./logActivity.js";

const router = express.Router();
const prisma = new PrismaClient();

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

// 📌 Listar todas as séries
router.get("/series", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { receivedInvites: true },
    });

    let ownerId = user.id; // padrão: ele mesmo (admin)
    if (user.role === "user") {
      // procura o convite aceito mais recente
      const acceptedInvite = user.receivedInvites.find(
        (i) => i.status === "accepted" && i.active
      );
      if (acceptedInvite) ownerId = acceptedInvite.inviterId;
    }

    const series = await prisma.series.findMany({
      where: { userId: ownerId },
      include: { events: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      series,
      role: user.role,
      ownerId,
    });
  } catch (err) {
    console.error("Erro ao listar séries:", err);
    res.status(500).json({ error: "Erro ao listar séries" });
  }
});


// 📌 Criar nova série (vinculada a um evento)
router.post("/series", authenticateToken, async (req, res) => {
  try {
    const { eventId, startDate, hour } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
    });

    if (!event) return res.status(404).json({ error: "Evento não encontrado" });

    const seriesDate = new Date(`${startDate}T00:00:00-03:00`);
    const eventDate = new Date(event.date);

    if (seriesDate > eventDate) {
      return res.status(400).json({
        error: "Não é possível registrar um ensaio após a data do evento.",
      });
    }

    const series = await prisma.series.create({
      data: {
        title: `Série de Ensaios - ${event.title}`,
        startDate: seriesDate,
        hour,
        userId: req.user.id, // 🔹 Relaciona o usuário autenticado
        events: { connect: { id: Number(eventId) } },
      },
    });

    await logActivity(req.user.id, "series_created", `Série de ensaios para o evento "${event.title}" foi criada por ${req.user.email}`);

    res.json(series);
  } catch (err) {
    console.error("Erro ao criar série:", err);
    res.status(500).json({ error: "Erro ao criar série" });
  }
});



// 📌 Atualizar série
router.put("/series/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, hour } = req.body;

    const existingSeries = await prisma.series.findUnique({
      where: { id: Number(id) },
      include: { events: true },
    });

    if (!existingSeries) {
      return res.status(404).json({ error: "Série não encontrada" });
    }

    // 🔹 Permitir apenas o dono editar
    if (existingSeries.userId !== req.user.id) {
      return res.status(403).json({ error: "Ação não permitida" });
    }

    if (existingSeries.events.length > 0 && startDate) {
      const eventDate = new Date(existingSeries.events[0].date);
      const newSeriesDate = new Date(`${startDate}T00:00:00-03:00`);

      if (newSeriesDate > eventDate) {
        return res.status(400).json({
          error: "A data do ensaio não pode ser posterior à data do evento vinculado.",
        });
      }
    }

    const updated = await prisma.series.update({
      where: { id: Number(id) },
      data: {
        startDate: startDate
          ? new Date(`${startDate}T00:00:00-03:00`)
          : undefined,
        hour: hour || undefined,
      },
    });

    await logActivity(req.user.id, "series_updated", `Série de ensaios "${existingSeries.title}" foi atualizada por ${req.user.email}`);

    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar série:", err);
    res.status(500).json({ error: "Erro ao atualizar série" });
  }
});

/// Atualizações de presença nos ensaios

// ✅ Confirmar presença (cada usuário tem o seu status)  — CORRIGIDO
router.patch("/series/:id/presenca", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // ID da série
    const { status } = req.body; // "Confirmou presença" | "Não Disponível"      "Resposta do usuário para avisar que estará presente ou não no dia do ensaio da série"

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    if (user.role !== "user") {
      return res.status(403).json({ error: "Apenas usuários podem confirmar presença" });
    }

    // verifica se a série existe
    const serie = await prisma.series.findUnique({ where: { id: Number(id) } });
    if (!serie) return res.status(404).json({ error: "Série não encontrada" });

    // tenta encontrar presença existente
    const existing = await prisma.presenca.findFirst({
      where: {
        userId: user.id,
        serieId: Number(id),
      },
    });

    let presenca;
    if (existing) {
      presenca = await prisma.presenca.update({
        where: { id: existing.id },
        data: { status },
      });
    } else {
      presenca = await prisma.presenca.create({
        data: {
          userId: user.id,
          serieId: Number(id),
          status,
        },
      });
    }

    await logActivity(req.user.id, "series_presence_update", `Usuário ${user.name} marcou presença como "${status}"`);

    res.json(presenca);
  } catch (err) {
    console.error("Erro ao confirmar presença:", err);
    res.status(500).json({ error: "Erro ao confirmar presença" });
  }
});


// ✅ Listar presenças (visível apenas para admin)
router.get("/series/:id/presenca", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem visualizar presenças" });
    }

    const { id } = req.params;

    // ✅ 1️⃣ Busca todos os usuários que aceitaram o convite (fazem parte do grupo)
    const acceptedUsers = await prisma.invite.findMany({
      where: {
        status: "accepted",
        active: true,
      },
      include: {
        invitee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // ✅ 2️⃣ Busca todas as presenças registradas para esta série
    const presencas = await prisma.presenca.findMany({
      where: { serieId: Number(id) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // ✅ 3️⃣ Monta a lista final combinando os dois (presenças + usuários sem resposta)
    const listaFinal = acceptedUsers.map((invite) => {
      const userPresenca = presencas.find(
        (p) => p.userId === invite.invitee?.id
      );

      return {
        id: invite.invitee?.id,
        nome: invite.invitee?.name,
        email: invite.invitee?.email,
        status: userPresenca ? userPresenca.status : "Aguardando Resposta",
        confirmacaoAdmin: userPresenca?.confirmacaoAdmin || null,
      };
    });

    // ✅ 4️⃣ Retorna a lista unificada
    res.json(listaFinal);
  } catch (err) {
    console.error("Erro ao listar presenças:", err);
    res.status(500).json({ error: "Erro ao listar presenças" });
  }
});

// ✅ Confirmação de presença (Admin)
router.patch("/series/:serieId/presenca/:userId/confirmar", authenticateToken, async (req, res) => {
  try {
    const { serieId, userId } = req.params;
    const { confirmacao } = req.body; // "Compareceu" | "Não Compareceu"

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Apenas administradores podem confirmar presença" });
    }

    // Verifica se já existe registro de presença
    const presenca = await prisma.presenca.findFirst({
      where: { userId: Number(userId), serieId: Number(serieId) },
    });

    if (!presenca) {
      return res.status(404).json({ error: "Presença não encontrada para este usuário" });
    }

    // Atualiza confirmação
    const updated = await prisma.presenca.update({
      where: { id: presenca.id },
      data: { confirmacaoAdmin: confirmacao },
    });

    res.json(updated);
  } catch (err) {
    console.error("Erro ao confirmar presença:", err);
    res.status(500).json({ error: "Erro ao confirmar presença" });
  }
});



// 📌 Deletar série
router.delete("/series/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.series.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Série não encontrada" });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: "Ação não permitida" });
    }

    await prisma.series.delete({ where: { id: Number(id) } });

    await logActivity(req.user.id, "series_deleted", `Série de ensaios "${existing.title}" foi deletada por ${req.user.email}`);

    res.json({ message: "Série deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar série:", err);
    res.status(500).json({ error: "Erro ao deletar série" });
  }
});

export default router;
