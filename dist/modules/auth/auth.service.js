"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || "rahasia-super-aman";
// Dummy user (nanti bisa ganti ke DB)
const DUMMY_USER = {
    username: "admin",
    password: "password123",
};
class AuthService {
    async login(username, password) {
        if (username === DUMMY_USER.username && password === DUMMY_USER.password) {
            const token = jsonwebtoken_1.default.sign({ username }, SECRET, { expiresIn: "1h" });
            return { token };
        }
        throw new Error("Invalid credentials");
    }
}
exports.AuthService = AuthService;
