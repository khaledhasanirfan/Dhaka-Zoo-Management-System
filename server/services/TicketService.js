import crypto from "node:crypto";
import prisma from "../lib/prisma.js";
import { httpError } from "../utils/httpError.js";
import { normalizeEnum } from "../utils/formatters.js";

export const TICKET_PRICES = {
  ADULT: 100,
  CHILD: 50,
  FAMILY: 250,
};

function createTicketCode(type) {
  return `DZ-${type.slice(0, 3)}-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

const ticketInclude = {
  ticketZones: { include: { zone: true } },
};

export const TicketService = {
  async book(userId, data) {
    const type = normalizeEnum(data.type);
    const price = TICKET_PRICES[type];

    if (!price) {
      throw httpError(400, "Unsupported ticket type.");
    }

    const visitDate = new Date(data.visitDate);
    if (Number.isNaN(visitDate.getTime())) {
      throw httpError(400, "Visit date is invalid.");
    }

    return prisma.ticket.create({
      data: {
        userId,
        visitDate,
        type,
        price,
        qrCode: createTicketCode(type),
        status: "ACTIVE",
        ticketZones: data.zoneIds?.length
          ? {
              create: data.zoneIds.map((zoneId) => ({ zoneId: Number(zoneId) })),
            }
          : undefined,
      },
      include: ticketInclude,
    });
  },

  async validate({ qrCode, ticketId }) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          qrCode ? { qrCode } : undefined,
          ticketId ? { id: Number(ticketId) } : undefined,
        ].filter(Boolean),
      },
      include: { user: { select: { id: true, name: true, email: true } }, ...ticketInclude },
    });

    if (!ticket) {
      throw httpError(404, "Ticket not found.");
    }

    return {
      ticket,
      valid: ticket.status === "ACTIVE" && ticket.visitDate >= new Date(new Date().toDateString()),
    };
  },

  async getByUser(userId) {
    return prisma.ticket.findMany({
      where: { userId },
      include: ticketInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id, user) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id) },
      include: ticketInclude,
    });

    if (!ticket) {
      throw httpError(404, "Ticket not found.");
    }

    if (user.role !== "ADMIN" && ticket.userId !== user.id) {
      throw httpError(403, "You can only view your own tickets.");
    }

    return ticket;
  },
};
