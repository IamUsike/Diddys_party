# Use Node as base
FROM node:lts

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

WORKDIR /app/server
# Build Next.js app
RUN npm run build

# Expose both backend and frontend ports
# Next.js default port
EXPOSE 3000
# Add your MongoDB/backend port (adjust if different)
EXPOSE 8080

# Run both backend and frontend
CMD ["npm", "run", "start:all"]

