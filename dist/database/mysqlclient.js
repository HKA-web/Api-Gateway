"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mysqlPool = void 0;
exports.mysqlQuery = mysqlQuery;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = __importDefault(require("../utils/config"));
exports.mysqlPool = promise_1.default.createPool({
    host: config_1.default.mysql.host,
    port: config_1.default.mysql.port,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.password,
    database: config_1.default.mysql.database,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
});
async function mysqlQuery(sql) {
    const [rows] = await exports.mysqlPool.query(sql);
    return rows;
}
