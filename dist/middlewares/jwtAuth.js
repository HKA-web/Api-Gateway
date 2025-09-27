"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtAuth = jwtAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || "rahasia-super-aman";
function jwtAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // format: Bearer xxx
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }
    jsonwebtoken_1.default.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token invalid" });
        }
        req.user = decoded;
        next();
    });
}
