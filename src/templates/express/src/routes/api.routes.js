import { Router } from "express";
import { authenticate, requireSubscription } from "../middleware/auth.js";

const router = Router();

// Example protected API endpoint
router.get("/generate", authenticate, requireSubscription, async (req, res) => {
  // This is a placeholder for your actual API logic
  res.json({
    message: "Config generated successfully",
    user: req.user.email,
    subscription: req.user.subscription,
  });
});

export default router;
