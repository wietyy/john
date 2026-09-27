# Build stage
FROM oven/bun AS build
WORKDIR /app
COPY . .
RUN cd frontend && bun install && bun run build

# Run stage
FROM oven/bun AS run
WORKDIR /app
COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/backend ./backend
CMD ["bun", "run", "./backend/src/index.ts"]