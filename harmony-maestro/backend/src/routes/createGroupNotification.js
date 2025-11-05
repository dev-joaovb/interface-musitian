// utils/createGroupNotification.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Cria notificações para todos os membros do grupo de um admin.
 * @param {number} adminId - ID do admin (usuário que gerou o evento)
 * @param {string} title - Título da notificação
 * @param {string} message - Mensagem exibida (pode conter o nome do admin)
 * @param {string} route - Caminho de redirecionamento ex: "biblioteca", "partitura"
 */
export async function createGroupNotification(adminId, title, message, route) {
  try {
    // ✅ Busca o admin com nome e ID
    const admin = await prisma.user.findUnique({
      where: { id: Number(adminId) },
      select: { id: true, name: true },
    });

    if (!admin) {
      console.warn(`⚠️ Admin com ID ${adminId} não encontrado ao criar notificação.`);
      return;
    }

    // ✅ Busca todos os usuários convidados pelo admin com status "accepted"
    const invites = await prisma.invite.findMany({
      where: {
        inviterId: admin.id,
        status: "accepted",
      },
      include: {
        invitee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // ✅ Extrai apenas os convidados aceitos
    const recipients = invites.map((i) => i.invitee);

    // ✅ Inclui o próprio admin também
    const allRecipients = [
      ...recipients,
      { id: admin.id, name: admin.name || "Administrador" },
    ];

    // ✅ Cria notificações individuais
    for (const user of allRecipients) {
      await prisma.notification.create({
        data: {
          title,
          message: message.replace("{admin}", admin.name || "Administrador"),
          userId: user.id,
        },
      });
    }

    console.log(
      `🔔 Notificação enviada para ${allRecipients.length} membros (${route}) por ${admin.name}`
    );
  } catch (err) {
    console.error("Erro ao criar notificações de grupo:", err);
  }
}
