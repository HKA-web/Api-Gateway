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

  async runMssqlQuery(sql: string, skip = 0, take = 100) {
    const useRedis = true;
    const cacheKey = getCacheKey(sql, skip, take, "mssql");

    const cached = await tryGetCache(cacheKey, useRedis);
    if (cached) return { source: "redis", ...cached };

    const response = await this.callBackendWithBreaker.fire(
      `${config.mssql.default.host}query`,
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

  async runPgQuery(sql: string, skip = 0, take = 100) {
    const useRedis = true;
    const cacheKey = getCacheKey(sql, skip, take, "pgsql");

    const cached = await tryGetCache(cacheKey, useRedis);
    if (cached) return { source: "redis", ...cached };

    const response = await this.callBackendWithBreaker.fire(
      `${config.pgsql.default.host}query`,
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

  async runMysqlQuery(sql: string, skip = 0, take = 100) {
    const response = await this.callBackendWithBreaker.fire(
      `${config.mysql.default.host}query`,
      { sql, skip, take }
    );

    const rows = response.rows;
    if (!rows) throw new Error("No rows returned from MySQL");

    return {
      message: "success",
      skip,
      take,
      totalCount: response.totalCount ?? rows.length,
      data: rows,
      source: "backend"
    };
  }
}
