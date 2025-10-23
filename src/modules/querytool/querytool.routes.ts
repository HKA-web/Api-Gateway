import { Router } from "express";
import { jwtAuth } from "../../middlewares/jwtAuth";
import { QueryToolController } from "./querytool.controller";

const router = Router();
const controller = new QueryToolController();

// ---------------------
// SQL Server Endpoints
// ---------------------

router.post("/mssql/read", jwtAuth, controller.runMssqlRead.bind(controller));
router.post("/mssql/create", jwtAuth, controller.runMssqlInsert.bind(controller));
router.put("/mssql/update", jwtAuth, controller.runMssqlUpdate.bind(controller));
router.delete("/mssql/delete", jwtAuth, controller.runMssqlDelete.bind(controller));

export default router;
