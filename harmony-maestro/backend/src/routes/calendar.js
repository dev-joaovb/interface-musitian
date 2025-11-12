import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { logActivity } from "./logActivity.js";
import { createGroupNotification } from "./createGroupNotification.js";




// 🔐 Middleware para autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user; // user.id vem do token
    next();
  });
}


const router = express.Router();
const prisma = new PrismaClient();

// 🧩 Função para mover um evento para Past_events (versão robusta)
async function moveEventToPast(event) {
  try {
    const exists = await prisma.past_events.findFirst({
      where: { title: event.title, date: event.date, userId: event.userId },
    });

    if (exists) {
      console.log(`ℹ️ Past_events já possui registro para "${event.title}" (${event.id}) — pulando.`);
      return;
    }

    let attendanceResumo = null;
    let presencasDetalhadas = [];

    try {
      // 🔎 1) Busca séries diretamente vinculadas pelo campo seriesId
const seriesBySeriesId = event.seriesId
  ? await prisma.series.findMany({
      where: { id: event.seriesId },
      include: {
        presenca: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })
  : [];

// 🔎 2) Busca séries conectadas via relation many-to-many (events.some)
const seriesByEventRelation = await prisma.series.findMany({
  where: { events: { some: { id: event.id } } },
  include: {
    presenca: {
      include: { user: { select: { id: true, name: true, email: true } } },
    },
  },
});

// 🔎 3) Busca séries do mesmo userId e mesmo "prefixo" de título (fallback)
const seriesByTitleAndUser = await prisma.series.findMany({
  where: {
    userId: event.userId,
    title: { contains: event.title.split(" ")[0] },
  },
  include: {
    presenca: {
      include: { user: { select: { id: true, name: true, email: true } } },
    },
  },
});

// 🔎 4) Junta todas e remove duplicatas por id
const seriesMap = new Map();
for (const s of [
  ...seriesBySeriesId,
  ...seriesByEventRelation,
  ...seriesByTitleAndUser,
]) {
  if (s && !seriesMap.has(s.id)) seriesMap.set(s.id, s);
}
const seriesList = Array.from(seriesMap.values());

      // 🔹 Monta estrutura completa para guardar no JSON (presencasDetalhadas)
      presencasDetalhadas = seriesList.map((serie) => ({
        serieId: serie.id,
        serieTitulo: serie.title || null,
        serieData: serie.startDate ? new Date(serie.startDate).toISOString() : null,
        presencas: (serie.presenca || []).map((p) => ({
          nome: p.user?.name || null,
          email: p.user?.email || null,
          status: p.status || null,
          confirmacaoAdmin: p.confirmacaoAdmin || null,
        })),
      }));

      // 🔹 Cria resumo simples para contagem (opcional)
      const todos = seriesList.flatMap((s) => s.presenca || []);
      if (todos.length > 0) {
        const totalParticipantes = todos.length;
        const compareceram = todos.filter((p) => p.confirmacaoAdmin === "Compareceu");
        const faltaram = todos.filter((p) => p.confirmacaoAdmin === "Não Compareceu");
        const aguardando = todos.filter((p) => p.status === "Aguardando Resposta" && !p.confirmacaoAdmin);

        attendanceResumo = {
          totalParticipantes,
          compareceram: compareceram.length,
          faltaram: faltaram.length,
          aguardando: aguardando.length,
          nomesCompareceram: compareceram.map((p) => p.user?.name || null),
          nomesFaltaram: faltaram.map((p) => p.user?.name || null),
          nomesAguardando: aguardando.map((p) => p.user?.name || null),
        };
      } else {
        // deixa como array vazio e resumo nulo — você pode preferir salvar [] em vez de null
        attendanceResumo = attendanceResumo || null;
      }
    } catch (err) {
      console.warn("⚠️ Erro ao coletar dados de presença:", err);
      // continua e cria o past_events mesmo sem os detalhes
    }

    // 🧩 Cria o registro no histórico (com dados completos)
    const created = await prisma.past_events.create({
      data: {
        title: event.title,
        date: event.date,
        location: event.location ?? null,
        description: event.description ?? null,
        color: event.color ?? null,
        status: "realizado",
        userId: event.userId,
        // campos Json — certifique-se de que Past_events.schema contém esses campos
        attendanceResumo,
        presencas: presencasDetalhadas,
      },
    });

    console.log(`✅ Evento "${event.title}" (id=${event.id}) movido para Past_events (id=${created.id}).`);
  } catch (err) {
    console.error("Erro ao mover evento para Past_events:", err);
  }
}


// Listar todos (da página Series.jsx)
// 📅 Listar eventos do calendário
router.get("/calendar/series", authenticateToken, async (req, res) => {
  try {
    // Busca usuário logado com seus convites recebidos
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { receivedInvites: true },
    });

    let ownerId = user.id; // padrão: ele mesmo
    if (user.role === "user") {
      // se for convidado, busca o admin que o convidou
      const acceptedInvite = user.receivedInvites.find(
        (invite) => invite.status === "accepted" && invite.active
      );
      if (acceptedInvite) ownerId = acceptedInvite.inviterId;
    }

    // busca eventos do admin (ou do próprio user, se for admin)
    const events = await prisma.event.findMany({
      where: { userId: ownerId },
      orderBy: { date: "asc" },
    });

    res.json({
      events,
      role: user.role,
      ownerId,
    });
  } catch (err) {
    console.error("Erro ao buscar eventos:", err);
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});


