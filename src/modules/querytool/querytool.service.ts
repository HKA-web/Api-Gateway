import axios from "axios";
import { config } from "../../utils/config";
import { getCacheKey, setCache, tryGetCache } from "../../utils/redisCache";

export class QueryToolService {

  // SQL Server → pakai Redis
  async runMssqlQuery(sql: string, skip = 0, take = 100) {
    const useRedis = true;
    const cacheKey = getCacheKey(sql, skip, take, "mssql");

    const cached = await tryGetCache(cacheKey, useRedis);
    if (cached) return { source: "redis", ...cached };

    const response = await axios.post(`${config.mssql.default.host}query`, { sql, skip, take });
    const rows = response.data.rows;
    if (!rows) throw new Error("No rows returned from SQL Server");

    const result = {
      message: "success",
      skip,
      take,
      totalCount: response.data.totalCount ?? rows.length,
      data: rows
    };

    await setCache(cacheKey, result, useRedis);
    return { source: "backend", ...result };
  }

  // PostgreSQL → pakai Redis
  async runPgQuery(sql: string, skip = 0, take = 100) {
    const useRedis = true;
    const cacheKey = getCacheKey(sql, skip, take, "pgsql");

    const cached = await tryGetCache(cacheKey, useRedis);
    if (cached) return { source: "redis", ...cached };

    const response = await axios.post(`${config.pgsql.default.host}query`, { sql, skip, take });
    const rows = response.data.rows;
    if (!rows) throw new Error("No rows returned from PostgreSQL");

    const result = {
      message: "success",
      skip,
      take,
      totalCount: response.data.totalCount ?? rows.length,
      data: rows
    };

    await setCache(cacheKey, result, useRedis);
    return { source: "backend", ...result };
  }

  // MySQL → skip Redis
  async runMysqlQuery(sql: string, skip = 0, take = 100) {
    const response = await axios.post(`${config.mysql.default.host}query`, { sql, skip, take });
    const rows = response.data.rows;
    if (!rows) throw new Error("No rows returned from MySQL");

    return {
      message: "success",
      skip,
      take,
      totalCount: response.data.totalCount ?? rows.length,
      data: rows,
      source: "backend"
    };
  }
}
