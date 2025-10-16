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
	  connectionName = "default",
	  filter?: Record<string, any>
	) {
	  // 🧱 Pastikan filter selalu object, walau tidak dikirim
	  filter = filter ?? {};

	  const useRedis = true;

	  const buildCondition = (obj: Record<string, any>, op = "AND"): string => {
		if (!obj) return "";

		const normalConds: string[] = [];
		const orConds: string[] = [];
		const andConds: string[] = [];

		for (const [key, val] of Object.entries(obj)) {
		  const lower = key.toLowerCase();
		  if (lower === "or" || lower === "and") {
			const nested = buildCondition(val, lower.toUpperCase());
			if (nested) {
			  if (lower === "or") orConds.push(`(${nested})`);
			  else andConds.push(`(${nested})`);
			}
			continue;
		  }

		  if (val === null || val === undefined || val === "") continue;

		  // 🧩 BETWEEN
		  if (Array.isArray(val) && val.length === 2) {
			const [a, b] = val.map((v) =>
			  typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v
			);
			normalConds.push(`[${key}] BETWEEN ${a} AND ${b}`);
			continue;
		  }

		  // 🧩 IN
		  if (Array.isArray(val) && val.length > 2) {
			const arr = val
			  .map((v) =>
				typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v
			  )
			  .join(",");
			normalConds.push(`[${key}] IN (${arr})`);
			continue;
		  }

		  // 🧩 LIKE
		  if (typeof val === "string" && val.includes("%")) {
			normalConds.push(`[${key}] LIKE '${val.replace(/'/g, "''")}'`);
			continue;
		  }

		  // 🧩 Default =
		  normalConds.push(
			typeof val === "string"
			  ? `[${key}] = '${val.replace(/'/g, "''")}'`
			  : `[${key}] = ${val}`
		  );
		}

		// 🧠 Gabungkan semua kondisi
		let parts: string[] = [];

		if (normalConds.length > 0) parts.push(normalConds.join(" AND "));
		if (andConds.length > 0) parts.push(andConds.join(" AND "));
		if (orConds.length > 0) {
		  // kalau ada kondisi normal + OR → otomatis gabung pakai AND
		  const orPart = orConds.join(" OR ");
		  parts =
			normalConds.length > 0 || andConds.length > 0
			  ? [...parts, `(${orPart})`]
			  : [`(${orPart})`];
		}

		return parts.join(` ${op} `);
	  };

	  const where = buildCondition(filter);
	  const finalSql = sql + (where ? ` WHERE ${where}` : "");

	  const cacheKey = getCacheKey(finalSql, skip, take, `mssql:${connectionName}`);
	  const cached = await tryGetCache(cacheKey, useRedis);
	  if (cached) return { source: "redis", ...cached };

	  const host = config.mssql[connectionName]?.host;
	  if (!host)
		throw new Error(`MsSQL connection '${connectionName}' not found in config`);

	  const response = await this.callBackendWithBreaker.fire(`${host}query`, {
		sql: finalSql,
		skip,
		take,
		filter,
	  });

	  const result = {
		statusCode: response.statusCode ?? 200,
		message: "success",
		skip,
		take,
		totalCount: response.totalCount ?? response.rows?.length ?? 0,
		data: response.rows ?? [],
		columns: response.columns ?? [],
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
