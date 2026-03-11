import { Router } from "express";
import { handlePayPalWebhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post("/paypal", handlePayPalWebhook);

export default router;
