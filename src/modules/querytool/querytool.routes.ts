import { Router } from "express";
import { QueryToolController } from "./querytool.controller";
import { jwtAuth } from "../../middlewares/jwtAuth";

const router = Router();
const controller = new QueryToolController();

// SQL Server generic query
router.post("/mssql", jwtAuth , controller.runMssqlQuery.bind(controller));

// PostgreSQL
router.post("/pgsql", jwtAuth , controller.runPgQuery.bind(controller));

// MySQL
router.post("/mysql", jwtAuth, controller.runMysqlQuery.bind(controller));

export default router;
