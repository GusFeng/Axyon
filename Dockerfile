FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json tsconfig.json ./
# A lockfile must be generated and committed after access to npm is available.
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY src ./src
COPY tools ./tools
RUN npm run build && npm run typecheck && npm test && npm run check:boundaries
RUN npm prune --omit=dev --no-audit --no-fund
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN mkdir -p /data && chown node:node /data
USER node
CMD ["node","dist/bot.js"]
