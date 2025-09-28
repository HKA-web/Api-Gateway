"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRoutes = loadRoutes;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadRoutes(app) {
    const modulesPath = path_1.default.join(__dirname, "..", "modules");
    fs_1.default.readdirSync(modulesPath).forEach((moduleName) => {
        const modulePath = path_1.default.join(modulesPath, moduleName);
        if (fs_1.default.lstatSync(modulePath).isDirectory()) {
            // Cari file route
            const routeFileTs = path_1.default.join(modulePath, `${moduleName}.routes.ts`);
            const routeFileJs = path_1.default.join(modulePath, `${moduleName}.routes.js`);
            let routes;
            if (fs_1.default.existsSync(routeFileTs)) {
                routes = require(routeFileTs).default;
            }
            else if (fs_1.default.existsSync(routeFileJs)) {
                routes = require(routeFileJs).default;
            }
            if (routes) {
                app.use(routes); // ⬅️ tanpa prefix otomatis
                console.log(`✅ Loaded ${moduleName} routes`);
            }
        }
    });
}
