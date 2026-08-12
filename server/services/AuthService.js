import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { httpError } from "../utils/httpError.js";
import { toPublicUser } from "../utils/formatters.js";

const TOKEN_EXPIRES_IN = "7d";
const DEMO_EMAIL_SUFFIX = "@dhakazoo.local";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw httpError(500, "JWT_SECRET is not configured.");
  }
  return secret;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, getJwtSecret(), {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

export const AuthService = {
  async register({ name, email, password, phone }) {
    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
      throw httpError(409, "An account with this email already exists.");
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        passwordHash: await bcrypt.hash(password, 12),
        role: "VISITOR",
      },
    });

    return { user: toPublicUser(user), token: signToken(user) };
  },

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    const demoAccountBlocked =
      process.env.NODE_ENV === "production" && user?.email.endsWith(DEMO_EMAIL_SUFFIX);

    if (demoAccountBlocked || !user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw httpError(401, "Invalid email or password.");
    }

    return { user: toPublicUser(user), token: signToken(user) };
  },

  async verifyToken(token) {
    try {
      const payload = jwt.verify(token, getJwtSecret());
      const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });

      if (!user) {
        throw httpError(401, "User for token no longer exists.");
      }

      return user;
    } catch (error) {
      if (error.status) throw error;
      throw httpError(401, "Invalid or expired token.");
    }
  },
};
