"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const querytool_controller_1 = require("./querytool.controller");
const router = (0, express_1.Router)();
const controller = new querytool_controller_1.QueryToolController();
// SQL Server generic query
router.post("/mssql", controller.runMssqlQuery.bind(controller));
// PostgreSQL
router.post("/pgsql", controller.runPgQuery.bind(controller));
// MySQL
router.post("/mysql", controller.runMysqlQuery.bind(controller));
exports.default = router;
