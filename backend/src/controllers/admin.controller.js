import prisma from "../utils/prisma.js";

export async function getUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      subscription: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ users });
}

export async function updateSubscription(req, res) {
  const { userId, subscription } = req.body;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { subscription },
  });

  res.json({ success: true, user: updated });
}
