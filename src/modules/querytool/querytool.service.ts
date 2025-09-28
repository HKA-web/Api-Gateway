import axios from "axios";
import { config } from "../../utils/config";
import { getCacheKey, setCache, tryGetCache } from "../../utils/redisCache";
import { createCircuitBreaker } from "../../utils/circuitBreaker";

export class QueryToolService {

  private callBackendWithBreaker = createCircuitBreaker(
    async (url: string, payload: any) => {
      const res = await axios.post(url, payload);
      return res.data;
    },
    {
      timeout: config.circuitBreaker.timeout,
      retries: config.circuitBreaker.retries
    }
  );

  async runMssqlQuery(sql: string, skip = 0, take = 100, connectionName: string = "default") {
    const useRedis = true;
    const cacheKey = getCacheKey(sql, skip, take, `mssql:${connectionName}`);

    const cached = await tryGetCache(cacheKey, useRedis);
    if (cached) return { source: "redis", ...cached };

    const host = config.mssql[connectionName]?.host;
    if (!host) throw new Error(`MsSQL connection '${connectionName}' not found in config`);

    const response = await this.callBackendWithBreaker.fire(
      `${host}query`,
      { sql, skip, take }
    );

    const rows = response.rows;
    if (!rows) throw new Error("No rows returned from SQL Server");

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
