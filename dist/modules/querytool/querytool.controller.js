"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryToolController = void 0;
const querytool_service_1 = require("./querytool.service");
class QueryToolController {
    constructor() {
        this.service = new querytool_service_1.QueryToolService();
    }
    async runMssqlRead(req, res) {
        try {
            const { sql, skip = 0, take = 100, connection = "default" } = req.body;
            if (!sql)
                return res.status(400).json({ statuscode: 400, message: "sql is required" });
            const result = await this.service.runMssqlRead(sql, skip, take, connection);
            res.status(result.statusCode ?? 200).json({
                statuscode: result.statusCode ?? 200,
                message: result.message,
                totalcount: result.totalCount,
                data: result.data,
                skip: result.skip,
                take: result.take,
                columns: result.columns,
                source: result.source
            });
        }
        catch (err) {
            const status = err?.statusCode ?? err?.statuscode ?? 500;
            const message = err?.message ?? "Unexpected error";
            res.status(status).json({ statuscode: status, message });
        }
    }
    async runMssqlInsert(req, res) {
        try {
            const { sql, connection = "default" } = req.body;
            if (!sql)
                return res.status(400).json({ statuscode: 400, message: "sql is required" });
            const result = await this.service.runMssqlInsert(sql, connection);
            res.status(result.statusCode ?? 201).json(result);
        }
        catch (err) {
            const status = err?.statusCode ?? err?.statuscode ?? 500;
            const message = err?.message ?? "Unexpected error";
            res.status(status).json({ statuscode: status, message });
        }
    }
    async runMssqlUpdate(req, res) {
        try {
            const { sql, connection = "default" } = req.body;
            if (!sql)
                return res.status(400).json({ statuscode: 400, message: "sql is required" });
            const result = await this.service.runMssqlUpdate(sql, connection);
            res.status(result.statusCode ?? 200).json(result);
        }
        catch (err) {
            const status = err?.statusCode ?? err?.statuscode ?? 500;
            const message = err?.message ?? "Unexpected error";
            res.status(status).json({ statuscode: status, message });
        }
    }
    async runMssqlDelete(req, res) {
        try {
            const { sql, connection = "default" } = req.body;
            if (!sql)
                return res.status(400).json({ statuscode: 400, message: "sql is required" });
            const result = await this.service.runMssqlDelete(sql, connection);
            res.status(result.statusCode ?? 200).json(result);
        }
        catch (err) {
            const status = err?.statusCode ?? err?.statuscode ?? 500;
            const message = err?.message ?? "Unexpected error";
            res.status(status).json({ statuscode: status, message });
        }
    }
}
exports.QueryToolController = QueryToolController;