// Listar eventos - Admin vê seus próprios eventos, User vê do admin que o convidou
router.get("/calendar", authenticateToken, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { receivedInvites: { where: { status: "accepted", active: true } } },
    });

    let targetUserId = req.user.id;

    // Se o usuário for "user", ele verá o calendário do admin que o convidou
    if (currentUser.role === "user" && currentUser.receivedInvites.length > 0) {
      targetUserId = currentUser.receivedInvites[0].inviterId;
    }

    // Buscar eventos do usuário alvo
    const events = await prisma.event.findMany({
      where: { userId: targetUserId },
      orderBy: { date: "asc" },
    });

    const noww = new Date();

    // 🔁 Move todos os eventos que já passaram
    for (const event of events) {
      const eventDate = new Date(event.date);
      console.log("⏰ Verificando evento:", event.title, "Diferença em horas:", (eventDate - noww) / (1000 * 60 * 60));

      if (eventDate < noww) {
        await moveEventToPast(event);

      }
    }

    res.json({ events, role: currentUser.role });
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});



// Criar
router.post("/calendar", authenticateToken, async (req, res) => {
  try {
    const { title, date, location, description, color } = req.body;

    // 🔍 Converter data recebida
    const newEventDate = new Date(date);

    // 🔹 Busca o evento mais recente (maior data)
    const latestEvent = await prisma.event.findFirst({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
    });

    // ⚠️ Verificação: se já existe um evento e o novo é anterior
    if (latestEvent && newEventDate < latestEvent.date) {
      return res.status(400).json({
        error: `Não é permitido criar eventos antes de ${latestEvent.date.toLocaleString("pt-BR")}`,
      });
    }

    // 🆗 Cria o novo evento normalmente
    const event = await prisma.event.create({
      data: {
        title,
        date: newEventDate,
        location,
        description,
        color,
        userId: req.user.id, // 🔹 Relaciona ao usuário logado
      },
    });
    
    await logActivity(
      req.user.id,
      "event_created",
      `Evento "${title}" foi criado por ${req.user.email}`
    );

    await createGroupNotification(
      req.user.id,
      "Novo evento agendado",
      "{admin} marcou um novo evento no calendário, venha conferir.",
      "calendar"
    );


    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});


// Atualizar evento
router.put("/calendar/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, location, description, color, status } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
    });

    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const updated = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
        ...(location && { location }),
        ...(description && { description }),
        ...(color && { color }),
        ...(status && { status }),
      },
    });

    await logActivity(req.user.id, "event_updated", `Evento "${title}" foi atualizado por ${req.user.email}`);

    res.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar evento:", err);
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// 🗓️ Deletar evento + deletar todas as séries órfãs após a remoção do evento
router.delete("/calendar/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = Number(id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.userId !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    await prisma.event.delete({ where: { id: eventId } });

    await logActivity(req.user.id, "event_deleted", `Evento "${event.title}" foi deletado por ${req.user.email}`);

    const orphanSeries = await prisma.series.findMany({
      where: { events: { none: {} } },
      select: { id: true },
    });

    const orphanIds = orphanSeries.map((s) => s.id);

    let deletedSeriesCount = 0;
    if (orphanIds.length > 0) {
      const result = await prisma.series.deleteMany({
        where: { id: { in: orphanIds } },
      });
      deletedSeriesCount = result.count ?? 0;
    }

    return res.json({
      message:
        "Evento deletado com sucesso. Séries órfãs (sem eventos) também foram removidas.",
      deletedEventId: eventId,
      deletedSeriesIds: orphanIds,
      deletedSeriesCount,
    });
  } catch (err) {
    console.error("Erro ao deletar evento:", err);
    res.status(500).json({ error: "Erro ao deletar evento e séries" });
  }
});


