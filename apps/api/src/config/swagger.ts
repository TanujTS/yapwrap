import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to pre-generated swagger JSON
// We try multiple locations to be robust against different CWDs and build structures
const getSwaggerJsonPath = () => {
  const possiblePaths = [
    path.join(process.cwd(), "dist", "swagger.json"),
    path.join(process.cwd(), "swagger.json"),
    path.resolve(__dirname, "../../dist/swagger.json"),
    path.resolve(__dirname, "../swagger.json"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const getSwaggerSpec = () => {
  const swaggerJsonPath = getSwaggerJsonPath();
  const isProduction = env.NODE_ENV === "production";

  // Use pre-generated JSON if in production and it exists
  if (isProduction && swaggerJsonPath) {
    try {
      const content = fs.readFileSync(swaggerJsonPath, "utf-8");
      console.log(`Loaded swagger spec from ${swaggerJsonPath}`);
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to load pre-generated swagger.json", e);
    }
  }

  // Otherwise generate from source (in development or during build)
  console.log("Generating swagger spec from source files...");
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Yapwrap API",
        version: "1.0.0",
        description: "API documentation for the Yapwrap meeting analysis platform",
      },
      servers: [
        {
          url: env.AUTH_BASE_URL,
          description: "API Base URL",
        },
        {
          url: `http://localhost:${env.PORT}`,
          description: "Local Development",
        },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "better-auth.session-token",
          },
        },
      },
      security: [
        {
          cookieAuth: [],
        },
      ],
    },
    apis: [
      // Standard paths relative to this config file
      path.join(__dirname, "../modules/**/*.routes.ts"),
      path.join(__dirname, "../modules/**/*.controller.ts"),
      // Fallback to process.cwd() for flexibility
      path.join(process.cwd(), "src/modules/**/*.routes.ts"),
      path.join(process.cwd(), "src/modules/**/*.controller.ts"),
      path.join(process.cwd(), "apps/api/src/modules/**/*.routes.ts"),
      path.join(process.cwd(), "apps/api/src/modules/**/*.controller.ts"),
    ],
  };

  const spec = swaggerJsdoc(options) as any;
  
  // Basic validation to ensure we actually found some routes
  if (spec.paths && Object.keys(spec.paths).length === 0 && !isProduction) {
    console.warn("⚠️ Swagger generation found 0 paths. Check your 'apis' glob patterns.");
  }

  return spec;
};

export const swaggerSpec = getSwaggerSpec();

