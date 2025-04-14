import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyToken.js";
import { verifyUser } from "../controllers/form.controller.js";
import { addBot, formSubmit } from "../utils/bot.util.js";

const router = Router();

router.get("/verify-token", verifyJWT, verifyUser);
router.post("/submit", verifyJWT, formSubmit);

export default router;
