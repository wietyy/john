# Build stage
FROM oven/bun AS build
WORKDIR /app
COPY . .
RUN cd frontend && bun install && bun run build

# Run stage
FROM oven/bun AS run
WORKDIR /app
RUN apt-get update && apt-get install -y sqlite3
COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/backend ./backend
COPY --from=build /app/schema.sql ./schema.sql
RUN mkdir -p /db/
RUN cat /app/schema.sql | sqlite3 /db/database.db
ENV DATABASE=/db/database.db
CMD ["bun", "run", "./backend/src/index.ts"]