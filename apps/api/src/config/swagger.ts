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
    if (!fs.existsSync(swaggerPath)) {
      throw new Error("swagger.json not found. Run generate-swagger.ts before starting.");
    }
    return JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));
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