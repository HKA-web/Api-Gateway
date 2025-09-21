import { Router } from "express";
import { QueryToolController } from "./querytool.controller";

const router = Router();
const controller = new QueryToolController();

// SQL Server generic query
router.post("/mssql", controller.runMssqlQuery.bind(controller));

// PostgreSQL
router.post("/pgsql", controller.runPgQuery.bind(controller));

// MySQL
router.post("/mysql", controller.runMysqlQuery.bind(controller));

export default router;
