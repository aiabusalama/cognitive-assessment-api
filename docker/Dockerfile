# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# 1. First copy only package files
COPY package.json package-lock.json* ./

# 2. npm install 
RUN npm install 

# 3. Copy remaining files
COPY . .

# 4. Build the app
RUN npm run build


# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/main"]
