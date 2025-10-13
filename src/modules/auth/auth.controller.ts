import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      const result = await this.authService.login(username, password);
      res.json({
        message: "OK",
        data: result, // hasil dari service: { accessToken, refreshToken }
      });
    } catch (err: any) {
      res.status(401).json({
        message: err.message || "Login failed",
        data: null,
      });
    }
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    try {
      const result = this.authService.refresh(refreshToken);
      res.json({
        message: "OK",
        data: result, // hasil: { accessToken }
      });
    } catch (err: any) {
      res.status(401).json({
        message: err.message || "Token refresh failed",
        data: null,
      });
    }
  }
}
