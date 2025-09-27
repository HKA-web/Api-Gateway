import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

// Auth
const controller = new AuthController();
router.post("/login", controller.login.bind(controller));
router.post("/refresh", controller.refresh.bind(controller));


export default router;
