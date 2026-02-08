import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Mock user database - in production, this would be a real database
// NOTE: Passwords are stored in plain text for development only.
// In production, use bcrypt or similar to hash passwords before storage.
const users = [
  {
    id: 1,
    email: "trial@example.com",
    password: "password123",
    role: "user",
    subscription: "TRIAL",
  },
  {
    id: 2,
    email: "active@example.com",
    password: "password123",
    role: "user",
    subscription: "ACTIVE",
  },
  {
    id: 3,
    email: "canceled@example.com",
    password: "password123",
    role: "user",
    subscription: "CANCELED",
  },
];

export async function login(req, res) {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
      code: "INVALID_CREDENTIALS",
    });
  }

  const token = signToken({
    id: user.id,
    role: user.role,
    subscription: user.subscription,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    },
  });
}

export async function register(req, res) {
  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      message: "Email already registered",
      code: "EMAIL_EXISTS",
    });
  }

  // Create new user with TRIAL subscription
  const newUser = {
    id: users.length + 1,
    email,
    password,
    role: "user",
    subscription: "TRIAL",
  };

  users.push(newUser);

  const token = signToken({
    id: newUser.id,
    role: newUser.role,
    subscription: newUser.subscription,
  });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      subscription: newUser.subscription,
    },
  });
}

export async function getMe(req, res) {
  // req.user is set by requireAuth middleware
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    },
  });
}
