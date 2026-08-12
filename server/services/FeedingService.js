import prisma from "../lib/prisma.js";
import { httpError } from "../utils/httpError.js";

const scheduleInclude = {
  animal: { include: { species: true, zone: true } },
  foodItem: true,
  supplier: true,
};

export const FeedingService = {
  async getSchedule() {
    return prisma.feedingSchedule.findMany({
      include: scheduleInclude,
      orderBy: [{ time: "asc" }, { animal: { name: "asc" } }],
    });
  },

  async addEntry(data) {
    return prisma.feedingSchedule.create({
      data: {
        animalId: Number(data.animalId),
        foodItemId: Number(data.foodItemId),
        time: data.time,
        frequency: data.frequency,
        quantity: data.quantity,
        supplierId: data.supplierId ? Number(data.supplierId) : undefined,
      },
      include: scheduleInclude,
    });
  },

  async markFed(id, userId, quantity) {
    const schedule = await prisma.feedingSchedule.findUnique({
      where: { id: Number(id) },
      include: { animal: true },
    });

    if (!schedule) {
      throw httpError(404, "Feeding schedule not found.");
    }

    return prisma.$transaction(async (tx) => {
      const log = await tx.feedingLog.create({
        data: {
          feedingScheduleId: schedule.id,
          animalId: schedule.animalId,
          quantity: quantity || schedule.quantity,
          markedByUserId: userId,
        },
      });

      await tx.animal.update({
        where: { id: schedule.animalId },
        data: { lastFedAt: log.fedAt },
      });

      return log;
    });
  },
};
