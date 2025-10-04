import { Router } from "express";
import { jwtAuth } from "../../middlewares/jwtAuth";
import { QueryToolController } from "./querytool.controller";

const router = Router();
const controller = new QueryToolController();

// ---------------------
// SQL Server Endpoints
// ---------------------

// SELECT
router.post("/mssql/query", jwtAuth, controller.runMssqlQuery.bind(controller));

// INSERT
router.post("/mssql/insert", jwtAuth, controller.runMssqlInsert.bind(controller));

// UPDATE
router.post("/mssql/update", jwtAuth, controller.runMssqlUpdate.bind(controller));

// DELETE
router.post("/mssql/delete", jwtAuth, controller.runMssqlDelete.bind(controller));

// PostgreSQL
router.post("/pgsql", jwtAuth , controller.runPgQuery.bind(controller));

// MySQL
router.post("/mysql", jwtAuth, controller.runMysqlQuery.bind(controller));

export default router;
