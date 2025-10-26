import { Router } from "express";
import { jwtAuth } from "../../middlewares/jwtAuth";
import { retryRequest } from "../../middlewares/retryRequest";
import { QueryToolController } from "./querytool.controller";

const router = Router();
const controller = new QueryToolController();

// ---------------------
// SQL Server Endpoints
// ---------------------

router.post(
  "/mssql/read",
  jwtAuth,
  retryRequest,
  controller.runMssqlRead.bind(controller)
);

router.post(
  "/mssql/create",
  jwtAuth,
  retryRequest,
  controller.runMssqlInsert.bind(controller)
);

router.put(
  "/mssql/update",
  jwtAuth,
  retryRequest,
  controller.runMssqlUpdate.bind(controller)
);

router.delete(
  "/mssql/delete",
  jwtAuth,
  retryRequest,
  controller.runMssqlDelete.bind(controller)
);

export default router;
