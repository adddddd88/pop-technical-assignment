FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Copy source code
COPY . .

# Expose API port
EXPOSE 3102

# Default command — API server
CMD ["node", "src/index.js"]