"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCircuitBreaker = createCircuitBreaker;
const opossum_1 = __importDefault(require("opossum"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
function createCircuitBreaker(fn, options) {
    const cbOptions = config_1.config.circuitBreaker || {};
    const breaker = new opossum_1.default(async (...args) => {
        const retries = options?.retries ?? cbOptions.retries ?? 2;
        let lastError;
        for (let i = 0; i <= retries; i++) {
            try {
                return await fn(...args);
            }
            catch (err) {
                lastError = normalizeError(err);
                if (i < retries)
                    console.warn(`Retrying request, attempt ${i + 1}...`);
            }
        }
        throw lastError;
    }, {
        timeout: options?.timeout ?? cbOptions.timeout ?? 5000,
        errorThresholdPercentage: options?.errorThresholdPercentage ?? cbOptions.errorThresholdPercentage ?? 50,
        resetTimeout: options?.resetTimeout ?? cbOptions.resetTimeout ?? 30000,
    });
    breaker.on("open", () => console.warn("Circuit breaker opened!"));
    breaker.on("halfOpen", () => console.info("Circuit breaker half-open..."));
    breaker.on("close", () => console.info("Circuit breaker closed."));
    breaker.on("timeout", () => console.warn("Request timed out."));
    breaker.on("reject", () => console.warn("Breaker rejected request."));
    return breaker;
}
/**
 * Normalisasi error axios supaya konsisten ada `statusCode` + `message`
 */
function normalizeError(err) {
    if (axios_1.default.isAxiosError(err)) {
        const axiosErr = err;
        const status = axiosErr.response?.status ?? 500;
        // ambil pesan error dari backend FastAPI (detail/message)
        let message = axiosErr.response?.data?.detail ??
            axiosErr.response?.data?.message ??
            axiosErr.message;
        // kalau pesan masih dalam bentuk tuple pyodbc (contoh: "('42000', '...')")
        if (typeof message === "string" && message.startsWith("('")) {
            try {
                // ambil bagian isi saja setelah error code
                const parsed = message.split("] ");
                message = parsed[parsed.length - 1].replace(/[()"]/g, "").trim();
            }
            catch {
                // fallback tetap message asli
            }
        }
        return {
            statusCode: status,
            message,
            data: axiosErr.response?.data ?? null,
        };
    }
    return {
        statusCode: 500,
        message: err?.message || "Unknown error",
    };
}
