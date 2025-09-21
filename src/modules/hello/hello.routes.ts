import { Router } from "express";
import { HelloController } from "./hello.controller";

const router = Router();
const controller = new HelloController();

router.get("/hello", controller.sayHello.bind(controller));

export default router;
