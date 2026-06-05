import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

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
        description: "Yapwrap API",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session-token", // Better Auth default cookie name
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.controller.ts"], // Scan these files for annotations
};

export const swaggerSpec = swaggerJsdoc(options);
