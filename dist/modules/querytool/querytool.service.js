"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryToolService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../utils/config");
const redisCache_1 = require("../../utils/redisCache");
class QueryToolService {
    // SQL Server → pakai Redis
    async runMssqlQuery(sql, skip = 0, take = 100) {
        const useRedis = true;
        const cacheKey = (0, redisCache_1.getCacheKey)(sql, skip, take, "mssql");
        const cached = await (0, redisCache_1.tryGetCache)(cacheKey, useRedis);
        if (cached)
            return { source: "redis", ...cached };
        const response = await axios_1.default.post(`${config_1.config.mssql.default.host}query`, { sql, skip, take });
        const rows = response.data.rows;
        if (!rows)
            throw new Error("No rows returned from SQL Server");
        const result = {
            message: "success",
            skip,
            take,
            totalCount: response.data.totalCount ?? rows.length,
            data: rows
        };
        await (0, redisCache_1.setCache)(cacheKey, result, useRedis);
        return { source: "backend", ...result };
    }
    // PostgreSQL → pakai Redis
    async runPgQuery(sql, skip = 0, take = 100) {
        const useRedis = true;
        const cacheKey = (0, redisCache_1.getCacheKey)(sql, skip, take, "pgsql");
        const cached = await (0, redisCache_1.tryGetCache)(cacheKey, useRedis);
        if (cached)
            return { source: "redis", ...cached };
        const response = await axios_1.default.post(`${config_1.config.pgsql.default.host}query`, { sql, skip, take });
        const rows = response.data.rows;
        if (!rows)
            throw new Error("No rows returned from PostgreSQL");
        const result = {
            message: "success",
            skip,
            take,
            totalCount: response.data.totalCount ?? rows.length,
            data: rows
        };
        await (0, redisCache_1.setCache)(cacheKey, result, useRedis);
        return { source: "backend", ...result };
    }
    // MySQL → skip Redis
    async runMysqlQuery(sql, skip = 0, take = 100) {
        const response = await axios_1.default.post(`${config_1.config.mysql.default.host}query`, { sql, skip, take });
        const rows = response.data.rows;
        if (!rows)
            throw new Error("No rows returned from MySQL");
        return {
            message: "success",
            skip,
            take,
            totalCount: response.data.totalCount ?? rows.length,
            data: rows,
            source: "backend"
        };
    }
}
exports.QueryToolService = QueryToolService;
