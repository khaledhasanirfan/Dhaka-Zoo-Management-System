import prisma from "../lib/prisma.js";
import { httpError } from "../utils/httpError.js";
import { normalizeEnum } from "../utils/formatters.js";

const animalInclude = {
  species: true,
  zone: true,
  feedingSchedules: {
    include: { foodItem: true },
    orderBy: { time: "asc" },
  },
  healthRecords: {
    orderBy: { recordedAt: "desc" },
    take: 3,
  },
};

export const AnimalService = {
  async getAll(filters = {}) {
    const where = {};
    const search = filters.search?.trim();

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { species: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (filters.zone) {
      where.zone = { name: { equals: filters.zone, mode: "insensitive" } };
    }

    if (filters.dietType) {
      where.species = {
        ...(where.species || {}),
        dietType: normalizeEnum(filters.dietType),
      };
    }

    if (filters.healthStatus) {
      where.healthStatus = normalizeEnum(filters.healthStatus);
    }

    return prisma.animal.findMany({
      where,
      include: animalInclude,
      orderBy: [{ zone: { name: "asc" } }, { name: "asc" }],
    });
  },

  async getById(id) {
    const animal = await prisma.animal.findUnique({
      where: { id: Number(id) },
      include: animalInclude,
    });

    if (!animal) {
      throw httpError(404, "Animal not found.");
    }

    return animal;
  },

  async create(data) {
    return prisma.animal.create({
      data: {
        name: data.name,
        speciesId: Number(data.speciesId),
        zoneId: Number(data.zoneId),
        dob: new Date(data.dob),
        gender: data.gender ? normalizeEnum(data.gender) : undefined,
        healthStatus: data.healthStatus ? normalizeEnum(data.healthStatus) : "HEALTHY",
        imageUrl: data.imageUrl,
        caregiverId: data.caregiverId ? Number(data.caregiverId) : undefined,
      },
      include: animalInclude,
    });
  },

  async update(id, data) {
    await this.getById(id);

    return prisma.animal.update({
      where: { id: Number(id) },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.speciesId && { speciesId: Number(data.speciesId) }),
        ...(data.zoneId && { zoneId: Number(data.zoneId) }),
        ...(data.dob && { dob: new Date(data.dob) }),
        ...(data.gender && { gender: normalizeEnum(data.gender) }),
        ...(data.healthStatus && { healthStatus: normalizeEnum(data.healthStatus) }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.caregiverId !== undefined && {
          caregiverId: data.caregiverId ? Number(data.caregiverId) : null,
        }),
      },
      include: animalInclude,
    });
  },
};
