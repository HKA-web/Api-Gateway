"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryToolService = void 0;
const axios_1 = __importDefault(require("axios"));
const transform_1 = require("../../utils/transform");
const config_1 = __importDefault(require("../../utils/config"));
class QueryToolService {
    // SQL Server 2000 (relay ke Python microservice)
    async runMssqlQuery(sql, skip = 0, take = 100) {
        const response = await axios_1.default.post(`${config_1.default.mssql.default.host}query`, {
            sql, // pakai 'sql' sesuai microservice
            skip,
            take
        });
        const rows = response.data.rows;
        if (!rows)
            throw new Error("No rows returned from SQL Server");
        return {
            message: "success",
            skip,
            take,
            totalCount: response.data.totalCount ?? rows.length,
            data: rows,
        };
    }
    // PostgreSQL
    async runPgQuery(sql, skip = 0, take = 100) {
        const response = await axios_1.default.post(`${config_1.default.pgsql.default.host}query`, {
            sql, // pakai 'sql' sesuai microservice
            skip,
            take
        });
        const rows = response.data.rows;
        if (!rows)
            throw new Error("No rows returned from SQL Server");
        return {
            message: "success",
            skip,
            take,
            totalCount: response.data.totalCount ?? rows.length,
            data: (0, transform_1.trimStrings)(rows),
        };
    }
    // MySQL
    async runMysqlQuery(sql, skip = 0, take = 100) {
        const response = await axios_1.default.post(`${config_1.default.mysql.default.host}query`, {
            sql, // pakai 'sql' sesuai microservice
            skip,
            take
        });
        const rows = response.data.rows;
        if (!rows)
            throw new Error("No rows returned from SQL Server");
        return {
            message: "success",
            skip,
            take,
            totalCount: response.data.totalCount ?? rows.length,
            data: (0, transform_1.trimStrings)(rows),
        };
    }
}
exports.QueryToolService = QueryToolService;
