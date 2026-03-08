import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";

const users = []; // TEMP — replace with DB later
let nextUserId = 1; // Counter for unique user IDs

export async function signup(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = {
    id: nextUserId++,
    email,
    password: hashed,
    role: "user",
    subscription: "trial",
  };

  users.push(user);

  const token = signToken({ id: user.id, role: user.role });

  res.json({ token });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({ id: user.id, role: user.role });

  res.json({ token });
}

export function me(req, res) {
  res.json({ user: req.user });
}
