import express from "express";
import bodyParser from "body-parser";
import { logger } from "./middlewares/logger";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { config } from "./utils/config";
import { loadRoutes } from "./utils/routeLoader";

const app = express();
app.use(bodyParser.json());
app.use(logger);

// Auto-load semua routes di /modules
loadRoutes(app);

// Root redirect
app.get("/", (req, res) => res.redirect("/docs"));

// Swagger
const swaggerFilePath = path.join(__dirname, "..", "openapi.json");
if (fs.existsSync(swaggerFilePath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, "utf-8"));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.warn("⚠️ openapi.json not found. Run `yarn ts-node generate-openapi.ts` first!");
}

app.listen(config.server.port, () =>
  console.log(`🚀 Server running on http://localhost:${config.server.port}`)
);
