import { swaggerSpec } from "./src/config/swagger";
import fs from "fs";
import path from "path";

const distDir = path.join(process.cwd(), "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const outputPath = path.join(distDir, "swagger.json");
fs.writeFileSync(
  outputPath,
  JSON.stringify(swaggerSpec, null, 2)
);

const pathCount = Object.keys(swaggerSpec.paths || {}).length;
console.log(`✅ Swagger documentation generated to ${outputPath}`);
console.log(`📊 Found ${pathCount} API paths.`);

if (pathCount === 0) {
  console.warn("⚠️ Warning: Generated swagger.json is empty (0 paths).");
}
