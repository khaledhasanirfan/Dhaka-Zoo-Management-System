import { Router } from "express";
import { z } from "zod";
import { AnimalService } from "../services/AnimalService.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody, validateQuery } from "../utils/validate.js";

const router = Router();

const animalQuerySchema = z.object({
  search: z.string().optional(),
  zone: z.string().optional(),
  dietType: z.string().optional(),
  healthStatus: z.string().optional(),
});

const animalBodySchema = z.object({
  name: z.string().trim().min(2),
  speciesId: z.number().int().positive(),
  zoneId: z.number().int().positive(),
  dob: z.iso.date(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  healthStatus: z.enum(["HEALTHY", "SICK", "RECOVERING", "CRITICAL"]).optional(),
  imageUrl: z.url().optional(),
  caregiverId: z.number().int().positive().optional(),
});

const updateAnimalSchema = animalBodySchema.partial();

router.get("/", validateQuery(animalQuerySchema), asyncHandler(async (req, res) => {
  const animals = await AnimalService.getAll(req.validatedQuery);
  res.json({ animals });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const animal = await AnimalService.getById(req.params.id);
  res.json({ animal });
}));

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(animalBodySchema),
  asyncHandler(async (req, res) => {
    const animal = await AnimalService.create(req.body);
    res.status(201).json({ animal });
  }),
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(updateAnimalSchema),
  asyncHandler(async (req, res) => {
    const animal = await AnimalService.update(req.params.id, req.body);
    res.json({ animal });
  }),
);

export default router;
