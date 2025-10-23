import axios, { Method } from "axios";
import { config } from "../../utils/config";
import { getCacheKey, setCache, tryGetCache } from "../../utils/redisCache";
import { createCircuitBreaker } from "../../utils/circuitBreaker";

export class QueryToolService {
  // ===================================================
  // 🧠 Core Circuit Breaker Wrapper
  // ===================================================
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
        throw { statusCode, message, data: res.data ?? null };
      }

      return { statusCode, message, ...res.data };
    },
    {
      timeout: config.circuitBreaker.timeout,
      retries: config.circuitBreaker.retries,
    }
  );

  // ===================================================
  // 🔧 Utility: Tentukan HTTP Method per Operasi
  // ===================================================
  private getHttpMethod(operation: string): Method {
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
  private async executeMssql(
    operation: "read" | "create" | "update" | "delete",
    sql: string,
    connectionName: string = "default",
    skip = 0,
    take = 100
  ) {
    const conn = config.mssql[connectionName];
    if (!conn?.host)
      throw new Error(`MsSQL connection '${connectionName}' not found in config`);

    const method = this.getHttpMethod(operation);
    const url = `${conn.host}${operation}/`;
    const payload: any = {
      sql,
      params: [],
      server: conn.server ?? "default",
    };

    if (operation === "read") {
      payload.skip = skip;
      payload.take = take;
    }

    const response = await this.callBackendWithBreaker.fire(url, payload, method);
    return response;
  }

  // ===================================================
  // 🧩 READ (dengan Redis Cache)
  // ===================================================
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

    await setCache(cacheKey, result, useRedis);
    return { source: "backend", ...result };
  }

  // ===================================================
  // 🧩 INSERT
  // ===================================================
  async runMssqlInsert(sql: string, connectionName: string = "default") {
    const response = await this.executeMssql("create", sql, connectionName);
    return {
      statusCode: response.statuscode ?? response.statusCode ?? 201,
      message: response.message ?? "create success",
    };
  }

  // ===================================================
  // 🧩 UPDATE
  // ===================================================
  async runMssqlUpdate(sql: string, connectionName: string = "default") {
    const response = await this.executeMssql("update", sql, connectionName);
    return {
      statusCode: response.statuscode ?? response.statusCode ?? 200,
      message: response.message ?? "update success",
    };
  }

  // ===================================================
  // 🧩 DELETE
  // ===================================================
  async runMssqlDelete(sql: string, connectionName: string = "default") {
    const response = await this.executeMssql("delete", sql, connectionName);
    return {
      statusCode: response.statuscode ?? response.statusCode ?? 200,
      message: response.message ?? "delete success",
    };
  }
}
