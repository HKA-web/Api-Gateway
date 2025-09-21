import fs from "fs";
import path from "path";
import { Express } from "express";

export function loadRoutes(app: Express) {
  const modulesPath = path.join(__dirname, "..", "modules");

  fs.readdirSync(modulesPath).forEach((moduleName) => {
    const modulePath = path.join(modulesPath, moduleName);

    if (fs.lstatSync(modulePath).isDirectory()) {
      // Cari route file sesuai nama module
      const routeFile = path.join(modulePath, `${moduleName}.routes.ts`);
      const routeFileJs = path.join(modulePath, `${moduleName}.routes.js`);

      let routes;
      if (fs.existsSync(routeFile)) {
        routes = require(routeFile).default;
      } else if (fs.existsSync(routeFileJs)) {
        routes = require(routeFileJs).default;
      }

      if (routes) {
        const prefix = `/${moduleName}`;
        app.use(prefix, routes);
        console.log(`✅ Loaded ${moduleName} routes at ${prefix}`);
      }
    }
  });
}
