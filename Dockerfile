# ==========================================
# STAGE 1: Dependencies (Install packages)
# ==========================================
FROM node:20-alpine AS deps
# Alpine is a very lightweight Linux version. Pro devs use it to keep image size small.
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# ==========================================
# STAGE 2: Builder (Compile the Next.js app)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run the build command
RUN npm run build

# ==========================================
# STAGE 3: Production Server (Final minimal image)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js standalone server uses this port
ENV PORT=3000

# Security: Don't run as root user in production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Only copy the essential files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
