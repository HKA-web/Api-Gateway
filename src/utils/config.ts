import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { z } from "zod";

const filePath = path.join(__dirname, "..", "..", "config.yaml");
const file = fs.readFileSync(filePath, "utf8");
const parsed = yaml.load(file);

// semua key string, semua value bebas
const ConfigSchema = z.record(z.string(), z.any());

const config = ConfigSchema.parse(parsed);

export default config;
