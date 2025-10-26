import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { config } from "../utils/config";

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
export function retryRequest(req: Request, res: Response, next: NextFunction) {
  const maxRetries = parseInt(config.max_retries || '2', 10);
  const baseDelay = parseInt(config.retry_delay || '500', 10);

  // Cegah interceptor dobel
  if ((req as any)._retryInterceptorAttached) {
    return next();
  }
  (req as any)._retryInterceptorAttached = true;

  // Tambahkan interceptor retry ke axios
  const interceptorId = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;

      if (!config || config.__retryCount >= maxRetries) {
        return Promise.reject(error);
      }

      config.__retryCount = (config.__retryCount || 0) + 1;
      const delay = baseDelay * Math.pow(2, config.__retryCount - 1);

      console.warn(
        `[INFO] Retry: ${config.__retryCount}/${maxRetries}. url: ${config.url} time: ${delay}ms`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return axios(config);
    }
  );

  // Hapus interceptor setelah response selesai
  res.on("finish", () => {
    axios.interceptors.response.eject(interceptorId);
  });

  next();
}
