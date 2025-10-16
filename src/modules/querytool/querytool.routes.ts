import { Router } from "express";
import { jwtAuth } from "../../middlewares/jwtAuth";
import { QueryToolController } from "./querytool.controller";

const router = Router();
const controller = new QueryToolController();

// ---------------------
// SQL Server Endpoints
// ---------------------

router.post("/mssql/query", jwtAuth, controller.runMssqlQuery.bind(controller));

router.post("/mssql/insert", jwtAuth, controller.runMssqlInsert.bind(controller));

router.post("/mssql/update", jwtAuth, controller.runMssqlUpdate.bind(controller));

router.post("/mssql/delete", jwtAuth, controller.runMssqlDelete.bind(controller));

export default router;
