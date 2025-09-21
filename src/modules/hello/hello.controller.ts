import { Request, Response } from "express";
import { HelloService } from "./hello.service";

export class HelloController {
  private service = new HelloService();

  sayHello(req: Request, res: Response) {
    const name = req.query.name as string || "World";
    res.json(this.service.greet(name));
  }
}
