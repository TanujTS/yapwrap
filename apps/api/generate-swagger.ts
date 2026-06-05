import swaggerJsdoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    info: { title: "Yapwrap API", version: "1.0.0" },
    servers: [
      { url: "https://yapwrap-api.tanujts.me", description: "Production" },
      { url: "http://localhost:8000", description: "Local" },
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
    security: [{ cookieAuth: [] }],
  },
  apis: ["./src/modules/**/*.routes.ts"],
};

const spec = swaggerJsdoc(options);

const distDir = path.join(process.cwd(), "dist");
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

fs.writeFileSync(
  path.join(distDir, "swagger.json"),
  JSON.stringify(spec, null, 2)
);

console.log(`✅ swagger.json generated with ${Object.keys((spec as any).paths || {}).length} paths`);