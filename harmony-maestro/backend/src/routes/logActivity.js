import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function logActivity(userId, type, message) {
  try {
    await prisma.activityLog.create({
      data: { userId, type, message },
    });
  } catch (err) {
    console.error("Erro ao registrar atividade:", err);
  }
  // 🧹 Limpeza automática: apaga logs com mais de 30 dias
  await prisma.activityLog.deleteMany({
    where: {
        createdAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // logs com +30 dias
        },
    },
  });
}
