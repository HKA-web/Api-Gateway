"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const output = {
    openapi: "3.0.0",
    info: { title: "API Gateway", version: "1.0.0" },
    paths: {}
};
const modulesPath = path_1.default.join(__dirname, "modules");
// scan folder modules
fs_1.default.readdirSync(modulesPath).forEach((mod) => {
    const filePath = path_1.default.join(modulesPath, mod, `${mod}.openapi.json`);
    if (fs_1.default.existsSync(filePath)) {
        const content = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
        Object.assign(output.paths, content.paths);
        console.log(`✅ Loaded OpenAPI for module: ${mod}`);
    }
    else {
        console.warn(`⚠️  No OpenAPI file found for module: ${mod}`);
    }
});
// output ke root project (di luar src)
const outputPath = path_1.default.join(__dirname, "..", "openapi.json");
fs_1.default.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`📄 openapi.json generated at ${outputPath}`);
