import fs from "fs";
import path from "path";

const output: any = {
  openapi: "3.0.0",
  info: { title: "API Gateway", version: "1.0.0" },
  paths: {}
};

const modulesPath = path.join(__dirname, "modules");

// scan folder modules
fs.readdirSync(modulesPath).forEach((mod) => {
  const filePath = path.join(modulesPath, mod, `${mod}.openapi.json`);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    Object.assign(output.paths, content.paths);
    console.log(`✅ Loaded OpenAPI for module: ${mod}`);
  } else {
    console.warn(`⚠️  No OpenAPI file found for module: ${mod}`);
  }
});

// output ke root project (di luar src)
const outputPath = path.join(__dirname, "..", "openapi.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`📄 openapi.json generated at ${outputPath}`);
