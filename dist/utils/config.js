"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const zod_1 = require("zod");
const filePath = path_1.default.join(__dirname, "..", "..", "config.yaml");
const file = fs_1.default.readFileSync(filePath, "utf8");
const parsed = js_yaml_1.default.load(file);
// semua key string, semua value bebas
const ConfigSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.any());
const config = ConfigSchema.parse(parsed);
exports.default = config;
