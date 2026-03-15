import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function safeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    subscription: user.subscriptionStatus,
  };
}

// POST /api/auth/signup  (also aliased as /register for backward compat)
async function handleSignup(req, res) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name ?? null,
        subscriptionStatus: "TRIAL",
        trialEndsAt,
      },
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/auth/login
async function handleLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

router.post("/signup", handleSignup);
router.post("/register", handleSignup);
router.post("/login", handleLogin);

export default router;
