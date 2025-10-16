"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryToolController = void 0;
const querytool_service_1 = require("./querytool.service");
class QueryToolController {
    constructor() {
        this.service = new querytool_service_1.QueryToolService();
    }
    async runMssqlQuery(req, res) {
        try {
            const { sql, skip = 0, take = 100, connection = "default" } = req.body;
            if (!sql)
                return res.status(400).json({ message: "sql is required" });
            const result = await this.service.runMssqlQuery(sql, skip, take, connection);
            res.json(result);
        }
        catch (err) {
            const status = err?.statusCode ?? 500;
            const message = err?.message ?? "Unexpected error";
            res.status(status).json({ statusCode: status, message });
        }
    }
    async runMssqlInsert(req, res) {
        try {
            const { sql, connection = "default" } = req.body;
            if (!sql)
                return res.status(400).json({ message: "sql is required" });
            const result = await this.service.runMssqlInsert(sql, connection);
            res.json(result);
        }
        catch (err) {
            const status = err?.statusCode ?? 500;
            const message = err?.message ?? "Unexpected error";
            res.status(status).json({ statusCode: status, message });
        }
    }
    async runMssqlUpdate(req, res) {
        try {
            const { sql, connection = "default" } = req.body;
            if (!sql)
                return res.status(400).json({ message: "sql is required" });
            const result = await this.service.runMssqlUpdate(sql, connection);
            res.json(result);
        }
        catch (err) {
            const status = err?.statusCode ?? 500;
            const message = err?.message ?? "Unexpected error";
            res.status(status).json({ statusCode: status, message });
        }
    }
    async runMssqlDelete(req, res) {
        try {
            const { sql, connection = "default" } = req.body;
            if (!sql)
                return res.status(400).json({ message: "sql is required" });
            const result = await this.service.runMssqlDelete(sql, connection);
            res.json(result);
        }
        catch (err) {
            const status = err?.statusCode ?? 500;
            const message = err?.message ?? "Unexpected error";
            res.status(status).json({ statusCode: status, message });
        }
    }
}
exports.QueryToolController = QueryToolController;
