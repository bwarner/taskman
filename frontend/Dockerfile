# Install dependencies
FROM node:lts-alpine AS deps
RUN apk add --no-cache libc6-compat curl # Only include libc6-compat if needed
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev

# Build stage
FROM node:lts-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM node:lts-alpine AS runner
RUN apk add --no-cache dumb-init redis curl
ENV NODE_ENV=production
ENV PORT 3000
WORKDIR /usr/src/app

# Copy only production dependencies (recommended)
COPY --from=builder /usr/src/app/node_modules ./node_modules
RUN npm prune --production

# Copy built artifacts (CRUCIAL)
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next 
RUN chown -R node:node .
USER node
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider --tries=1 http://localhost:3000/api/healthcheck || exit 1

ENV NEXT_TELEMETRY_DISABLED=1
CMD ["dumb-init", "node_modules/.bin/next", "start"] 