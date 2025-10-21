import axios, { Method } from "axios";
import { config } from "../../utils/config";
import { getCacheKey, setCache, tryGetCache } from "../../utils/redisCache";
import { createCircuitBreaker } from "../../utils/circuitBreaker";

export class QueryToolService {
  // ==========================
  // 🧠 Core dengan CircuitBreaker
  // ==========================
  private callBackendWithBreaker = createCircuitBreaker(
    async (url: string, payload: any, method: Method = "post") => {
      const res = await axios({
        url,
        method,
        data: payload,
        validateStatus: () => true,
      });

      const statusCode = res.data?.statuscode ?? res.status;
      const message =
        res.data?.message ??
        res.data?.detail ??
        (statusCode >= 400 ? "Request failed" : "success");

      if (statusCode >= 400) {
        throw {
          statusCode,
          message,
          data: res.data ?? null,
        };
      }

      return { statusCode, message, ...res.data };
    },
    {
      timeout: config.circuitBreaker.timeout,
      retries: config.circuitBreaker.retries,
    }
  );

  // ==========================
  // 🧩 READ
  // ==========================
  async runMssqlRead(
    sql: string,
    skip = 0,
    take = 100,
    connectionName: string = "default"
  ) {
    const useRedis = true;
    const cacheKey = getCacheKey(sql, skip, take, `mssql:${connectionName}`);

    const cached = await tryGetCache(cacheKey, useRedis);
    if (cached) return { source: "redis", ...cached };

    const conn = config.mssql[connectionName];
    if (!conn?.host)
      throw new Error(`MsSQL connection '${connectionName}' not found in config`);

    const url = `${conn.host}read/`;
    const payload = {
      sql,
      params: [],
      server: conn.server ?? "default",
      skip,
      take,
    };

    const response = await this.callBackendWithBreaker.fire(url, payload, "post");

    const result = {
      statusCode: response.statuscode ?? response.statusCode ?? 200,
      message: response.message ?? "success",
      skip,
      take,
      totalCount: response.totalcount ?? response.totalCount ?? 0,
      data: response.data ?? response.rows ?? [],
      columns: response.columns ?? [],
    };

    await setCache(cacheKey, result, useRedis);
    return { source: "backend", ...result };
  }

  // ==========================
  // 🧩 INSERT
  // ==========================
  async runMssqlInsert(sql: string, connectionName: string = "default") {
    const conn = config.mssql[connectionName];
    if (!conn?.host)
      throw new Error(`MsSQL connection '${connectionName}' not found in config`);

    const url = `${conn.host}insert/`;
    const payload = {
      sql,
      params: [],
      server: conn.server ?? "default",
    };

    const response = await this.callBackendWithBreaker.fire(url, payload, "post");

    return {
      statusCode: response.statuscode ?? response.statusCode ?? 201,
      message: response.message ?? "insert success",
    };
  }

  // ==========================
  // 🧩 UPDATE
  // ==========================
  async runMssqlUpdate(sql: string, connectionName: string = "default") {
    const conn = config.mssql[connectionName];
    if (!conn?.host)
      throw new Error(`MsSQL connection '${connectionName}' not found in config`);

    const url = `${conn.host}update/`;
    const payload = {
      sql,
      params: [],
      server: conn.server ?? "default",
    };

    const response = await this.callBackendWithBreaker.fire(url, payload, "put");

    return {
      statusCode: response.statuscode ?? response.statusCode ?? 200,
      message: response.message ?? "update success",
    };
  }

  // ==========================
  // 🧩 DELETE
  // ==========================
  async runMssqlDelete(sql: string, connectionName: string = "default") {
    const conn = config.mssql[connectionName];
    if (!conn?.host)
      throw new Error(`MsSQL connection '${connectionName}' not found in config`);

    const url = `${conn.host}delete/`;
    const payload = {
      sql,
      params: [],
      server: conn.server ?? "default",
    };

    const response = await this.callBackendWithBreaker.fire(url, payload, "delete");

    return {
      statusCode: response.statuscode ?? response.statusCode ?? 200,
      message: response.message ?? "delete success",
    };
  }
}
