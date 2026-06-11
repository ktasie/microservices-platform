# Use a small Node image
FROM node:24.12-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy your app source
COPY . .


# Optional but nice: don't run as root
# (Alpine node image already has "node" user)
USER node

EXPOSE 4004

# Start your SSR server
CMD ["node", "app.js"]
