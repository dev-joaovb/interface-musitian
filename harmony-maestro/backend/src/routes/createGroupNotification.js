import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createGroupNotification(adminId, title, message) {
  try {
    // 🔹 Busca o admin (quem está enviando as notificações)
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { name: true },
    });

    if (!admin) {
      console.error(`Admin com ID ${adminId} não encontrado.`);
      return;
    }

    // 🔹 Busca todos os membros do grupo com convite aceito
    const groupMembers = await prisma.invite.findMany({
      where: { inviterId: adminId, status: "accepted" },
      include: { invitee: true },
    });

    if (groupMembers.length === 0) return;

    // 🔹 Substitui {adminName} na mensagem por nome real do admin
    const personalizedMessage = message.replace(
      /\{adminName\}/g,
      admin.name || "Administrador"
    );

    // 🔹 Cria as notificações personalizadas
    const notificationsData = groupMembers.map((m) => ({
      title,
      message: personalizedMessage,
      userId: m.inviteeId,
      date: new Date(),
    }));

    await prisma.notification.createMany({ data: notificationsData });
    console.log(
      `📢 Notificação enviada para ${groupMembers.length} membros do grupo de ${admin.name}.`
    );
  } catch (err) {
    console.error("Erro ao criar notificações em grupo:", err);
  }
}
