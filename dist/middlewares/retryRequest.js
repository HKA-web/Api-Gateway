"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryRequest = retryRequest;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../utils/config");
/**
 🧩 Middleware Retry Request
 --------------------------------
 - Menambahkan retry otomatis untuk semua request axios
    yang dilakukan dalam scope satu request Express.
 - Konfigurasi diambil dari environment variable:
    max_retries (default: 3)
    retry_delay (default: 500 ms)
 - Menggunakan exponential backoff
 - Interceptor dibersihkan setelah response selesai
 --------------------------------
 Aktifkan di route cukup dengan: router.post("/api", jwtAuth, retryRequest, controller.method)
*/
function retryRequest(req, res, next) {
    const maxRetries = parseInt(config_1.config.max_retries || '2', 10);
    const baseDelay = parseInt(config_1.config.retry_delay || '500', 10);
    // Cegah interceptor dobel
    if (req._retryInterceptorAttached) {
        return next();
    }
    req._retryInterceptorAttached = true;
    // Tambahkan interceptor retry ke axios
    const interceptorId = axios_1.default.interceptors.response.use((response) => response, async (error) => {
        const config = error.config;
        if (!config || config.__retryCount >= maxRetries) {
            return Promise.reject(error);
        }
        config.__retryCount = (config.__retryCount || 0) + 1;
        const delay = baseDelay * Math.pow(2, config.__retryCount - 1);
        console.warn(`[INFO] Retry: ${config.__retryCount}/${maxRetries}. url: ${config.url} time: ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return (0, axios_1.default)(config);
    });
    // Hapus interceptor setelah response selesai
    res.on("finish", () => {
        axios_1.default.interceptors.response.eject(interceptorId);
    });
    next();
}
