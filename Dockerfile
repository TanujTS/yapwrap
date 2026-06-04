# Stage 1: Build
FROM oven/bun:1.3 AS build

WORKDIR /app

COPY apps/api/package.json ./
RUN bun install

COPY apps/api/ ./
RUN bun run build 

# Stage 2: Runtime
FROM oven/bun:1.3-slim

WORKDIR /app

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/dist dist

EXPOSE 8000

CMD ["bun", "run", "dist/index.js"]
