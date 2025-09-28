"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryToolService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../utils/config");
const redisCache_1 = require("../../utils/redisCache");
const circuitBreaker_1 = require("../../utils/circuitBreaker");
class QueryToolService {
    constructor() {
        this.callBackendWithBreaker = (0, circuitBreaker_1.createCircuitBreaker)(async (url, payload) => {
            const res = await axios_1.default.post(url, payload);
            return res.data;
        }, {
            timeout: config_1.config.circuitBreaker.timeout,
            retries: config_1.config.circuitBreaker.retries
        });
    }
    async runMssqlQuery(sql, skip = 0, take = 100, connectionName = "default") {
        const useRedis = true;
        const cacheKey = (0, redisCache_1.getCacheKey)(sql, skip, take, `mssql:${connectionName}`);
        const cached = await (0, redisCache_1.tryGetCache)(cacheKey, useRedis);
        if (cached)
            return { source: "redis", ...cached };
        const host = config_1.config.mssql[connectionName]?.host;
        if (!host)
            throw new Error(`MsSQL connection '${connectionName}' not found in config`);
        const response = await this.callBackendWithBreaker.fire(`${host}query`, { sql, skip, take });
        const rows = response.rows;
        if (!rows)
            throw new Error("No rows returned from SQL Server");
        const result = {
            message: "success",
            skip,
            take,
            totalCount: response.totalCount ?? rows.length,
            data: rows
        };
        await (0, redisCache_1.setCache)(cacheKey, result, useRedis);
        return { source: "backend", ...result };
    }
    async runPgQuery(sql, skip = 0, take = 100, connectionName = "default") {
        const useRedis = true;
        const cacheKey = (0, redisCache_1.getCacheKey)(sql, skip, take, `pgsql:${connectionName}`);
        const cached = await (0, redisCache_1.tryGetCache)(cacheKey, useRedis);
        if (cached)
            return { source: "redis", ...cached };
        const host = config_1.config.pgsql[connectionName]?.host;
        if (!host)
            throw new Error(`PgSQL connection '${connectionName}' not found in config`);
        const response = await this.callBackendWithBreaker.fire(`${host}query`, { sql, skip, take });
        const rows = response.rows;
        if (!rows)
            throw new Error("No rows returned from PostgreSQL");
        const result = {
            message: "success",
            skip,
            take,
            totalCount: response.totalCount ?? rows.length,
            data: rows
        };
        await (0, redisCache_1.setCache)(cacheKey, result, useRedis);
        return { source: "backend", ...result };
    }
    async runMysqlQuery(sql, skip = 0, take = 100, connectionName = "default") {
        const useRedis = true;
        const cacheKey = (0, redisCache_1.getCacheKey)(sql, skip, take, `mysql:${connectionName}`);
        const cached = await (0, redisCache_1.tryGetCache)(cacheKey, useRedis);
        if (cached)
            return { source: "redis", ...cached };
        const host = config_1.config.mysql[connectionName]?.host;
        if (!host)
            throw new Error(`MySQL connection '${connectionName}' not found in config`);
        const response = await this.callBackendWithBreaker.fire(`${host}query`, { sql, skip, take });
        const rows = response.rows;
        if (!rows)
            throw new Error("No rows returned from MySQL");
        const result = {
            message: "success",
            skip,
            take,
            totalCount: response.totalCount ?? rows.length,
            data: rows
        };
        await (0, redisCache_1.setCache)(cacheKey, result, useRedis);
        return { source: "backend", ...result };
    }
}
exports.QueryToolService = QueryToolService;
