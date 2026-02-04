# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
# Delete prepare script to avoid husky issues, install ALL deps for build
RUN npm pkg delete scripts.prepare && npm ci
# Install openssl for Prisma
RUN apk add --no-cache openssl
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
# Install only production deps
RUN npm pkg delete scripts.prepare && npm ci --omit=dev && npm cache clean --force
# Install openssl for Prisma
RUN apk add --no-cache openssl
# Copy compiled output from builder
COPY --from=builder /app/dist ./dist
# Regenerate prisma client for production
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]