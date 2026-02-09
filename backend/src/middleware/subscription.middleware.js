export function requireActiveSubscription(req, res, next) {
  const { subscription } = req.user;

  if (subscription !== "ACTIVE") {
    return res.status(403).json({
      message: "Active subscription required",
      code: "SUBSCRIPTION_REQUIRED",
    });
  }

  next();
}
