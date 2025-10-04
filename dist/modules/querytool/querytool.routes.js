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
// SELECT
router.post("/mssql/query", jwtAuth_1.jwtAuth, controller.runMssqlQuery.bind(controller));
// INSERT
router.post("/mssql/insert", jwtAuth_1.jwtAuth, controller.runMssqlInsert.bind(controller));
// UPDATE
router.post("/mssql/update", jwtAuth_1.jwtAuth, controller.runMssqlUpdate.bind(controller));
// DELETE
router.post("/mssql/delete", jwtAuth_1.jwtAuth, controller.runMssqlDelete.bind(controller));
// PostgreSQL
router.post("/pgsql", jwtAuth_1.jwtAuth, controller.runPgQuery.bind(controller));
// MySQL
router.post("/mysql", jwtAuth_1.jwtAuth, controller.runMysqlQuery.bind(controller));
exports.default = router;
