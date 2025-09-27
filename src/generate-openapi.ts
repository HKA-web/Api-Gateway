import fs from "fs";
import path from "path";

const output: any = {
  openapi: "3.0.0",
  info: { title: "API Gateway", version: "1.0.0" },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {}
};

const modulesPath = path.join(__dirname, "modules");

// scan folder modules
fs.readdirSync(modulesPath).forEach((mod) => {
  const filePath = path.join(modulesPath, mod, `${mod}.openapi.json`);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // merge tiap path, tapi biarkan masing2 file yang atur security
    Object.entries(content.paths).forEach(([p, def]) => {
      output.paths[p] = def;
    });

    console.log(`✅ Loaded OpenAPI for module: ${mod}`);
  } else {
    console.warn(`⚠️  No OpenAPI file found for module: ${mod}`);
  }
});

// output ke root project (di luar src)
const outputPath = path.join(__dirname, "..", "openapi.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`📄 openapi.json generated at ${outputPath}`);
