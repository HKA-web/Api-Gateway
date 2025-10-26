"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwtAuth_1 = require("../../middlewares/jwtAuth");
const retryRequest_1 = require("../../middlewares/retryRequest");
const querytool_controller_1 = require("./querytool.controller");
const router = (0, express_1.Router)();
const controller = new querytool_controller_1.QueryToolController();
// ---------------------
// SQL Server Endpoints
// ---------------------
router.post("/mssql/read", jwtAuth_1.jwtAuth, retryRequest_1.retryRequest, controller.runMssqlRead.bind(controller));
router.post("/mssql/create", jwtAuth_1.jwtAuth, retryRequest_1.retryRequest, controller.runMssqlInsert.bind(controller));
router.put("/mssql/update", jwtAuth_1.jwtAuth, retryRequest_1.retryRequest, controller.runMssqlUpdate.bind(controller));
router.delete("/mssql/delete", jwtAuth_1.jwtAuth, retryRequest_1.retryRequest, controller.runMssqlDelete.bind(controller));
exports.default = router;
