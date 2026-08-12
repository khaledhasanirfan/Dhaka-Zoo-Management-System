import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { TicketService } from "../services/TicketService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody } from "../utils/validate.js";

const router = Router();

const bookSchema = z.object({
  visitDate: z.iso.date(),
  type: z.enum(["adult", "child", "family", "ADULT", "CHILD", "FAMILY"]),
  zoneIds: z.array(z.number().int().positive()).optional(),
});

const validateSchema = z
  .object({
    qrCode: z.string().trim().optional(),
    ticketId: z.number().int().positive().optional(),
  })
  .refine((data) => data.qrCode || data.ticketId, {
    message: "qrCode or ticketId is required.",
  });

router.post("/book", requireAuth, validateBody(bookSchema), asyncHandler(async (req, res) => {
  const ticket = await TicketService.book(req.user.id, req.body);
  res.status(201).json({ ticket });
}));

router.get("/my", requireAuth, asyncHandler(async (req, res) => {
  const tickets = await TicketService.getByUser(req.user.id);
  res.json({ tickets });
}));

router.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const ticket = await TicketService.getById(req.params.id, req.user);
  res.json({ ticket });
}));

router.post(
  "/validate",
  requireAuth,
  requireRole("ADMIN", "STAFF"),
  validateBody(validateSchema),
  asyncHandler(async (req, res) => {
    const result = await TicketService.validate(req.body);
    res.json(result);
  }),
);

export default router;
