import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index"; // your drizzle instance
import { env } from "../config/env";
import * as schema from "../db/schema"

const webUrl = env.WEB_URL ?? "http://localhost:3000";
const authBaseUrl = env.AUTH_BASE_URL ?? `http://localhost:${env.PORT}`;

export const auth = betterAuth({
    baseURL: authBaseUrl,
    trustedOrigins: [webUrl],
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: schema
    }),
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET
        }
    },
    advanced: {
        database: {
            generateId: false,
        }
    },
    emailAndPassword: {
        enabled: true
    }
});
