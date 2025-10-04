import axios from "axios";
import { config } from "../../utils/config";
import { getCacheKey, setCache, tryGetCache } from "../../utils/redisCache";
import { createCircuitBreaker } from "../../utils/circuitBreaker";

export class QueryToolService {
  private callBackendWithBreaker = createCircuitBreaker(
  async (url: string, payload: any) => {
    const res = await axios.post(url, payload, { validateStatus: () => true });

    // kalau error (status >= 400) → throw agar masuk ke breaker
    if (res.status >= 400) {
      throw {
        statusCode: res.status,
        message: res.data?.detail ?? res.data?.message ?? "Request failed",
        data: res.data ?? null
      };
    }

    return { statusCode: res.status, ...res.data };
  },
  {
    timeout: config.circuitBreaker.timeout,
    retries: config.circuitBreaker.retries
  }
);

  async runMssqlQuery(
    sql: string,
    skip = 0,
    take = 100,
    connectionName: string = "default"
  ) {
    const useRedis = true;
    const cacheKey = getCacheKey(sql, skip, take, `mssql:${connectionName}`);

    const cached = await tryGetCache(cacheKey, useRedis);
    if (cached) return { source: "redis", ...cached };

    const host = config.mssql[connectionName]?.host;
    if (!host)
      throw new Error(`MsSQL connection '${connectionName}' not found in config`);

    const response = await this.callBackendWithBreaker.fire(
      `${host}query`,
      { sql, skip, take }
    );

    const result = {
      statusCode: response.statusCode ?? 200,
      message: "success",
      skip,
      take,
      totalCount: response.totalCount ?? response.rows?.length ?? 0,
      data: response.rows ?? [],
      columns: response.columns ?? []
    };

    await setCache(cacheKey, result, useRedis);
    return { source: "backend", ...result };
  }

  async runMssqlInsert(sql: string, connectionName: string = "default") {
    const host = config.mssql[connectionName]?.host;
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

  async runMssqlUpdate(sql: string, connectionName: string = "default") {
    const host = config.mssql[connectionName]?.host;
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

  async runMssqlDelete(sql: string, connectionName: string = "default") {
    const host = config.mssql[connectionName]?.host;
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

  async runPgQuery(sql: string, skip = 0, take = 100, connectionName: string = "default") {
    const useRedis = true;
    const cacheKey = getCacheKey(sql, skip, take, `pgsql:${connectionName}`);

    const cached = await tryGetCache(cacheKey, useRedis);
    if (cached) return { source: "redis", ...cached };

    const host = config.pgsql[connectionName]?.host;
    if (!host) throw new Error(`PgSQL connection '${connectionName}' not found in config`);

    const response = await this.callBackendWithBreaker.fire(
      `${host}query`,
      { sql, skip, take }
    );

    const rows = response.rows;
    if (!rows) throw new Error("No rows returned from PostgreSQL");

    const result = {
      message: "success",
      skip,
      take,
      totalCount: response.totalCount ?? rows.length,
      data: rows
    };

    await setCache(cacheKey, result, useRedis);
    return { source: "backend", ...result };
  }

  async runMysqlQuery(sql: string, skip = 0, take = 100, connectionName: string = "default") {
    const useRedis = true;
    const cacheKey = getCacheKey(sql, skip, take, `mysql:${connectionName}`);

    const cached = await tryGetCache(cacheKey, useRedis);
    if (cached) return { source: "redis", ...cached };

    const host = config.mysql[connectionName]?.host;
    if (!host) throw new Error(`MySQL connection '${connectionName}' not found in config`);

    const response = await this.callBackendWithBreaker.fire(
      `${host}query`,
      { sql, skip, take }
    );

    const rows = response.rows;
    if (!rows) throw new Error("No rows returned from MySQL");

    const result = {
      message: "success",
      skip,
      take,
      totalCount: response.totalCount ?? rows.length,
      data: rows
    };

    await setCache(cacheKey, result, useRedis);
    return { source: "backend", ...result };
  }
}
