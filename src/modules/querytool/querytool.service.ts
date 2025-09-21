import axios from "axios";
import { trimStrings } from "../../utils/transform";
import config from "../../utils/config";

export class QueryToolService {

  // SQL Server 2000 (relay ke Python microservice)
  async runMssqlQuery(sql: string, skip = 0, take = 100) {
	  const response = await axios.post(`${config.mssql.default.host}query`, {
		sql,   // pakai 'sql' sesuai microservice
		skip,
		take
	  });

	  const rows = response.data.rows;
	  if (!rows) throw new Error("No rows returned from SQL Server");

	  return {
		message: "success",
		skip,
		take,
		totalCount: response.data.totalCount ?? rows.length,
		data: rows,
	  };
	}

  // PostgreSQL
  async runPgQuery(sql: string, skip = 0, take = 100) {
	  const response = await axios.post(`${config.pgsql.default.host}query`, {
		sql,   // pakai 'sql' sesuai microservice
		skip,
		take
	  });

	  const rows = response.data.rows;
	  if (!rows) throw new Error("No rows returned from SQL Server");

	  return {
		message: "success",
		skip,
		take,
		totalCount: response.data.totalCount ?? rows.length,
		data: trimStrings(rows),
	  };
	}

  // MySQL
  async runMysqlQuery(sql: string, skip = 0, take = 100) {
	  const response = await axios.post(`${config.mysql.default.host}query`, {
		sql,   // pakai 'sql' sesuai microservice
		skip,
		take
	  });

	  const rows = response.data.rows;
	  if (!rows) throw new Error("No rows returned from SQL Server");

	  return {
		message: "success",
		skip,
		take,
		totalCount: response.data.totalCount ?? rows.length,
		data: trimStrings(rows),
	  };
	}
	
}
