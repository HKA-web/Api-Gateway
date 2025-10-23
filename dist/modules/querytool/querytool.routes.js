"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwtAuth_1 = require("../../middlewares/jwtAuth");
const querytool_controller_1 = require("./querytool.controller");
const router = (0, express_1.Router)();
const controller = new querytool_controller_1.QueryToolController();
// ---------------------
// SQL Server Endpoints
// ---------------------
router.post("/mssql/read", jwtAuth_1.jwtAuth, controller.runMssqlRead.bind(controller));
router.post("/mssql/create", jwtAuth_1.jwtAuth, controller.runMssqlInsert.bind(controller));
router.put("/mssql/update", jwtAuth_1.jwtAuth, controller.runMssqlUpdate.bind(controller));
router.delete("/mssql/delete", jwtAuth_1.jwtAuth, controller.runMssqlDelete.bind(controller));
exports.default = router;
