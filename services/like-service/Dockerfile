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
ENV PORT=4003

# Internal backend gateway base URL (override in Azure Container Apps env vars)
# Example in ACA: http://backend:4000
ENV MONGO_HOST=host.docker.internal
ENV MONGO_PORT=27017
ENV MONGO_USER=
ENV MONGO_PASS=
ENV MONGO_DB=like_service
ENV COSMOS_STRING=

# Optional but nice: don't run as root
# (Alpine node image already has "node" user)
USER node

EXPOSE 4003

# Start your SSR server
CMD ["node", "app.js"]
