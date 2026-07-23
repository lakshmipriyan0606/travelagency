FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose port
EXPOSE 5000

# Start application in PM2 cluster mode
CMD ["pm2-runtime", "ecosystem.config.cjs", "--env", "production"]
