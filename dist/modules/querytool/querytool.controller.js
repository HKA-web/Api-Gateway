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
            const { sql, skip = 0, take = 100 } = req.body;
            if (!sql)
                return res.status(400).json({ message: "sql is required" });
            const result = await this.service.runMssqlQuery(sql, skip, take);
            res.json(result);
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
    async runPgQuery(req, res) {
        try {
            const { sql, skip = 0, take = 100 } = req.body;
            if (!sql)
                return res.status(400).json({ message: "sql is required" });
            const result = await this.service.runPgQuery(sql, skip, take);
            res.json(result);
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
    async runMysqlQuery(req, res) {
        try {
            const { sql, skip = 0, take = 100 } = req.body;
            if (!sql)
                return res.status(400).json({ message: "sql is required" });
            const result = await this.service.runMysqlQuery(sql, skip, take);
            res.json(result);
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}
exports.QueryToolController = QueryToolController;
