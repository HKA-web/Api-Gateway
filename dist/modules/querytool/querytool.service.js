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
            const res = await axios_1.default.post(url, payload, { validateStatus: () => true });
            // kalau error (status >= 400) → throw agar masuk ke breaker
            if (res.status >= 400) {
                throw {
                    statusCode: res.status,
                    message: res.data?.detail ?? res.data?.message ?? "Request failed",
                    data: res.data ?? null
                };
            }
            return { statusCode: res.status, ...res.data };
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
        const result = {
            statusCode: response.statusCode ?? 200,
            message: "success",
            skip,
            take,
            totalCount: response.totalCount ?? response.rows?.length ?? 0,
            data: response.rows ?? [],
            columns: response.columns ?? []
        };
        await (0, redisCache_1.setCache)(cacheKey, result, useRedis);
        return { source: "backend", ...result };
    }
    async runMssqlInsert(sql, connectionName = "default") {
        const host = config_1.config.mssql[connectionName]?.host;
        if (!host)
            throw new Error(`MsSQL connection '${connectionName}' not found in config`);
        const response = await this.callBackendWithBreaker.fire(`${host}insert`, {
            sql
        });
        return {
            statusCode: response.statusCode ?? 201,
            message: response.message ?? "insert success"
        };
    }
    async runMssqlUpdate(sql, connectionName = "default") {
        const host = config_1.config.mssql[connectionName]?.host;
        if (!host)
            throw new Error(`MsSQL connection '${connectionName}' not found in config`);
        const response = await this.callBackendWithBreaker.fire(`${host}update`, {
            sql
        });
        return {
            statusCode: response.statusCode ?? 200,
            message: response.message ?? "update success"
        };
    }
    async runMssqlDelete(sql, connectionName = "default") {
        const host = config_1.config.mssql[connectionName]?.host;
        if (!host)
            throw new Error(`MsSQL connection '${connectionName}' not found in config`);
        const response = await this.callBackendWithBreaker.fire(`${host}delete`, {
            sql
        });
        return {
            statusCode: response.statusCode ?? 200,
            message: response.message ?? "delete success"
        };
    }
}
exports.QueryToolService = QueryToolService;
