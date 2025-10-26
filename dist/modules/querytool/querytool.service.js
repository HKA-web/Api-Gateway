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
    // ===================================================
    // 🔧 Utility: Tentukan HTTP Method per Operasi
    // ===================================================
    getHttpMethod(operation) {
        switch (operation.toLowerCase()) {
            case "update":
                return "put";
            case "delete":
                return "delete";
            case "read":
            case "create":
            default:
                return "post";
        }
    }
    // ===================================================
    // 🔧 Utility: Jalankan query generic berdasarkan operasi
    // ===================================================
    async executeMssql(operation, sql, connectionName = "default", skip = 0, take = 100) {
        const conn = config_1.config.mssql[connectionName];
        if (!conn?.host)
            throw new Error(`MsSQL connection '${connectionName}' not found in config`);
        const method = this.getHttpMethod(operation);
        const url = `${conn.host}${operation}/`;
        const payload = {
            sql,
            params: [],
            server: conn.server ?? "default",
        };
        if (operation === "read") {
            payload.skip = skip;
            payload.take = take;
        }
        // 👇 Tidak pakai breaker.fire(), middleware breaker di route yang handle
        const res = await (0, axios_1.default)({
            url,
            method,
            data: payload,
            validateStatus: () => true,
        });
        const statusCode = res.data?.statuscode ?? res.status;
        const message = res.data?.message ??
            res.data?.detail ??
            (statusCode >= 400 ? "Request failed" : "success");
        if (statusCode >= 400) {
            throw { statusCode, message, data: res.data ?? null };
        }
        return { statusCode, message, ...res.data };
    }
    // ===================================================
    // 🧩 READ (dengan Redis Cache)
    // ===================================================
    async runMssqlRead(sql, skip = 0, take = 100, connectionName = "default") {
        const useRedis = true;
        const cacheKey = (0, redisCache_1.getCacheKey)(sql, skip, take, `mssql:${connectionName}`);
        const cached = await (0, redisCache_1.tryGetCache)(cacheKey, useRedis);
        if (cached)
            return { source: "redis", ...cached };
        const response = await this.executeMssql("read", sql, connectionName, skip, take);
        const result = {
            statusCode: response.statuscode ?? response.statusCode ?? 200,
            message: response.message ?? "success",
            skip,
            take,
            totalCount: response.totalcount ?? response.totalCount ?? 0,
            data: response.data ?? response.rows ?? [],
            columns: response.columns ?? [],
        };
        await (0, redisCache_1.setCache)(cacheKey, result, useRedis);
        return { source: "backend", ...result };
    }
    // ===================================================
    // 🧩 INSERT
    // ===================================================
    async runMssqlInsert(sql, connectionName = "default") {
        const response = await this.executeMssql("create", sql, connectionName);
        return {
            statusCode: response.statuscode ?? response.statusCode ?? 201,
            message: response.message ?? "create success",
        };
    }
    // ===================================================
    // 🧩 UPDATE
    // ===================================================
    async runMssqlUpdate(sql, connectionName = "default") {
        const response = await this.executeMssql("update", sql, connectionName);
        return {
            statusCode: response.statuscode ?? response.statusCode ?? 200,
            message: response.message ?? "update success",
        };
    }
    // ===================================================
    // 🧩 DELETE
    // ===================================================
    async runMssqlDelete(sql, connectionName = "default") {
        const response = await this.executeMssql("delete", sql, connectionName);
        return {
            statusCode: response.statuscode ?? response.statusCode ?? 200,
            message: response.message ?? "delete success",
        };
    }
}
exports.QueryToolService = QueryToolService;
