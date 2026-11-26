FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm install --package-lock-only --ignore-scripts --no-audit --no-fund && npm ci --no-audit --no-fund
RUN node -e "const l=require('node:fs').readFileSync('package-lock.json').toString('base64'); for(let i=0;i<l.length;i+=1000) console.log('AXYON_OTEL_LOCK_'+String(i/1000).padStart(4,'0')+' '+l.slice(i,i+1000)); console.log('AXYON_OTEL_LOCK_COUNT '+Math.ceil(l.length/1000))"
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
