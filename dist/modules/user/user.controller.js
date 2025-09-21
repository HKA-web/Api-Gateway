"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    constructor() {
        this.service = new user_service_1.UserService();
    }
    async getUsers(req, res) {
        try {
            const users = await this.service.getAllUsers();
            res.json({ status: "success", data: users });
        }
        catch (err) {
            res.status(500).json({ status: "error", message: err.message });
        }
    }
    async getUser(req, res) {
        try {
            const user = await this.service.getUserById(req.params.id);
            if (!user)
                return res.status(404).json({ status: "error", message: "User not found" });
            res.json({ status: "success", data: user });
        }
        catch (err) {
            res.status(500).json({ status: "error", message: err.message });
        }
    }
}
exports.UserController = UserController;
