import { Request, Response } from "express";
import { QueryToolService } from "./querytool.service";

export class QueryToolController {
  private service = new QueryToolService();
	
  async runMssqlQuery(req: Request, res: Response) {
    try {
      const { sql, skip = 0, take = 100 } = req.body;
      if (!sql) return res.status(400).json({ message: "sql is required" });

      const result = await this.service.runMssqlQuery(sql, skip, take);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
  
  async runPgQuery(req: Request, res: Response) {
    try {
      const { sql, skip = 0, take = 100 } = req.body;
      if (!sql) return res.status(400).json({ message: "sql is required" });

      const result = await this.service.runPgQuery(sql, skip, take);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  async runMysqlQuery(req: Request, res: Response) {
    try {
      const { sql, skip = 0, take = 100 } = req.body;
      if (!sql) return res.status(400).json({ message: "sql is required" });

      const result = await this.service.runMysqlQuery(sql, skip, take);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
  
}
