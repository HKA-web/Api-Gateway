"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../utils/config");
const ACCESS_SECRET = config_1.config.jwt_access || "rahasia-access";
const REFRESH_SECRET = config_1.config.jwt_refresh_secret || "rahasia-refresh";
// Dummy user
const DUMMY_USER = {
    username: "admin",
    password: "password123",
};
class AuthService {
    login(username, password) {
        if (username === DUMMY_USER.username && password === DUMMY_USER.password) {
            const accessToken = jsonwebtoken_1.default.sign({ username }, ACCESS_SECRET, { expiresIn: config_1.config.token_duration || "15m" });
            const refreshToken = jsonwebtoken_1.default.sign({ username }, REFRESH_SECRET, { expiresIn: config_1.config.refresh_duration || "7d" });
            return { accessToken, refreshToken };
        }
        throw new Error("Invalid credentials");
    }
    refresh(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
            const newAccessToken = jsonwebtoken_1.default.sign({ username: decoded.username }, ACCESS_SECRET, { expiresIn: "15m" });
            return { accessToken: newAccessToken };
        }
        catch (err) {
            throw new Error("Invalid or expired refresh token");
        }
    }
    verifyAccess(token) {
        try {
            return jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        }
        catch {
            throw new Error("Access token invalid or expired");
        }
    }
}
exports.AuthService = AuthService;
