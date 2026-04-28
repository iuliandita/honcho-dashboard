# syntax=docker/dockerfile:1.7

FROM oven/bun:1-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run codegen
RUN bun run build

# Verify the expected outputs exist before promoting to runtime.
RUN test -f dist/index.js && test -d build

FROM oven/bun:1-alpine AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=build --chown=app:app /app/build ./build

USER app

ENV NODE_ENV=production
ENV PORT=3000
ENV BUILD_DIR=./build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/healthz >/dev/null 2>&1 || exit 1

CMD ["bun", "run", "dist/index.js"]
