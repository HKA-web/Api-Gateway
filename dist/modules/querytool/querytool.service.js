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
    async runMssqlQuery(sql, skip = 0, take = 100, connectionName = "default", filter) {
        // 🧱 Pastikan filter selalu object, walau tidak dikirim
        filter = filter ?? {};
        const useRedis = true;
        const buildCondition = (obj, op = "AND") => {
            if (!obj)
                return "";
            const normalConds = [];
            const orConds = [];
            const andConds = [];
            for (const [key, val] of Object.entries(obj)) {
                const lower = key.toLowerCase();
                if (lower === "or" || lower === "and") {
                    const nested = buildCondition(val, lower.toUpperCase());
                    if (nested) {
                        if (lower === "or")
                            orConds.push(`(${nested})`);
                        else
                            andConds.push(`(${nested})`);
                    }
                    continue;
                }
                if (val === null || val === undefined || val === "")
                    continue;
                // 🧩 BETWEEN
                if (Array.isArray(val) && val.length === 2) {
                    const [a, b] = val.map((v) => typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v);
                    normalConds.push(`[${key}] BETWEEN ${a} AND ${b}`);
                    continue;
                }
                // 🧩 IN
                if (Array.isArray(val) && val.length > 2) {
                    const arr = val
                        .map((v) => typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v)
                        .join(",");
                    normalConds.push(`[${key}] IN (${arr})`);
                    continue;
                }
                // 🧩 LIKE
                if (typeof val === "string" && val.includes("%")) {
                    normalConds.push(`[${key}] LIKE '${val.replace(/'/g, "''")}'`);
                    continue;
                }
                // 🧩 Default =
                normalConds.push(typeof val === "string"
                    ? `[${key}] = '${val.replace(/'/g, "''")}'`
                    : `[${key}] = ${val}`);
            }
            // 🧠 Gabungkan semua kondisi
            let parts = [];
            if (normalConds.length > 0)
                parts.push(normalConds.join(" AND "));
            if (andConds.length > 0)
                parts.push(andConds.join(" AND "));
            if (orConds.length > 0) {
                // kalau ada kondisi normal + OR → otomatis gabung pakai AND
                const orPart = orConds.join(" OR ");
                parts =
                    normalConds.length > 0 || andConds.length > 0
                        ? [...parts, `(${orPart})`]
                        : [`(${orPart})`];
            }
            return parts.join(` ${op} `);
        };
        const where = buildCondition(filter);
        const finalSql = sql + (where ? ` WHERE ${where}` : "");
        const cacheKey = (0, redisCache_1.getCacheKey)(finalSql, skip, take, `mssql:${connectionName}`);
        const cached = await (0, redisCache_1.tryGetCache)(cacheKey, useRedis);
        if (cached)
            return { source: "redis", ...cached };
        const host = config_1.config.mssql[connectionName]?.host;
        if (!host)
            throw new Error(`MsSQL connection '${connectionName}' not found in config`);
        const response = await this.callBackendWithBreaker.fire(`${host}query`, {
            sql: finalSql,
            skip,
            take,
            filter,
        });
        const result = {
            statusCode: response.statusCode ?? 200,
            message: "success",
            skip,
            take,
            totalCount: response.totalCount ?? response.rows?.length ?? 0,
            data: response.rows ?? [],
            columns: response.columns ?? [],
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
