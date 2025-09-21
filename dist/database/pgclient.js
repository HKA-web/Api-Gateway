"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
const pg_1 = require("pg");
const config_1 = __importDefault(require("../utils/config"));
// Pool PostgreSQL dari config YAML
exports.pool = new pg_1.Pool({
    host: config_1.default.postgres.host,
    port: config_1.default.postgres.port,
    user: config_1.default.postgres.user,
    password: config_1.default.postgres.password,
    database: config_1.default.postgres.database,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
async function query(text, params) {
    const res = await exports.pool.query(text, params);
    return res.rows; // hanya rows array
}