// 🧹 Limpar eventos passados automaticamente - executa a cada hora
// const deletePastEvents = async () => {
//   try {
//     const now = new Date(); // horário atual (remove tudo que já passou)

//     // 1) Deleta eventos cuja data já passou
//     const deletedEvents = await prisma.event.deleteMany({
//       where: {
//         date: {
//           lt: now,
//         },
//       },
//     });

//     if (deletedEvents.count > 0) {
//       console.log(`🧹 ${deletedEvents.count} eventos passados removidos automaticamente.`);

//       // 2) Após remover eventos, procura por séries órfãs (sem nenhum evento)
//       const orphanSeries = await prisma.series.findMany({
//         where: { events: { none: {} } },
//         select: { id: true },
//       });

//       const orphanIds = orphanSeries.map((s) => s.id);

//       let deletedSeriesCount = 0;
//       if (orphanIds.length > 0) {
//         const result = await prisma.series.deleteMany({
//           where: { id: { in: orphanIds } },
//         });
//         deletedSeriesCount = result.count ?? 0;
//         console.log(`🧹 ${deletedSeriesCount} séries órfãs removidas automaticamente.`);
//       }

//       // (opcional) se quiser mais informação:
//       if (orphanIds.length > 0) {
//         console.log("🧹 IDs de séries removidas:", orphanIds);
//       }
//     }
//   } catch (err) {
//     console.error("Erro ao limpar eventos passados:", err);
//   }
// };

// // mantém a execução periódica (cada hora) e a execução imediata no boot
// setInterval(deletePastEvents, 60 * 60 * 1000);
// deletePastEvents(); 

const deletePastEvents = async () => {
  try {
    const now = new Date();

    // 1) Buscar eventos do tipo Event que já passaram
    const pastEventsToMove = await prisma.event.findMany({
      where: {
        date: { lt: now },
      },
    });

    // 2) Move cada evento para Past_events (cria a cópia independente)
    for (const ev of pastEventsToMove) {
      try {
        await moveEventToPast(ev);
      } catch (err) {
        console.warn(`Erro ao mover evento ${ev.id} -> Past_events:`, err.message);
      }
    }

    // 3) Deleta os eventos originais que já passaram
    const deletedEvents = await prisma.event.deleteMany({
      where: {
        date: { lt: now },
      },
    });

    if (deletedEvents.count > 0) {
      console.log(`🧹 ${deletedEvents.count} eventos passados removidos automaticamente.`);

      // remover séries órfãs (sem eventos)
      const orphanSeries = await prisma.series.findMany({
        where: { events: { none: {} } },
        select: { id: true },
      });
      const orphanIds = orphanSeries.map((s) => s.id);

      if (orphanIds.length > 0) {
        const result = await prisma.series.deleteMany({
          where: { id: { in: orphanIds } },
        });
        console.log(`🧹 ${result.count ?? 0} séries órfãs removidas automaticamente.`);
      }
    }
  } catch (err) {
    console.error("Erro ao limpar eventos passados:", err);
  }
};

// manter execução periódica
setInterval(deletePastEvents, 60 * 60 * 1000);
deletePastEvents();

export default router;
