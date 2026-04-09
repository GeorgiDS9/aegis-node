# Use Node 20 Alpine for minimal footprint
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for caching)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the project
COPY . .

# Expose the Next.js port
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "dev"]