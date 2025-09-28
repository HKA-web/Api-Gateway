import CircuitBreaker from "opossum";
import { config } from "./config";

interface BreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  retries?: number;
}

export function createCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: BreakerOptions
) {
  const cbOptions = config.circuitBreaker || {};
  const breaker = new CircuitBreaker(
    async (...args: Parameters<T>) => {
      const retries = options?.retries ?? cbOptions.retries ?? 2;
      let lastError: any;
      for (let i = 0; i <= retries; i++) {
        try {
          return await fn(...args);
        } catch (err) {
          lastError = err;
          if (i < retries) console.warn(`Retrying request, attempt ${i + 1}...`);
        }
      }
      throw lastError;
    },
    {
      timeout: options?.timeout ?? cbOptions.timeout ?? 5000,
      errorThresholdPercentage:
        options?.errorThresholdPercentage ?? cbOptions.errorThresholdPercentage ?? 50,
      resetTimeout: options?.resetTimeout ?? cbOptions.resetTimeout ?? 30000,
    }
  );

  breaker.on("open", () => console.warn("Circuit breaker opened!"));
  breaker.on("halfOpen", () => console.info("Circuit breaker half-open..."));
  breaker.on("close", () => console.info("Circuit breaker closed."));
  breaker.on("timeout", () => console.warn("Request timed out."));
  breaker.on("reject", () => console.warn("Breaker rejected request."));

  return breaker;
}
