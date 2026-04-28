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

FROM scratch AS runtime
WORKDIR /app

COPY --from=build /lib/ld-musl-x86_64.so.1 /lib/ld-musl-x86_64.so.1
COPY --from=build /usr/lib/libgcc_s.so.1 /usr/lib/libgcc_s.so.1
COPY --from=build /usr/lib/libstdc++.so.6 /usr/lib/libstdc++.so.6
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build --chown=65532:65532 /app/dist/honcho-dashboard ./dist/honcho-dashboard
COPY --from=build --chown=65532:65532 /app/build ./build

USER 65532:65532

ENV LD_LIBRARY_PATH=/usr/lib

ENV NODE_ENV=production
ENV PORT=3000
ENV BUILD_DIR=./build

EXPOSE 3000

CMD ["./dist/honcho-dashboard"]
