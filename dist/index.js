"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const logger_1 = require("./middlewares/logger");
const config_1 = require("./utils/config");
const routeLoader_1 = require("./utils/routeLoader");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(logger_1.logger);
// Auto-load semua routes di /modules
(0, routeLoader_1.loadRoutes)(app);
// Root redirect
app.get("/", (req, res) => res.redirect("/docs"));
// Swagger
const swaggerFilePath = path_1.default.join(__dirname, "..", "openapi.json");
if (fs_1.default.existsSync(swaggerFilePath)) {
    const swaggerDocument = JSON.parse(fs_1.default.readFileSync(swaggerFilePath, "utf-8"));
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
}
else {
    console.warn("⚠️ openapi.json not found. Run `yarn ts-node generate-openapi.ts` first!");
}
app.listen(config_1.config.server.port, () => console.log(`🚀 Server running on http://localhost:${config_1.config.server.port}`));
