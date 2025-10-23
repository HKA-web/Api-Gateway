import { Request, Response } from "express";
import { QueryToolService } from "./querytool.service";

export class QueryToolController {
  private service = new QueryToolService();

  async runMssqlRead(req: Request, res: Response) {
    try {
      const { sql, skip = 0, take = 100, connection = "default" } = req.body;
      if (!sql)
        return res.status(400).json({ statusCode: 400, message: "sql is required" });

      const result = await this.service.runMssqlRead(sql, skip, take, connection);

      res.status(result.statusCode ?? 200).json({
        statusCode: result.statusCode ?? 200,
        message: result.message,
        totalCount: result.totalCount,
        data: result.data,
        skip: result.skip,
        take: result.take,
        columns: result.columns,
        source: result.source
      });
    } catch (err: any) {
      const status = err?.statusCode ?? err?.statusCode ?? 500;
      const message = err?.message ?? "Unexpected error";
      res.status(status).json({ statusCode: status, message });
    }
  }

  async runMssqlInsert(req: Request, res: Response) {
    try {
      const { sql, connection = "default" } = req.body;
      if (!sql)
        return res.status(400).json({ statusCode: 400, message: "sql is required" });

      const result = await this.service.runMssqlInsert(sql, connection);
      res.status(result.statusCode ?? 201).json(result);
    } catch (err: any) {
      const status = err?.statusCode ?? err?.statusCode ?? 500;
      const message = err?.message ?? "Unexpected error";
      res.status(status).json({ statusCode: status, message });
    }
  }

  async runMssqlUpdate(req: Request, res: Response) {
    try {
      const { sql, connection = "default" } = req.body;
      if (!sql)
        return res.status(400).json({ statusCode: 400, message: "sql is required" });

      const result = await this.service.runMssqlUpdate(sql, connection);
      res.status(result.statusCode ?? 200).json(result);
    } catch (err: any) {
      const status = err?.statusCode ?? err?.statusCode ?? 500;
      const message = err?.message ?? "Unexpected error";
      res.status(status).json({ statusCode: status, message });
    }
  }

  async runMssqlDelete(req: Request, res: Response) {
    try {
      const { sql, connection = "default" } = req.body;
      if (!sql)
        return res.status(400).json({ statusCode: 400, message: "sql is required" });

      const result = await this.service.runMssqlDelete(sql, connection);
      res.status(result.statusCode ?? 200).json(result);
    } catch (err: any) {
      const status = err?.statusCode ?? err?.statusCode ?? 500;
      const message = err?.message ?? "Unexpected error";
      res.status(status).json({ statusCode: status, message });
    }
  }
}
