"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCircuitBreaker = createCircuitBreaker;
const opossum_1 = __importDefault(require("opossum"));
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
                lastError = err;
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
