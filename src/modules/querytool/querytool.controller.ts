import { Request, Response } from "express";
import { QueryToolService } from "./querytool.service";

export class QueryToolController {
  private service = new QueryToolService();

  async runMssqlQuery(req: Request, res: Response) {
    try {
      const { sql, skip = 0, take = 100, connection = "default" } = req.body;
      if (!sql) return res.status(400).json({ message: "sql is required" });

      const result = await this.service.runMssqlQuery(sql, skip, take, connection);
      res.json(result);
    } catch (err: any) {
		const status = err?.statusCode ?? 500;
		const message = err?.message ?? "Unexpected error";
		res.status(status).json({ statusCode: status, message });
    }
  }

  async runMssqlInsert(req: Request, res: Response) {
    try {
      const { sql, connection = "default" } = req.body;
      if (!sql) return res.status(400).json({ message: "sql is required" });

      const result = await this.service.runMssqlInsert(sql, connection);
      res.json(result);
    } catch (err: any) {
		const status = err?.statusCode ?? 500;
		const message = err?.message ?? "Unexpected error";
		res.status(status).json({ statusCode: status, message });
    }
  }

  async runMssqlUpdate(req: Request, res: Response) {
    try {
      const { sql, connection = "default" } = req.body;
      if (!sql) return res.status(400).json({ message: "sql is required" });

      const result = await this.service.runMssqlUpdate(sql, connection);
      res.json(result);
    } catch (err: any) {
		const status = err?.statusCode ?? 500;
		const message = err?.message ?? "Unexpected error";
		res.status(status).json({ statusCode: status, message });
    }
  }

  async runMssqlDelete(req: Request, res: Response) {
    try {
      const { sql, connection = "default" } = req.body;
      if (!sql) return res.status(400).json({ message: "sql is required" });

      const result = await this.service.runMssqlDelete(sql, connection);
      res.json(result);
    } catch (err: any) {
		const status = err?.statusCode ?? 500;
		const message = err?.message ?? "Unexpected error";
		res.status(status).json({ statusCode: status, message });
    }
  }
  
}
