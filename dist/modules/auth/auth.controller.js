"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    async login(req, res) {
        const { username, password } = req.body;
        try {
            const result = await this.authService.login(username, password);
            res.json(result);
        }
        catch (err) {
            res.status(401).json({ message: err.message });
        }
    }
}
exports.AuthController = AuthController;
