"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwtAuth_1 = require("../../middlewares/jwtAuth");
const querytool_controller_1 = require("./querytool.controller");
const router = (0, express_1.Router)();
const controller = new querytool_controller_1.QueryToolController();
// SQL Server generic query
router.post("/mssql", jwtAuth_1.jwtAuth, controller.runMssqlQuery.bind(controller));
// PostgreSQL
router.post("/pgsql", jwtAuth_1.jwtAuth, controller.runPgQuery.bind(controller));
// MySQL
router.post("/mysql", jwtAuth_1.jwtAuth, controller.runMysqlQuery.bind(controller));
exports.default = router;
