"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const pgclient_1 = require("../../database/pgclient");
class UserService {
    async getAllUsers() {
        return await (0, pgclient_1.query)("SELECT id, name, email FROM users");
    }
    async getUserById(id) {
        const rows = await (0, pgclient_1.query)("SELECT id, name, email FROM users WHERE id = $1", [id]);
        return rows[0] || null;
    }
}
exports.UserService = UserService;
