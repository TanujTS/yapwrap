import swaggerJsdoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getSwaggerSpec = () => {
  if (env.NODE_ENV === "production") {
    const swaggerPath = path.join(process.cwd(), "dist", "swagger.json");
    console.log("📍 Current working directory:", process.cwd());
    console.log("🔍 Looking for swagger.json at:", swaggerPath);
    
    if (!fs.existsSync(swaggerPath)) {
      console.error("❌ File not found!");
      throw new Error("swagger.json not found. Run generate-swagger.ts before starting.");
    }
    
    const content = fs.readFileSync(swaggerPath, "utf-8");
    const parsed = JSON.parse(content);
    const pathCount = Object.keys(parsed.paths || {}).length;
    console.log(`✅ Loaded swagger.json with ${pathCount} paths`);
    console.log("📋 Paths found:", Object.keys(parsed.paths || {}).slice(0, 5));
    
    return parsed;
  }

  return swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: { title: "Yapwrap API", version: "1.0.0" },
      servers: [{ url: env.AUTH_BASE_URL }],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "better-auth.session-token",
          },
        },
      },
      security: [{ cookieAuth: [] }],
    },
    apis: [
      path.join(__dirname, "../modules/**/*.routes.ts"),
    ],
  });
};

export const swaggerSpec = getSwaggerSpec();