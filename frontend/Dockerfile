# Use a small Node image
FROM node:24.12-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy your app source
COPY . .

# Azure Container Apps will route ingress to this port
ENV NODE_ENV=production
ENV PORT=3000

# Internal backend gateway base URL (override in Azure Container Apps env vars)
# Example in ACA: http://backend:4000
ENV API_GATEWAY=http://api-gateway:4000
# ENV GW_PORT=4000
ENV API_BASE_URL=http://localhost:4000
ENV FRONTEND_URL=http://localhost:3000

# Optional but nice: don't run as root
# (Alpine node image already has "node" user)
USER node

EXPOSE 3000

# Start your SSR server
CMD ["node", "app.js"]
