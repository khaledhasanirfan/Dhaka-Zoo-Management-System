import prisma from "../lib/prisma.js";
import { httpError } from "../utils/httpError.js";

const includeZones = {
  zones: {
    include: { zone: true },
    orderBy: { visitOrder: "asc" },
  },
};

function zoneCreates(zoneIds = []) {
  return zoneIds.map((zoneId, index) => ({
    zoneId: Number(zoneId),
    visitOrder: index + 1,
  }));
}

export const DayPlannerService = {
  async createPlan(userId, data) {
    return prisma.dayPlan.create({
      data: {
        userId,
        date: new Date(data.date),
        notes: data.notes,
        zones: { create: zoneCreates(data.zoneIds) },
      },
      include: includeZones,
    });
  },

  async getPlan(userId, date) {
    const parsedDate = new Date(date);
    const plan = await prisma.dayPlan.findUnique({
      where: { userId_date: { userId, date: parsedDate } },
      include: includeZones,
    });

    if (!plan) {
      throw httpError(404, "Day plan not found.");
    }

    return plan;
  },

  async updatePlan(userId, id, data) {
    const plan = await prisma.dayPlan.findUnique({ where: { id: Number(id) } });

    if (!plan || plan.userId !== userId) {
      throw httpError(404, "Day plan not found.");
    }

    return prisma.$transaction(async (tx) => {
      if (data.zoneIds) {
        await tx.dayPlanZone.deleteMany({ where: { dayPlanId: plan.id } });
      }

      return tx.dayPlan.update({
        where: { id: plan.id },
        data: {
          ...(data.date && { date: new Date(data.date) }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.zoneIds && { zones: { create: zoneCreates(data.zoneIds) } }),
        },
        include: includeZones,
      });
    });
  },
};
