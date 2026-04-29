# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.11-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run codegen
RUN bun run build
RUN bun build src/server/index.ts --target=bun --compile --outfile dist/honcho-dashboard

# Verify the expected outputs exist before promoting to runtime.
RUN test -x dist/honcho-dashboard && test -d build

FROM alpine:3.22 AS runtime
WORKDIR /app

RUN apk add --no-cache ca-certificates libstdc++

COPY --from=build --chown=65532:65532 /app/dist/honcho-dashboard ./dist/honcho-dashboard
COPY --from=build --chown=65532:65532 /app/build ./build

USER 65532:65532

ENV NODE_ENV=production
ENV PORT=3000
ENV BUILD_DIR=./build

EXPOSE 3000

CMD ["./dist/honcho-dashboard"]
