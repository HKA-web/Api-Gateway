import { Router } from "express";
import { jwtAuth } from "../../middlewares/jwtAuth";
import { QueryToolController } from "./querytool.controller";

const router = Router();
const controller = new QueryToolController();

// SQL Server generic query
router.post("/mssql", jwtAuth , controller.runMssqlQuery.bind(controller));

// PostgreSQL
router.post("/pgsql", jwtAuth , controller.runPgQuery.bind(controller));

// MySQL
router.post("/mysql", jwtAuth, controller.runMysqlQuery.bind(controller));

export default router;
